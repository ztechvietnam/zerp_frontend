/* eslint-disable @typescript-eslint/no-empty-object-type */
import { App, Col, Form, Input, Modal, Row, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { decodeBase64, encodeBase64, MEASSAGE } from "../constant/constant";
import { UserEntity } from "../../common/services/user/user";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../common/services/user/user-service";

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
    setLoading(true);
    const encodedPassword = sessionStorage.getItem("user_password");
    if (encodedPassword) {
      if (valueForm["oldPassword"] !== decodeBase64(encodedPassword)) {
        message.error("Mật khẩu hiện tại không khớp");
      } else {
        if (valueForm["oldPassword"] === valueForm["newPassword"]) {
          message.error("Mật khẩu mới trùng với mật khẩu hiện tại");
        } else {
          try {
            await userService.patch(
              { password: valueForm["newPassword"] },
              { endpoint: `/${currentUser?.id.toString()}` }
            );
            sessionStorage.setItem(
              "user_password",
              encodeBase64(valueForm["newPassword"])
            );
            closeModal();
            message.success("Đổi mật khẩu thành công");
            setLoading(false);
          } catch (e) {
            setLoading(false);
            console.log(e);
            message.error("Đổi mật khẩu thất bại");
          }
        }
      }
    } else {
      message.error("Có lỗi xảy ra trong quá trình đổi mật khẩu");
    }
    setLoading(false);
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
      open={showModal}
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
                    pattern: /^.{6,}$/,
                    message: "Mật khẩu phải có ít nhất 6 ký tự!",
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
