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
import { dataDepartments, MEASSAGE } from "../../components/constant/constant";
import { pick } from "lodash";
import { DepartmentEntity } from "../../common/services/department/department";

export enum TYPE_DEP {
  "PARENT",
  "CHILD",
}

export interface DepartmentFormRef {
  show(type: TYPE_DEP, currentItem?: DepartmentEntity): Promise<void>;
}

interface DepartmentFormProps {
  resetData: () => void;
}

export const DepartmentForm = forwardRef<
  DepartmentFormRef,
  DepartmentFormProps
>(({ resetData }, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [typeDep, setTypeDep] = useState<TYPE_DEP>(TYPE_DEP.PARENT);
  const [currentCategory, setCurrentCategory] = useState<
    DepartmentEntity | undefined
  >(undefined);
  const [parentDepartments, setParrentDepartments] = useState<
    DepartmentEntity[]
  >([]);
  const { message } = App.useApp();
  const [form] = useForm();

  useImperativeHandle(
    ref,
    () => ({
      show: async (type: TYPE_DEP, currentItem?: DepartmentEntity) => {
        setLoading(true);
        setShowModal(true);
        setTypeDep(type);
        if (currentItem) {
          setCurrentCategory(currentItem);
          const formControlValues = pick(currentItem, [
            "name",
            "code",
            "address",
          ]);
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
    const department = dataDepartments.filter((dep) => !dep.parentCode);
    setParrentDepartments(department);
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
      title={
        currentCategory
          ? typeDep === TYPE_DEP.PARENT
            ? "Chỉnh sửa đơn vị"
            : "Chỉnh sửa khoa/phòng/ban"
          : typeDep === TYPE_DEP.PARENT
          ? "Thêm mới đơn vị"
          : "Thêm mới khoa/phòng/ban"
      }
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
                label={
                  typeDep === TYPE_DEP.PARENT
                    ? "Tên đơn vị"
                    : "Tên khoa/phòng/ban"
                }
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
                  placeholder={
                    typeDep === TYPE_DEP.PARENT
                      ? "Nhập tên đơn vị"
                      : "Nhập tên khoa/phòng/ban"
                  }
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
                label={
                  typeDep === TYPE_DEP.PARENT
                    ? "Mã đơn vị"
                    : "Mã khoa/phòng/ban"
                }
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
                  placeholder={
                    typeDep === TYPE_DEP.PARENT
                      ? "Nhập mã đơn vị"
                      : "Nhập mã khoa/phòng/ban"
                  }
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>
          {typeDep === TYPE_DEP.PARENT && (
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label={"Địa chỉ"}
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: "Trường yêu cầu nhập!",
                    },
                  ]}
                >
                  <Input
                    style={{ width: "100%" }}
                    placeholder={"Nhập địa chỉ"}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
          {typeDep === TYPE_DEP.CHILD &&
            (!currentCategory ||
              (currentCategory && currentCategory?.parentCode)) && (
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    label="Chọn đơn vị"
                    name="parentCode"
                  >
                    <Select
                      placeholder="Chọn đơn vị"
                      allowClear
                      style={{ width: "100%" }}
                      options={parentDepartments.map((cate) => {
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
