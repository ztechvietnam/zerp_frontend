/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, Col, Form, Input, Modal, Row, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { MEASSAGE } from "../../components/constant/constant";
import { pick } from "lodash";
import { UserEntity } from "../../common/services/user/user";
import { authService } from "../../common/services/auth/authService";

export interface EditProfileModalRef {
  show(currentItem?: UserEntity): Promise<void>;
}

interface EditProfileModalProps {
  resetData: (newCurrentUser: UserEntity) => void;
}

export const EditProfileModal = forwardRef<
  EditProfileModalRef,
  EditProfileModalProps
>(({ resetData }, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { message } = App.useApp();
  const [currentUser, setCurrentUser] = useState<UserEntity | undefined>(
    undefined
  );
  const [form] = useForm();

  useImperativeHandle(
    ref,
    () => ({
      show: async (currentItem: UserEntity) => {
        setLoading(true);
        setShowModal(true);
        setCurrentUser(currentItem);
        const formControlValues: any = pick(currentItem, [
          "lastName",
          "firstName",
          "email",
        ]);
        setTimeout(() => {
          form.setFieldsValue(formControlValues);
        }, 0);
        setLoading(false);
      },
    }),
    []
  );

  const onOK = async (valueForm: any) => {
    try {
      const newData = valueForm;
      if (currentUser) {
        newData.id = currentUser.id;
        const newCurrentUser = await authService.updateMe(newData);
        message.success(
          currentUser ? "Chỉnh sửa thành công" : "Thêm mới thành công"
        );
        closeModal();
        if (resetData) {
          resetData(newCurrentUser);
        }
      }
    } catch (e) {
      console.log(e);
      message.error("Có lỗi xảy ra trong quá trình xử lý");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(undefined);
    form.resetFields();
  };

  return (
    <Modal
      title={"Chỉnh sửa thông tin cá nhân"}
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
      okText={currentUser ? MEASSAGE.SAVE : MEASSAGE.CREATE}
      cancelText={currentUser ? MEASSAGE.CANCEL : MEASSAGE.CLOSE}
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <Form layout="horizontal" form={form} style={{ padding: 24 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Họ và tên đệm"
                name="lastName"
                rules={[
                  {
                    required: true,
                    message: "Trường yêu cầu nhập!",
                  },
                ]}
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder={"Nhập họ và tên đệm"}
                  maxLength={255}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Tên"
                name="firstName"
                rules={[
                  {
                    required: true,
                    message: "Trường yêu cầu nhập!",
                  },
                ]}
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder={"Nhập tên"}
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
        </Form>
      </Spin>
    </Modal>
  );
});
