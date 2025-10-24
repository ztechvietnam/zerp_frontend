/* eslint-disable @typescript-eslint/no-empty-object-type */
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
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { dataDepartments, MEASSAGE } from "../../components/constant/constant";
import { pick } from "lodash";
import {
  DepartmentEntity,
  DepartmentTreeNode,
} from "../../common/services/department/department";

export enum TYPE_DEP {
  "PARENT" = "PARENT",
  "CHILD" = "CHILD",
}

export interface DepartmentFormRef {
  show(type: TYPE_DEP, currentItem?: DepartmentEntity): Promise<void>;
}

interface DepartmentFormProps {
  treeDataDepartment: DepartmentTreeNode[];
  resetData: () => void;
}

export const DepartmentForm = forwardRef<
  DepartmentFormRef,
  DepartmentFormProps
>(({ treeDataDepartment, resetData }, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [typeDep, setTypeDep] = useState<TYPE_DEP>(TYPE_DEP.PARENT);
  const [currentCategory, setCurrentCategory] = useState<
    DepartmentEntity | undefined
  >(undefined);
  const [parentDepartments, setParrentDepartments] = useState<
    DepartmentEntity[]
  >([]);
  const [treeData, setTreeData] = useState<DepartmentTreeNode[]>([]);
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
          const formControlValues = pick(currentItem, ["name", "address"]);
          setTimeout(() => {
            form.setFieldsValue(formControlValues);
            form.setFieldValue("code", currentItem.department_code);
            if (currentItem.branch_id) {
              form.setFieldValue(
                "parent_department_id",
                `branch-${currentItem.branch_id}`
              );
            }
            if (currentItem.parent_department_id) {
              form.setFieldValue(
                "parent_department_id",
                `department-${currentItem.parent_department_id}`
              );
            }
          }, 0);
        }
        setLoading(false);
      },
    }),
    []
  );

  const removeNodeById = useCallback(
    (nodes: DepartmentTreeNode[], currentId: string): DepartmentTreeNode[] => {
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

  useEffect(() => {
    if (currentCategory) {
      setTreeData(
        removeNodeById(
          treeDataDepartment,
          `department-${currentCategory?.id_department.toString()}`
        )
      );
    } else {
      setTreeData(treeDataDepartment);
    }
  }, [treeDataDepartment, currentCategory, removeNodeById]);

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
              (currentCategory &&
                (currentCategory?.branch_id ||
                  currentCategory?.parent_department_id))) && (
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    label="Đơn vị/phòng ban cha"
                    name="parent_department_id"
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
