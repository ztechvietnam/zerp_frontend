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
import { pick } from "lodash";
import {
  BranchEntity,
  DepartmentEntity,
  DepartmentTreeNode,
} from "../../common/services/department/department";
import { departmentService } from "../../common/services/department/department-service";
import { branchesService } from "../../common/services/department/branches-service";

export enum TYPE_DEP {
  "BRANCH" = "BRANCH",
  "DEPARTMENT" = "DEPARTMENT",
}

export interface DepartmentFormRef {
  show(
    type: TYPE_DEP,
    currentItem?: DepartmentEntity | BranchEntity
  ): Promise<void>;
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
  const [typeDep, setTypeDep] = useState<TYPE_DEP>(TYPE_DEP.BRANCH);
  const [currentItem, setCurrentItem] = useState<
    DepartmentEntity | BranchEntity | undefined
  >(undefined);
  const [treeData, setTreeData] = useState<DepartmentTreeNode[]>([]);
  const { message } = App.useApp();
  const [form] = useForm();

  useImperativeHandle(
    ref,
    () => ({
      show: async (
        type: TYPE_DEP,
        currentItem?: DepartmentEntity | BranchEntity
      ) => {
        setLoading(true);
        setShowModal(true);
        setTypeDep(type);
        if (currentItem) {
          setCurrentItem(currentItem);
          const formControlValues = pick(currentItem, ["name", "address"]);
          setTimeout(() => {
            form.setFieldsValue(formControlValues);
            if ((currentItem as DepartmentEntity)?.department_code) {
              form.setFieldValue(
                "code",
                (currentItem as DepartmentEntity)?.department_code
              );
            }
            if ((currentItem as BranchEntity)?.branch_code) {
              form.setFieldValue(
                "code",
                (currentItem as BranchEntity)?.branch_code
              );
            }
            if ((currentItem as DepartmentEntity)?.branch_id) {
              form.setFieldValue(
                "parent_department_id",
                `branch-${(currentItem as DepartmentEntity).branch_id}`
              );
            }
            if ((currentItem as DepartmentEntity)?.parent_department_id) {
              form.setFieldValue(
                "parent_department_id",
                `department-${
                  (currentItem as DepartmentEntity).parent_department_id
                }`
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
    if (typeDep === TYPE_DEP.DEPARTMENT) {
      if (currentItem) {
        setTreeData(
          removeNodeById(
            treeDataDepartment,
            `department-${(
              currentItem as DepartmentEntity
            )?.id_department.toString()}`
          )
        );
      } else {
        setTreeData(treeDataDepartment);
      }
    }
  }, [treeDataDepartment, currentItem, removeNodeById, typeDep]);

  const findBranchByDepartmentId = useCallback(
    (departmentId: number): BranchEntity | null => {
      for (const branchNode of treeDataDepartment) {
        if (!branchNode.children) continue;

        const stack = [...branchNode.children];

        while (stack.length > 0) {
          const node = stack.pop()!;
          const dep = node.item as DepartmentEntity;

          if (dep.id_department === departmentId) {
            return branchNode.item as BranchEntity;
          }

          if (node.children) {
            stack.push(...node.children);
          }
        }
      }

      return null;
    },
    [treeDataDepartment]
  );

  const onOK = async (valueForm: any) => {
    try {
      setLoading(true);
      if (currentItem) {
        if (typeDep === TYPE_DEP.BRANCH) {
          await branchesService.patch(
            {
              branch_code: valueForm.code,
              name: valueForm.name,
              address: valueForm.address,
            },
            {
              endpoint: `/${(
                currentItem as BranchEntity
              ).id_branch.toString()}`,
            }
          );
        } else {
          const parentId = valueForm.parent_department_id.startsWith("branch-")
            ? parseInt(valueForm.parent_department_id.replace("branch-", ""))
            : parseInt(
                valueForm.parent_department_id.replace("department-", "")
              );
          let branchId: number | null = null;
          if (!valueForm.parent_department_id.startsWith("branch-")) {
            branchId = findBranchByDepartmentId(parentId)?.id_branch || null;
          }
          await departmentService.patch(
            {
              department_code: valueForm.code,
              name: valueForm.name,
              parent_department_id: valueForm.parent_department_id.startsWith(
                "branch-"
              )
                ? null
                : parentId,
              branch_id: valueForm.parent_department_id.startsWith("branch-")
                ? parentId
                : branchId,
            },
            {
              endpoint: `/${(
                currentItem as DepartmentEntity
              ).id_department.toString()}`,
            }
          );
        }
      } else {
        if (typeDep === TYPE_DEP.BRANCH) {
          await branchesService.post({
            branch_code: valueForm.code,
            name: valueForm.name,
            address: valueForm.address,
            status: 1,
            is_system: 1,
          });
        } else {
          const parentId = valueForm.parent_department_id.startsWith("branch-")
            ? parseInt(valueForm.parent_department_id.replace("branch-", ""))
            : parseInt(
                valueForm.parent_department_id.replace("department-", "")
              );
          let branchId: number | null = null;
          if (!valueForm.parent_department_id.startsWith("branch-")) {
            branchId = findBranchByDepartmentId(parentId)?.id_branch || null;
          }
          await departmentService.post({
            department_code: valueForm.code,
            name: valueForm.name,
            parent_department_id: valueForm.parent_department_id.startsWith(
              "branch-"
            )
              ? null
              : parentId,
            branch_id: valueForm.parent_department_id.startsWith("branch-")
              ? parentId
              : branchId,
            is_system: 0,
            status: 1,
          });
        }
      }
      message.success(
        currentItem ? "Chỉnh sửa thành công" : "Thêm mới thành công"
      );
      closeModal();
      if (resetData) {
        resetData();
      }
      setLoading(false);
    } catch (error) {
      message.success(MEASSAGE.ERROR);
      console.log("Error in onOK:", error);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentItem(undefined);
    form.resetFields();
  };

  return (
    <Modal
      title={
        currentItem
          ? typeDep === TYPE_DEP.BRANCH
            ? "Chỉnh sửa đơn vị"
            : "Chỉnh sửa khoa/phòng/ban"
          : typeDep === TYPE_DEP.BRANCH
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
      okText={currentItem ? MEASSAGE.SAVE : MEASSAGE.CREATE}
      cancelText={currentItem ? MEASSAGE.CANCEL : MEASSAGE.CLOSE}
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
                  typeDep === TYPE_DEP.BRANCH
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
                    typeDep === TYPE_DEP.BRANCH
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
                  typeDep === TYPE_DEP.BRANCH
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
                  disabled={!!currentItem}
                  style={{ width: "100%" }}
                  placeholder={
                    typeDep === TYPE_DEP.BRANCH
                      ? "Nhập mã đơn vị"
                      : "Nhập mã khoa/phòng/ban"
                  }
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>
          {typeDep === TYPE_DEP.BRANCH && (
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
          {typeDep === TYPE_DEP.DEPARTMENT &&
            (!currentItem ||
              (currentItem &&
                ((currentItem as DepartmentEntity)?.branch_id ||
                  (currentItem as DepartmentEntity)
                    ?.parent_department_id))) && (
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
