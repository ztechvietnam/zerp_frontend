/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  App,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  Modal,
  Row,
  Spin,
  Switch,
  Tooltip,
  TreeSelect,
  Upload,
  UploadProps,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  buildCategoryTree,
  MEASSAGE,
} from "../../components/constant/constant";
import { last, pick } from "lodash";
import { DocumentEntity } from "../../common/services/document/document";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { RoleTreeNode } from "../../common/services/department/department";
import "./documentsManagement.css";
import { fileService } from "../../common/services/document/fileService";
import Dragger from "antd/es/upload/Dragger";
import { useSidebar } from "../../context/SidebarContext";
import { TreeNode } from "../../common/services/category/category";
import {
  iconExcel,
  iconImg,
  iconPdf,
  iconPp,
  iconWord,
} from "../../components/IconSvg/iconSvg";
import { branchesService } from "../../common/services/department/branches-service";
import { documentService } from "../../common/services/document/documentService";
import { useAuth } from "../../context/AuthContext";

export interface DocumentFormRef {
  show(currentItem?: DocumentEntity): Promise<void>;
}

interface DocumentFormProps {
  resetData: () => void;
}

export const DocumentForm = forwardRef<DocumentFormRef, DocumentFormProps>(
  ({ resetData }, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [currentDocument, setCurrentDocument] = useState<
      DocumentEntity | undefined
    >(undefined);
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const { message } = App.useApp();
    const [form] = useForm();
    const [linkFile, setLinkFile] = useState<string>("");
    const [formAttachs, setFormAttachs] = useState([
      { title: "", linkFile: "", fileList: [] as any[] },
    ]);
    const [treeDepartment, setTreeDepartment] = useState<RoleTreeNode[]>([]);
    const { listDocumentCategories } = useSidebar();
    const { currentUser } = useAuth();

    const handleAddFormAttach = () => {
      setFormAttachs((prev) => [
        ...prev,
        { title: "", linkFile: "", fileList: [] },
      ]);
    };

    const buildDepartmentTreeData = (branches: any[]): RoleTreeNode[] => {
      if (!Array.isArray(branches)) return [];
      return branches.map((branch) => {
        const branchNode: RoleTreeNode = {
          title: branch.name,
          value: `branch-${branch.id_branch}`,
          key: `branch-${branch.id_branch}`,
          selectable: false,
          children: [],
        };
        if (
          Array.isArray(branch.departments) &&
          branch.departments.length > 0
        ) {
          branchNode.children = branch.departments.map((dep) => {
            const departmentNode: RoleTreeNode = {
              title: dep.name,
              value: `department-${dep.id_department}`,
              key: `department-${dep.id_department}`,
              selectable: false,
              children: [],
            };
            if (Array.isArray(dep.users) && dep.users.length > 0) {
              departmentNode.children = dep.users.map((user) => ({
                title: `${user.lastName?.trim() || ""}${
                  user.firstName ? " " + user.firstName : ""
                }`.trim(),
                value: `user-${user.id}`,
                key: `user-${user.id}`,
                isLeaf: true,
                selectable: true,
              }));
            }
            return departmentNode;
          });
        }
        return branchNode;
      });
    };

    useEffect(() => {
      (async () => {
        const dataDepartment = await branchesService.findAllWithRelations();
        const treeData = buildDepartmentTreeData(dataDepartment.data);
        setTreeDepartment(treeData);
      })();
    }, []);

    useEffect(() => {
      setLoading(true);
      const treeCate = buildCategoryTree(listDocumentCategories, true);
      setTreeData(treeCate);
      setLoading(false);
    }, [listDocumentCategories]);

    const getIcon = (fileName?: string) => {
      const text = last(fileName?.split("."))?.toLowerCase();
      switch (text) {
        case "pdf":
          return iconPdf;
        case "docx":
        case "doc":
          return iconWord;
        case "xlsx":
        case "xlsm":
        case "xlsb":
        case "xls":
        case "xlt":
          return iconExcel;
        case "pptx":
          return iconPp;
        case "jpg":
        case "jpeg":
        case "png":
        case "svg":
          return iconImg;
        default:
          return iconPdf;
      }
    };

    const getBorder = (fileName?: string) => {
      const text = last(fileName?.split("."))?.toLowerCase();
      switch (text) {
        case "pdf":
          return "#e50012";
        case "docx":
        case "doc":
          return "#185abd";
        case "xlsx":
        case "xlsm":
        case "xlsb":
        case "xls":
        case "xlt":
          return "#107c41";
        case "pptx":
          return "#d35230";
        case "jpg":
        case "jpeg":
        case "png":
        case "svg":
          return "#78320A";
        default:
          return "#e50012";
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        show: async (currentItem?: DocumentEntity) => {
          setLoading(true);
          setShowModal(true);
          if (currentItem) {
            setCurrentDocument(currentItem);
            const formControlValues = pick(currentItem, [
              "title",
              "description",
              "code",
              "file",
              "status",
              "is_featured",
              "template",
            ]);
            setLinkFile(currentItem.file || "");
            if (
              currentItem.document_attachment &&
              currentItem.document_attachment?.length
            ) {
              setFormAttachs(
                currentItem.document_attachment.map((atm) => {
                  return {
                    ...atm,
                    fileList: [],
                  };
                })
              );
            } else {
              setFormAttachs([]);
            }
            setTimeout(() => {
              form.setFieldsValue(formControlValues);
              form.setFieldValue(
                "category_id",
                currentItem.category_id.toString()
              );
            }, 0);
          }
          setLoading(false);
        },
      }),
      []
    );

    const uploadDocumentAttachment = useCallback(
      async (attachments: any[] = formAttachs) => {
        if (!attachments.length) return [];

        const results = await Promise.all(
          attachments.map(async (attachment) => {
            if (attachment.fileList && attachment.fileList.length > 0) {
              const formData = new FormData();
              formData.append(
                "file",
                attachment.fileList[0].originFileObj || attachment.fileList[0]
              );
              const res = await fileService.uploadFile(formData);
              return {
                title: attachment.title,
                linkFile: res.file.path,
              };
            }
            return undefined;
          })
        );

        return results.filter(Boolean);
      },
      [formAttachs]
    );

    const onOK = async (valueForm: any) => {
      if (currentDocument) {
        try {
          const oldAttachments = currentDocument.document_attachment || [];
          const newAttachments = formAttachs.filter(
            (a) => !a.linkFile && a.fileList && a.fileList.length > 0
          );
          const currentTitles = formAttachs.map((a) => a.title);
          const keptAttachments = oldAttachments.filter((old) =>
            currentTitles.includes(old.title)
          );
          const uploadedNewAttachments = await uploadDocumentAttachment(
            newAttachments
          );

          const finalAttachments = [
            ...keptAttachments,
            ...uploadedNewAttachments,
          ];
          const document = {
            ...valueForm,
            status: valueForm.status ? 1 : 0,
            is_featured: valueForm.is_featured ? 1 : 0,
            category_id: parseInt(valueForm.category_id),
            file: currentDocument.file,
            document_attachment: finalAttachments || [],
          };
          await documentService.patch(document, {
            endpoint: `/${currentDocument.id_document.toString()}`,
          });
          message.success("Chỉnh sửa văn bản thành công!");
          closeModal();
          if (resetData) {
            resetData();
          }
        } catch (err) {
          console.error(err);
          message.error("Chỉnh sửa văn bản thất bại!");
        }
      } else {
        const fileList = valueForm.file;
        if (!fileList || fileList.length === 0) {
          message.warning("Vui lòng chọn file trước khi lưu");
          return;
        }

        const formData = new FormData();
        formData.append("file", fileList.fileList[0].originFileObj);

        try {
          const res = await fileService.uploadFile(formData);
          const documentAttachment = await uploadDocumentAttachment();
          const document = {
            ...valueForm,
            status: valueForm.status ? 1 : 0,
            is_featured: valueForm.is_featured ? 1 : 0,
            category_id: parseInt(valueForm.category_id),
            file: res.file.path,
            document_attachment: documentAttachment || [],
            id_department: currentUser?.department?.id_department || null,
          };
          await documentService.post(document);
          message.success("Thêm mới văn bản thành công!");
          closeModal();
          if (resetData) {
            resetData();
          }
        } catch (err) {
          console.error(err);
          message.error("Thêm mới văn bản thất bại!");
        }
      }
    };

    const closeModal = () => {
      setShowModal(false);
      setLinkFile("");
      setFormAttachs([{ title: "", linkFile: "", fileList: [] as any[] }]);
      setSelectedUserIds([]);
      setCurrentDocument(undefined);
      form.resetFields();
    };

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const uploadProps: UploadProps = {
      maxCount: 1,
      accept: ".pdf,.doc,.docx,.xls,.xlsx",
      beforeUpload: (file: File) => {
        if (!allowedTypes.includes(file.type)) {
          message.error("Chỉ cho phép file PDF, Word hoặc Excel!");
          return Upload.LIST_IGNORE;
        }
        return false;
      },
    };

    const uploadMultiProps: UploadProps = {
      multiple: true,
      showUploadList: false,
      openFileDialogOnClick: false,
      beforeUpload: (file: File) => {
        if (!allowedTypes.includes(file.type)) {
          message.error("Chỉ cho phép file PDF, Word hoặc Excel!");
          return Upload.LIST_IGNORE;
        }
        return false;
      },
      onDrop(e) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (!droppedFiles.length) return;

        setFormAttachs((prev) => {
          const updated = [...prev];
          const emptyIndexes = updated
            .map((item, index) =>
              item.title === "" && item.fileList.length === 0 ? index : -1
            )
            .filter((i) => i !== -1);

          let fileIndex = 0;

          for (const idx of emptyIndexes) {
            if (fileIndex >= droppedFiles.length) break;
            const f = droppedFiles[fileIndex++];
            updated[idx] = {
              ...updated[idx],
              title: f.name.replace(/\.[^/.]+$/, ""),
              linkFile: "",
              fileList: [f],
            };
          }

          if (fileIndex < droppedFiles.length) {
            const remainFiles = droppedFiles.slice(fileIndex);
            const newAttachs = remainFiles.map((f) => ({
              title: f.name.replace(/\.[^/.]+$/, ""),
              linkFile: "",
              fileList: [f],
            }));
            updated.push(...newAttachs);
          }

          return updated;
        });

        message.success(`Đã thêm ${droppedFiles.length} biểu mẫu`);
      },
    };

    const collapseItems = formAttachs.map((form, index) => ({
      key: index,
      label: `Biểu mẫu ${index + 1}`,
      extra: (
        <Tooltip title="Xoá biểu mẫu">
          <Button
            className="!px-[10px]"
            variant="outlined"
            color="red"
            onClick={(e) => {
              e.stopPropagation();
              setFormAttachs((prev) => prev.filter((_, i) => i !== index));
            }}
          >
            <DeleteOutlined />
          </Button>
        </Tooltip>
      ),
      children: (
        <Row gutter={24}>
          <Col xs={24} sm={24} md={24} lg={12}>
            <div className="flex flex-col gap-[2px]">
              <div className="flex items-center">
                Tiêu đề biểu mẫu {index + 1}
              </div>
              <Input
                style={{ width: "100%" }}
                placeholder="Nhập tiêu đề biểu mẫu"
                value={form.title}
                onChange={(e) => {
                  const newForms = formAttachs.map((f, indexAtm) =>
                    indexAtm === index ? { ...f, title: e.target.value } : f
                  );
                  setFormAttachs(newForms);
                }}
              />
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12}>
            <div className="flex flex-col gap-[2px]">
              <div className="flex items-center">
                Tài liệu biểu mẫu {index + 1}
              </div>
              {form.linkFile ? (
                <Tooltip title={last(form.linkFile.split("/"))}>
                  <div
                    style={{
                      border: `1px solid ${getBorder(
                        last(form.linkFile.split("/"))
                      )}`,
                    }}
                    className="flex flex-[0_1_auto] w-fit max-w-full px-[10px] py-1 items-center rounded-lg bg-white gap-[10px] cursor-pointer overflow-hidden"
                  >
                    <div className="flex w-[24px] h-[22px]">
                      {getIcon(last(form.linkFile.split("/")))}
                    </div>
                    <div className="text-[#000000e0] text-[14px] not-italic font-normal leading-normal whitespace-nowrap overflow-hidden min-w-0 text-ellipsis">
                      {last(form.linkFile.split("/"))}
                    </div>
                  </div>
                </Tooltip>
              ) : (
                <Upload
                  {...uploadProps}
                  fileList={form.fileList as any}
                  onRemove={(file) => {
                    const newForms = formAttachs.map((f, indexAtm) =>
                      indexAtm === index
                        ? {
                            ...f,
                            fileList: f.fileList.filter(
                              (fl) => fl.uid !== file.uid
                            ),
                          }
                        : f
                    );
                    setFormAttachs(newForms);
                  }}
                  beforeUpload={(file) => {
                    const newForms = formAttachs.map((f, indexAtm) =>
                      indexAtm === index ? { ...f, fileList: [file] } : f
                    );
                    setFormAttachs(newForms);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Chọn file</Button>
                </Upload>
              )}
            </div>
          </Col>
        </Row>
      ),
    }));

    return (
      <Modal
        title={currentDocument ? "Chỉnh sửa văn bản" : "Thêm mới văn bản"}
        onCancel={() => closeModal()}
        width={1200}
        className="!top-[24px]"
        open={showModal}
        closable={loading ? false : true}
        onOk={async () => {
          try {
            const valueForm = await form.validateFields();
            onOK(valueForm);
          } catch (e) {
            console.log(e);
          }
        }}
        okText={currentDocument ? MEASSAGE.SAVE : MEASSAGE.CREATE}
        cancelText={currentDocument ? MEASSAGE.CANCEL : MEASSAGE.CLOSE}
        maskClosable={false}
      >
        <Spin spinning={loading}>
          <Form layout="horizontal" form={form} style={{ padding: 12 }}>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Tiêu đề"
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <Input
                    style={{ width: "100%" }}
                    placeholder={"Nhập tiêu đề"}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Mô tả"
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <Input.TextArea
                    style={{ width: "100%" }}
                    placeholder={"Nhập mô tả"}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={12}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Mã hiệu văn bản"
                  name="code"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <Input
                    style={{ width: "100%" }}
                    placeholder={"Nhập mã hiệu văn bản"}
                  />
                </Form.Item>
              </Col>
              {!currentDocument && !linkFile ? (
                <Col xs={24} sm={24} md={24} lg={12}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    label="Tài liệu"
                    name="file"
                    rules={[
                      {
                        required: true,
                        message: "Trường yêu cầu nhập!",
                      },
                    ]}
                  >
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>
                        Tải tài liệu lên (PDF, Word, Excel)
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              ) : (
                <Col xs={24} sm={24} md={24} lg={12}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    label="Tài liệu"
                  >
                    <Tooltip title={last(linkFile.split("/"))}>
                      <div
                        style={{
                          border: `1px solid ${getBorder(
                            last(linkFile.split("/"))
                          )}`,
                        }}
                        className="flex flex-[0_1_auto] w-fit max-w-full px-[10px] py-1 items-center rounded-lg bg-white gap-[10px] cursor-pointer overflow-hidden"
                      >
                        <div className="flex w-[24px] h-[22px]">
                          {getIcon(last(linkFile.split("/")))}
                        </div>
                        <div className="text-[#000000e0] text-[14px] not-italic font-normal leading-normal whitespace-nowrap overflow-hidden min-w-0 text-ellipsis">
                          {last(linkFile.split("/"))}
                        </div>
                      </div>
                    </Tooltip>
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={12}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Danh mục văn bản"
                  name="category_id"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <TreeSelect
                    treeData={treeData}
                    showSearch
                    placeholder="Chọn danh mục văn bản"
                    styles={{
                      popup: { root: { maxHeight: 400, overflow: "auto" } },
                    }}
                    filterTreeNode={(inputValue: string, treeNode: any) => {
                      const title =
                        typeof treeNode.title === "string"
                          ? treeNode.title
                          : "";
                      return title
                        .toLocaleLowerCase()
                        .includes(inputValue?.trim().toLocaleLowerCase());
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={6}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Trạng thái"
                  name="status"
                  initialValue={true}
                >
                  <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={6}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Tài liệu nổi bật"
                  name="is_featured"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={24}>
                <Dragger
                  {...uploadMultiProps}
                  className="dragger-template-document"
                >
                  <Card
                    title={
                      <div className="flex justify-between items-center">
                        <span>
                          Các biểu mẫu (Có thể kéo file vào khu vực này để thêm
                          nhanh biểu mẫu)
                        </span>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddFormAttach}
                        >
                          Thêm biểu mẫu
                        </Button>
                      </div>
                    }
                    type="inner"
                    className="shadow-[0_-2px_10px_-2px_rgba(0,0,0,0.05),-2px_0_10px_-2px_rgba(0,0,0,0.05),2px_0_10px_-2px_rgba(0,0,0,0.05)] rounded-lg"
                  >
                    <Collapse
                      items={collapseItems}
                      expandIconPosition="start"
                      defaultActiveKey={0}
                      accordion={false}
                      className="collapseTemplate"
                    />
                  </Card>
                </Dragger>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} className="mt-[24px]">
                <Card
                  title="Phân quyền văn bản"
                  className="!mt-[10px] lg:!mt-0 shadow-[0_-2px_10px_-2px_rgba(0,0,0,0.05),-2px_0_10px_-2px_rgba(0,0,0,0.05),2px_0_10px_-2px_rgba(0,0,0,0.05)] rounded-lg"
                  type="inner"
                >
                  <TreeSelect
                    treeData={treeDepartment}
                    value={selectedUserIds}
                    onChange={(values) => {
                      console.log(values);
                      setSelectedUserIds(values);
                    }}
                    treeCheckable
                    showCheckedStrategy={TreeSelect.SHOW_PARENT}
                    placeholder="Chọn người dùng được phép truy cập"
                    allowClear
                    style={{ width: "100%" }}
                    treeDefaultExpandAll
                    maxTagCount="responsive"
                  />
                </Card>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
);
