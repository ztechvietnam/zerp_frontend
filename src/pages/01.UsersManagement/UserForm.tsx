/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  App,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  TreeSelect,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { MEASSAGE } from "../../components/constant/constant";
import { pick } from "lodash";
import { UserEntity } from "../../common/services/user/user";
import { userService } from "../../common/services/user/user-service";
import { useSidebar } from "../../context/SidebarContext";
import { RoleEntity } from "../../common/services/role/role";
import { DepartmentTreeNode } from "../../common/services/department/department";

export interface UserFormRef {
  show(currentItem?: UserEntity): Promise<void>;
}

interface UserFormProps {
  resetData: () => void;
  dataRoles: RoleEntity[];
}

export const UserForm = forwardRef<UserFormRef, UserFormProps>(
  ({ resetData, dataRoles }, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<UserEntity | undefined>(
      undefined
    );
    const [treeSelect, setTreeSelect] = useState<DepartmentTreeNode[]>([]);
    const { message } = App.useApp();
    const { departmentTree } = useSidebar();
    const [form] = useForm();

    useEffect(() => {
      const tree = departmentTree.map((item) => {
        return {
          ...item,
          selectable: false,
        };
      });
      setTreeSelect(tree);
    }, [departmentTree]);

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
              "username",
              "email",
            ]);
            setTimeout(() => {
              form.setFieldsValue(formControlValues);
              form.setFieldValue(
                "department",
                `department-${currentItem.department?.id_department}`
              );
              form.setFieldValue("role", currentItem.role?.id);
            }, 0);
          }
          setLoading(false);
        },
      }),
      [form]
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
            username: dataSave.username,
            email: dataSave.email,
            id_department: dataSave.department?.startsWith("department-")
              ? parseInt(dataSave.department.replace("department-", ""))
              : null,
            role: { id: dataSave.role },
            ...(dataSave.password ? { password: dataSave.password } : {}),
          } as any);
          message.success("Chỉnh sửa thành công");
        } else {
          const newUser = {
            firstName: dataSave.firstName,
            lastName: dataSave.lastName,
            username: dataSave.username,
            email: dataSave.email,
            id_department: dataSave.department?.startsWith("department-")
              ? parseInt(dataSave.department.replace("department-", ""))
              : null,
            role: { id: dataSave.role },
            status: { id: 1 },
            provider: "email",
            password: dataSave.password ? dataSave.password : "123456",
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
              <Col xs={24} sm={24} md={24} lg={12}>
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
              <Col xs={24} sm={24} md={24} lg={12}>
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
              <Col xs={24} sm={24} md={24} lg={12}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Username"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <Input
                    disabled={!!currentUser}
                    style={{ width: "100%" }}
                    placeholder={"Nhập username"}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12}>
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
              <Col xs={24} sm={24} md={24} lg={12}>
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
                    treeData={treeSelect}
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
              <Col xs={24} sm={24} md={24} lg={12}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Vai trò"
                  name="role"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <Select
                    options={dataRoles.map((role) => {
                      return {
                        value: role.id,
                        label: role.role_name,
                      };
                    })}
                    showSearch
                    allowClear
                    placeholder="Chọn vai trò"
                    styles={{
                      popup: { root: { maxHeight: 400, overflow: "auto" } },
                    }}
                    filterOption={(inputValue: string, node: any) => {
                      const title =
                        typeof node.label === "string" ? node.label : "";
                      return title
                        .toLocaleLowerCase()
                        .includes(inputValue?.trim().toLocaleLowerCase());
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label={currentUser ? "Mật khẩu mới" : "Mật khẩu"}
                  name="password"
                >
                  <Input
                    style={{ width: "100%" }}
                    placeholder={
                      currentUser ? "Nhập mật khẩu mới" : "Nhập mật khẩu"
                    }
                    maxLength={255}
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
