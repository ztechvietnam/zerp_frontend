/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, Col, Form, Input, Modal, Row, Select, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  documentCategories,
  MEASSAGE,
} from "../../components/constant/constant";
import { CategoryEntity } from "../../common/services/category/category";
import { pick } from "lodash";

export interface DocumentCategoryFormRef {
  show(currentItem?: CategoryEntity): Promise<void>;
}

interface DocumentCategoryFormProps {
  resetData: () => void;
}

export const DocumentCategoryForm = forwardRef<
  DocumentCategoryFormRef,
  DocumentCategoryFormProps
>(({ resetData }, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<
    CategoryEntity | undefined
  >(undefined);
  const [parrentCategories, setParrentCategories] = useState<CategoryEntity[]>(
    []
  );
  const { message } = App.useApp();
  const [form] = useForm();

  useImperativeHandle(
    ref,
    () => ({
      show: async (currentItem?: CategoryEntity) => {
        setLoading(true);
        setShowModal(true);
        if (currentItem) {
          setCurrentCategory(currentItem);
          const formControlValues = pick(currentItem, ["name", "code"]);
          setTimeout(() => {
            form.setFieldsValue(formControlValues);
            form.setFieldValue("parentCode", currentItem.parentCode);
          }, 0);
        }
        setLoading(false);
      },
    }),
    []
  );

  useEffect(() => {
    const categories = documentCategories.filter((cate) => !cate.parentCode);
    setParrentCategories(categories);
  }, []);

  const onOK = async (valueForm: any) => {
    console.log(valueForm);
    message.success(
      currentCategory ? "Chỉnh sửa thành công" : "Thêm mới thành công"
    );
    if (resetData) {
      resetData();
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
        <Form layout="horizontal" form={form}>
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
                label="Mã danh mục"
                name="code"
                rules={[
                  {
                    required: true,
                    message: "Trường yêu cầu nhập!",
                  },
                ]}
              >
                <Input
                  disabled={!!currentCategory}
                  style={{ width: "100%" }}
                  placeholder={"Nhập mã danh mục"}
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>
          {(!currentCategory || (currentCategory && currentCategory?.parentCode)) && (
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Danh mục cha"
                  name="parentCode"
                >
                  <Select
                    placeholder="Chọn danh mục cha"
                    allowClear
                    style={{ width: "100%" }}
                    options={parrentCategories.map((cate) => {
                      return {
                        label: cate.name,
                        value: cate.code,
                      };
                    })}
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
