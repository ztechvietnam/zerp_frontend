/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  App,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Spin,
  TreeSelect,
  Upload,
  UploadProps,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  buildCategoryTree,
  MEASSAGE,
} from "../../components/constant/constant";
import { pick } from "lodash";
import { UploadOutlined } from "@ant-design/icons";
import { NewsEntity } from "../../common/services/news/news";
import vi from "antd/es/date-picker/locale/vi_VN";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./react-quill-antd.css";
import { TreeNode } from "../../common/services/category/category";
import { useSidebar } from "../../context/SidebarContext";

export interface NewsFormRef {
  show(currentItem?: NewsEntity): Promise<void>;
}

interface NewsFormProps {}

export const NewsForm = forwardRef<NewsFormRef, NewsFormProps>(({}, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsEntity | undefined>(
    undefined
  );
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [content, setContent] = useState<string>("");
  const { listDocumentCategories } = useSidebar();
  const { message } = App.useApp();
  const [form] = useForm();

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
      ],
    },
  };

  useImperativeHandle(
    ref,
    () => ({
      show: async (currentItem?: NewsEntity) => {
        setLoading(true);
        setShowModal(true);
        if (currentItem) {
          setCurrentNews(currentItem);
          const formControlValues = pick(currentItem, [
            "title",
            "description",
            "content",
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

  useEffect(() => {
    setLoading(true);
    const treeCate = buildCategoryTree(listDocumentCategories, true);
    setTreeData(treeCate);
    setLoading(false);
  }, [listDocumentCategories]);

  const onOK = async (valueForm: any) => {
    console.log(valueForm);
    console.log(content);
    message.success(
      currentNews ? "Chỉnh sửa thành công" : "Thêm mới thành công"
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentNews(undefined);
    form.resetFields();
  };

  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];

  const uploadProps: UploadProps = {
    accept: ".jpg,.jpeg,.png,.gif",
    beforeUpload: (file) => {
      const isAllowed = allowedImageTypes.includes(file.type);
      if (!isAllowed) {
        message.error("Chỉ cho phép tải lên file ảnh (JPG, PNG, GIF)");
      }
      return isAllowed || Upload.LIST_IGNORE;
    },
    onChange: (info) => {
      const file = info.file.originFileObj;
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    },
    showUploadList: false,
  };

  return (
    <Modal
      title={currentNews ? "Chỉnh sửa tin tức" : "Thêm mới tin tức"}
      onCancel={() => closeModal()}
      width={1200}
      className="top-6!"
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
      okText={currentNews ? MEASSAGE.SAVE : MEASSAGE.CREATE}
      cancelText={currentNews ? MEASSAGE.CANCEL : MEASSAGE.CLOSE}
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
                <Input
                  style={{ width: "100%" }}
                  placeholder={"Nhập mô tả"}
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
                label="Nội dung"
                name="content"
                rules={[
                  {
                    required: true,
                    message: "Trường yêu cầu nhập!",
                  },
                ]}
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  placeholder="Nhập nội dung"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Danh mục"
                name="category"
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
                  placeholder="Chọn danh mục tin tức"
                  styles={{
                    popup: { root: { maxHeight: 400, overflow: "auto" } },
                  }}
                  filterTreeNode={(inputValue: string, treeNode: any) => {
                    const title =
                      typeof treeNode.title === "string" ? treeNode.title : "";
                    return title
                      .toLocaleLowerCase()
                      .includes(inputValue?.trim().toLocaleLowerCase());
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Ngày phát hành"
                name="publish_date"
                rules={[
                  {
                    required: true,
                    message: "Trường yêu cầu nhập!",
                  },
                ]}
              >
                <DatePicker
                  locale={vi}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Ảnh bìa"
                name="image"
                rules={[
                  {
                    required: true,
                    message: "Trường yêu cầu nhập!",
                  },
                ]}
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>
                    Tải ảnh bìa lên (JPG, PNG, GIF)
                  </Button>
                </Upload>

                {previewUrl && (
                  <div className="mt-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-48 h-auto rounded border"
                    />
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
});
