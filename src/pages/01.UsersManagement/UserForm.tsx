/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, Col, Form, Input, Modal, Row, Spin, TreeSelect } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { MEASSAGE } from "../../components/constant/constant";
import { pick } from "lodash";
import { UserEntity } from "../../common/services/user/user";
import { userService } from "../../common/services/user/user-service";
import { useSidebar } from "../../context/SidebarContext";

export interface UserFormRef {
  show(currentItem?: UserEntity): Promise<void>;
}

interface UserFormProps {
  resetData: () => void;
}

export const UserForm = forwardRef<UserFormRef, UserFormProps>(
  ({ resetData }, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<UserEntity | undefined>(
      undefined
    );
    const { message } = App.useApp();
    const { departmentTree } = useSidebar();
    const [form] = useForm();

    useImperativeHandle(
      ref,
      () => ({
        show: async (currentItem?: UserEntity) => {
          setLoading(true);
          setShowModal(true);
          if (currentItem) {
            setCurrentUser(currentItem);
            const formControlValues = pick(currentItem, [
              "lastName",
              "firstName",
              "email",
            ]);
            setTimeout(() => {
              form.setFieldsValue(formControlValues);
              form.setFieldValue(
                "department",
                `department-${currentItem.department?.id_department}`
              );
            }, 0);
          }
          setLoading(false);
        },
      }),
      []
    );

    const onOK = async (valueForm: any) => {
      try {
        const dataSave = valueForm;
        if (currentUser) {
          dataSave.id = currentUser.id;
          await userService.update({
            id: currentUser.id,
            firstName: dataSave.firstName,
            lastName: dataSave.lastName,
            email: dataSave.email,
            id_department: dataSave.department?.startsWith("department-")
              ? parseInt(dataSave.department.replace("department-", ""))
              : null,
          } as any);
          message.success("Chỉnh sửa thành công");
        } else {
          const newUser = {
            firstName: dataSave.firstName,
            lastName: dataSave.lastName,
            email: dataSave.email,
            id_department: dataSave.department?.startsWith("department-")
              ? parseInt(dataSave.department.replace("department-", ""))
              : null,
            role: { id: 1 },
            status: { id: 1 },
            provider: "email",
            username: dataSave.email?.split("@")[0],
            password: "123456",
          };
          await userService.add(newUser as any);
          message.success("Thêm mới thành công");
        }
        closeModal();
        if (resetData) {
          resetData();
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
        title={currentUser ? "Chỉnh sửa người dùng" : "Thêm mới người dùng"}
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
          <Form layout="horizontal" form={form} style={{ padding: 12 }}>
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
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
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
                  label="Phòng ban"
                  name="department"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <TreeSelect
                    treeData={departmentTree}
                    showSearch
                    placeholder="Chọn phòng ban"
                    styles={{
                      popup: { root: { maxHeight: 400, overflow: "auto" } },
                    }}
                    treeDefaultExpandAll
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
          </Form>
        </Spin>
      </Modal>
    );
  }
);
