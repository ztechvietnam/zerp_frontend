/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  Modal,
  Row,
  Spin,
  Switch,
  Tag,
  TreeSelect,
  Upload,
  UploadProps,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { MEASSAGE } from "../../components/constant/constant";
import { compact, pick } from "lodash";
import { DocumentEntity } from "../../common/services/document/document";
import { UploadOutlined } from "@ant-design/icons";
import { TreeSelectNode } from "./DocumentsManagement";
import { DepartmentTreeNode } from "../../common/services/department/department";
import "./documentsManagement.css";

export interface DocumentFormRef {
  show(currentItem?: DocumentEntity): Promise<void>;
}

interface DocumentFormProps {
  treeCategory: TreeSelectNode[];
  treeDepartment: DepartmentTreeNode[];
  resetData: () => void;
}

export const DocumentForm = forwardRef<DocumentFormRef, DocumentFormProps>(
  ({ treeCategory, treeDepartment, resetData }, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [currentDocument, setCurrentDocument] = useState<
      DocumentEntity | undefined
    >(undefined);
    const { message } = App.useApp();
    const [form] = useForm();

    useImperativeHandle(
      ref,
      () => ({
        show: async (currentItem?: DocumentEntity) => {
          setLoading(true);
          setShowModal(true);
          if (currentItem) {
            setCurrentDocument(currentItem);
            const formControlValues = pick(currentItem, [
              "name",
              "description",
              "code",
              "file",
              "category",
              "status",
              "isFeatured",
              "template",
            ]);
            setTimeout(() => {
              form.setFieldsValue(formControlValues);
            }, 0);
          }
          setLoading(false);
        },
      }),
      []
    );

    const onOK = async (valueForm: any) => {
      console.log(valueForm);
      message.success(
        currentDocument ? "Chỉnh sửa thành công" : "Thêm mới thành công"
      );
      if (resetData) {
        resetData();
      }
    };

    const closeModal = () => {
      setShowModal(false);
      setSelectedUserIds([]);
      setCurrentDocument(undefined);
      form.resetFields();
    };

    const handleCheckboxChange = (userId: string, checked: boolean) => {
      setSelectedUserIds((prev) => {
        let newSelected;
        if (checked) {
          newSelected = [...prev, userId];
        } else {
          newSelected = prev.filter((id) => id !== userId);
        }

        return newSelected;
      });
    };

    const handleSelectAllInChild = (child: any, checked: boolean) => {
      const childUserIds = (child.users || []).map((u: any) => u.id);

      setSelectedUserIds((prev) => {
        let newSelected;
        if (checked) {
          newSelected = Array.from(new Set([...prev, ...childUserIds]));
        } else {
          newSelected = prev.filter((id) => !childUserIds.includes(id));
        }

        return newSelected;
      });
    };

    const allowedTypes = [
      "application/pdf", // PDF
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];

    const uploadProps: UploadProps = {
      beforeUpload: (file) => {
        const isAllowed = allowedTypes.includes(file.type);
        if (!isAllowed) {
          message.error(
            `${file.name} không đúng định dạng (chỉ tải lên PDF, Word, Excel)`
          );
        }
        return isAllowed || Upload.LIST_IGNORE;
      },
      onChange: (info) => {
        console.log(info.fileList);
      },
    };

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
                  name="name"
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
                  <Input
                    style={{ width: "100%" }}
                    placeholder={"Nhập mô tả"}
                    maxLength={255}
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
            </Row>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={12}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Danh mục văn bản"
                  name="category"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <TreeSelect
                    treeData={treeCategory}
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
                  name="isFeatured"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={16}>
                <Card
                  title="Các biểu mẫu (nếu có)"
                  type="inner"
                  className="shadow-[0_-2px_10px_-2px_rgba(0,0,0,0.05),-2px_0_10px_-2px_rgba(0,0,0,0.05),2px_0_10px_-2px_rgba(0,0,0,0.05)] rounded-lg"
                >
                  <Collapse
                    items={[
                      {
                        key: "1",
                        label: "Biểu mẫu 1",
                        children: (
                          <Row gutter={24}>
                            <Col xs={24} sm={24} md={24} lg={12}>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center">
                                  Tiêu đề biểu mẫu 1
                                </div>
                                <Input
                                  style={{ width: "100%" }}
                                  placeholder={"Nhập tiêu đề biểu mẫu 1"}
                                />
                              </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12}>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center">
                                  Tài liệu biểu mẫu 1
                                </div>
                                <Upload {...uploadProps}>
                                  <Button icon={<UploadOutlined />}>
                                    Tải tài liệu lên (PDF, Word, Excel)
                                  </Button>
                                </Upload>
                              </div>
                            </Col>
                          </Row>
                        ),
                      },
                      {
                        key: "2",
                        label: "Biểu mẫu 2",
                        children: (
                          <Row gutter={24}>
                            <Col xs={24} sm={24} md={24} lg={12}>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center">
                                  Tiêu đề biểu mẫu 2
                                </div>
                                <Input
                                  style={{ width: "100%" }}
                                  placeholder={"Nhập tiêu đề biểu mẫu 2"}
                                />
                              </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12}>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center">
                                  Tài liệu biểu mẫu 2
                                </div>
                                <Upload {...uploadProps}>
                                  <Button icon={<UploadOutlined />}>
                                    Tải tài liệu lên (PDF, Word, Excel)
                                  </Button>
                                </Upload>
                              </div>
                            </Col>
                          </Row>
                        ),
                      },
                      {
                        key: "3",
                        label: "Biểu mẫu 3",
                        children: (
                          <Row gutter={24}>
                            <Col xs={24} sm={24} md={24} lg={12}>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center">
                                  Tiêu đề biểu mẫu 3
                                </div>
                                <Input
                                  style={{ width: "100%" }}
                                  placeholder={"Nhập tiêu đề biểu mẫu 3"}
                                />
                              </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12}>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center">
                                  Tài liệu biểu mẫu 3
                                </div>
                                <Upload {...uploadProps}>
                                  <Button icon={<UploadOutlined />}>
                                    Tải tài liệu lên (PDF, Word, Excel)
                                  </Button>
                                </Upload>
                              </div>
                            </Col>
                          </Row>
                        ),
                      },
                    ]}
                    expandIconPosition="end"
                    defaultActiveKey={"1"}
                    accordion
                    className="collapseTemplate"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <Card
                  title="Phân quyền văn bản"
                  className="!mt-[10px] lg:!mt-0 shadow-[0_-2px_10px_-2px_rgba(0,0,0,0.05),-2px_0_10px_-2px_rgba(0,0,0,0.05),2px_0_10px_-2px_rgba(0,0,0,0.05)] rounded-lg"
                  type="inner"
                  extra={
                    <Checkbox
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allUserIds = treeDepartment
                            .flatMap((node) =>
                              node.children?.flatMap(
                                (child) => child.users?.map((u) => u.id) || []
                              )
                            )
                            .filter(Boolean);
                          setSelectedUserIds(compact(allUserIds));
                        } else {
                          setSelectedUserIds([]);
                        }
                      }}
                      checked={treeDepartment
                        .flatMap((node) =>
                          node.children?.flatMap(
                            (child) => child.users?.map((u) => u.id) || []
                          )
                        )
                        .filter(Boolean)
                        .every((u: any) => selectedUserIds.includes(u))}
                    >
                      Tất cả
                    </Checkbox>
                  }
                >
                  <Collapse
                    items={treeDepartment?.map((node, index) => {
                      return {
                        key: index.toString(),
                        label: node.item.name,
                        children: (
                          <div className="flex flex-col justify-start">
                            {node.children &&
                              node.children.length &&
                              node.children.map((child) => {
                                return (
                                  <div className="flex flex-col">
                                    <Tag
                                      color="#108ee9"
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        padding: "2px 5px",
                                        margin: "5px 0",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => {
                                        const allSelectedInChild =
                                          child.users?.every((u) =>
                                            selectedUserIds.includes(u.id)
                                          );
                                        handleSelectAllInChild(
                                          child,
                                          !allSelectedInChild
                                        );
                                      }}
                                    >
                                      {child.item.name}
                                    </Tag>
                                    {child.users &&
                                      child.users.length > 0 &&
                                      child.users.map((user) => {
                                        return (
                                          <Checkbox
                                            key={user.id}
                                            checked={selectedUserIds.includes(
                                              user.id
                                            )}
                                            onChange={(e) =>
                                              handleCheckboxChange(
                                                user.id,
                                                e.target.checked
                                              )
                                            }
                                          >
                                            {user.name}
                                          </Checkbox>
                                        );
                                      })}
                                  </div>
                                );
                              })}
                          </div>
                        ),
                        extra: (
                          <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const allUserIdsInNode =
                                node.children
                                  ?.flatMap(
                                    (child) =>
                                      child.users?.map((u) => u.id) || []
                                  )
                                  .filter(Boolean) || [];
                              if (checked) {
                                setSelectedUserIds((prev) =>
                                  compact([...prev, ...allUserIdsInNode])
                                );
                              } else {
                                setSelectedUserIds((prev) =>
                                  prev.filter(
                                    (id) => !allUserIdsInNode.includes(id)
                                  )
                                );
                              }
                            }}
                            checked={
                              node.children?.every((child) =>
                                child.users?.every((u) =>
                                  selectedUserIds.includes(u.id)
                                )
                              ) || false
                            }
                            title="Cả công ty"
                          />
                        ),
                      };
                    })}
                    expandIconPosition="start"
                    className="collapseTemplate"
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
