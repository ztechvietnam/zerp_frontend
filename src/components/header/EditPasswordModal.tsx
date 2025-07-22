/* eslint-disable @typescript-eslint/no-empty-object-type */
import { App, Col, Form, Input, message, Modal, Row, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { MEASSAGE } from "../constant/constant";

export interface UserEntity {
  id?: string;
  name: string;
  email: string;
  address: string;
  loginName?: string;
  passWord?: string;
}

export interface EditPasswordModalRef {
  show(currentItem?: UserEntity): Promise<void>;
}

interface EditPasswordModalProps {}

export const EditPasswordModal = forwardRef<
  EditPasswordModalRef,
  EditPasswordModalProps
>(({}, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserEntity | undefined>(
    undefined
  );
  const { message } = App.useApp();
  const [form] = useForm();

  useImperativeHandle(
    ref,
    () => ({
      show: async (currentItem?: UserEntity) => {
        setLoading(true);
        setShowModal(true);
        if (currentItem) {
          setCurrentUser(currentItem);
        }
        setLoading(false);
      },
    }),
    []
  );

  const editPassword = async (valueForm: any) => {
    console.log(valueForm);
    if (valueForm["oldPassword"] !== currentUser?.passWord) {
      message.error("Mật khẩu hiện tại không khớp");
    } else {
      message.success(
        currentUser ? "Chỉnh sửa thành công" : "Thêm mới thành công"
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(undefined);
    form.resetFields();
  };

  return (
    <Modal
      title="Đổi mật khẩu"
      onCancel={() => closeModal()}
      width={500}
      visible={showModal}
      closable={loading ? false : true}
      onOk={async () => {
        try {
          const valueForm = await form.validateFields();
          await editPassword(valueForm);
        } catch (e) {
          console.log(e);
        }
      }}
      okText={MEASSAGE.SAVE}
      cancelText={MEASSAGE.CANCEL}
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <Form layout="horizontal" form={form} style={{ padding: 24 }}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Mật khẩu hiện tại"
                name="oldPassword"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu hiện tại!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu mới!",
                  },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
                    message:
                      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Xác nhận lại mật khẩu"
                name="confirmPassword"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận lại mật khẩu mới!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận của bạn không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
});
