/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, Col, Form, Input, Modal, Row, Spin, TreeSelect } from "antd";
import { useForm } from "antd/es/form/Form";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { MEASSAGE } from "../../components/constant/constant";
import { TreeNode } from "../../common/services/category/category";
import { parseInt, pick } from "lodash";
import { DocumentCategoriesEntity } from "../../common/services/document-categories/documentCategories";
import { documentCategoriesService } from "../../common/services/document-categories/documentCategoriesService";

export interface DocumentCategoryFormRef {
  show(currentItem?: DocumentCategoriesEntity): Promise<void>;
}

interface DocumentCategoryFormProps {
  treeDataCategories: TreeNode[];
  resetData: () => Promise<void>;
}

export const DocumentCategoryForm = forwardRef<
  DocumentCategoryFormRef,
  DocumentCategoryFormProps
>(({ treeDataCategories, resetData }, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<
    DocumentCategoriesEntity | undefined
  >(undefined);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const { message } = App.useApp();
  const [form] = useForm();

  const removeNodeById = useCallback(
    (nodes: TreeNode[], currentId: string): TreeNode[] => {
      return nodes
        .filter((node) => node.value !== currentId)
        .map((node) => ({
          ...node,
          children: node.children
            ? removeNodeById(node.children, currentId)
            : undefined,
        }));
    },
    []
  );

  useImperativeHandle(
    ref,
    () => ({
      show: async (currentItem?: DocumentCategoriesEntity) => {
        setLoading(true);
        setShowModal(true);
        if (currentItem) {
          setCurrentCategory(currentItem);
          const formControlValues = pick(currentItem, ["name", "description"]);
          setTimeout(() => {
            form.setFieldsValue(formControlValues);
            form.setFieldValue(
              "parent_category_id",
              currentItem.parent_category_id.toString()
            );
          }, 0);
        }
        setLoading(false);
      },
    }),
    []
  );
  useEffect(() => {
    if (currentCategory) {
      setTreeData(
        removeNodeById(
          treeDataCategories,
          currentCategory?.id_category.toString()
        )
      );
    } else {
      setTreeData(treeDataCategories);
    }
  }, [treeDataCategories, currentCategory, removeNodeById]);

  const onOK = async (valueForm: any) => {
    try {
      if (currentCategory) {
        await documentCategoriesService.patch(
          {
            ...valueForm,
            parent_category_id: parseInt(valueForm.parent_category_id),
          },
          {
            endpoint: `/${currentCategory.id_category.toString()}`,
          }
        );
      } else {
        await documentCategoriesService.post({
          ...valueForm,
          parent_category_id: parseInt(valueForm.parent_category_id),
          image: "",
          status: 1,
        });
      }
      message.success(
        currentCategory ? "Chỉnh sửa thành công" : "Thêm mới thành công"
      );
      if (resetData) {
        resetData();
      }
      closeModal();
    } catch (e) {
      console.log(e);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory(undefined);
    form.resetFields();
  };

  return (
    <Modal
      title={currentCategory ? "Chỉnh sửa danh mục" : "Thêm mới danh mục"}
      onCancel={() => closeModal()}
      width={800}
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
      okText={currentCategory ? MEASSAGE.SAVE : MEASSAGE.CREATE}
      cancelText={currentCategory ? MEASSAGE.CANCEL : MEASSAGE.CLOSE}
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <Form layout="horizontal" form={form} style={{ padding: 12 }}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Tên danh mục"
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
                  placeholder={"Nhập tên danh mục"}
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
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder={"Nhập mô tả"}
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>
          {(!currentCategory ||
            (currentCategory && currentCategory?.parent_category_id)) && (
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Danh mục cha"
                  name="parent_category_id"
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
                    placeholder="Chọn danh mục cha"
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
            </Row>
          )}
        </Form>
      </Spin>
    </Modal>
  );
});
