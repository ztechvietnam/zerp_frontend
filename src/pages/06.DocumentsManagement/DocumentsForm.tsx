/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, Col, Form, Input, Modal, Row, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { MEASSAGE } from "../../components/constant/constant";
import { pick } from "lodash";
import { DocumentEntity } from "../../common/services/document/document";

export interface UserFormRef {
  show(currentItem?: DocumentEntity): Promise<void>;
}

interface UserFormProps {
  resetData: () => void;
}

export const UserForm = forwardRef<UserFormRef, UserFormProps>(
  ({ resetData }, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
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
              "code",
              "template",
              "category",
              "createdBy",
              "created",
              "status",
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
      setCurrentDocument(undefined);
      form.resetFields();
    };

    return (
      <Modal
        title={currentDocument ? "Chỉnh sửa văn bản" : "Thêm mới văn bản"}
        onCancel={() => closeModal()}
        width={1200}
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
          <Form layout="horizontal" form={form} style={{ padding: 24 }}>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Họ và tên"
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
                    placeholder={"Nhập họ và tên"}
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
                  label="Địa chỉ email"
                  name="email"
                  rules={[
                    {
                      type: "email",
                      message: "Vui lòng nhập đúng định dạng email",
                    },
                  ]}
                >
                  <Input
                    style={{ width: "100%" }}
                    placeholder={"Nhập địa chỉ email"}
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
                  label="Địa chỉ"
                  name="address"
                  rules={[]}
                >
                  <Input
                    style={{ width: "100%" }}
                    placeholder={"Nhập địa chỉ"}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
);
