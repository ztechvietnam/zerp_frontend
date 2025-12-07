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
import { TreeNode } from "../../common/services/category/category";
import { parseInt, pick } from "lodash";
import { DocumentCategoriesEntity } from "../../common/services/document-categories/documentCategories";
import { documentCategoriesService } from "../../common/services/document-categories/documentCategoriesService";
import { branchesService } from "../../common/services/department/branches-service";
import { buildDepartmentTreeData } from "../06.DocumentsManagement/DocumentsForm";
import { RoleTreeNode } from "../../common/services/department/department";
import { DocumentCategoryPermissionEntity } from "../../common/services/document-category-permissions/document-category-permissions";
import { documentCategoryPermissionService } from "../../common/services/document-category-permissions/documentCategoryPermissionsService";
import { useSidebar } from "../../context/SidebarContext";

export interface NewsCategoryFormRef {
  show(currentItem?: DocumentCategoriesEntity): Promise<void>;
}

interface NewsCategoryFormProps {
  treeDataCategories: TreeNode[];
  resetData: () => Promise<void>;
}

export const NewsCategoryForm = forwardRef<
  NewsCategoryFormRef,
  NewsCategoryFormProps
>(({ treeDataCategories, resetData }, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<
    DocumentCategoriesEntity | undefined
  >(undefined);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [currentCatePermission, setCurrentCatePermission] = useState<
    DocumentCategoryPermissionEntity | undefined
  >(undefined);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [treeDepartment, setTreeDepartment] = useState<RoleTreeNode[]>([]);
  const { message } = App.useApp();
  const { getPerDocumentCate } = useSidebar();
  const [form] = useForm();

  const removeNodeById = useCallback(
    (nodes: TreeNode[], currentId: string): TreeNode[] => {
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

  const flattenPermission = (item: DocumentCategoryPermissionEntity) => {
    type PermissionKey = "branch_id" | "department_id" | "user_id";

    const mapping: Record<PermissionKey, string> = {
      branch_id: "branch",
      department_id: "department",
      user_id: "user",
    };

    return (Object.keys(mapping) as PermissionKey[]).flatMap((key) => {
      const prefix = mapping[key];
      const ids = item[key];

      if (!Array.isArray(ids)) return [];
      const validIds = ids.filter((id): id is number => id != null);

      if (validIds.length === 0) return [];
      return validIds.map((id) => `${prefix}-${id}`);
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      show: async (currentItem?: DocumentCategoriesEntity) => {
        setLoading(true);
        setShowModal(true);
        if (currentItem) {
          setCurrentCategory(currentItem);
          const formControlValues = pick(currentItem, ["name", "description"]);
          setTimeout(() => {
            form.setFieldsValue(formControlValues);
            form.setFieldValue(
              "parent_category_id",
              currentItem.parent_category_id.toString()
            );
          }, 0);
          try {
            const permissions =
              await documentCategoryPermissionService.getPerByDocumentCategoryId(
                currentItem.id_category.toString()
              );
            if (permissions?.data && permissions?.data?.length) {
              const latestPermission = permissions.data.sort(
                (
                  a: DocumentCategoryPermissionEntity,
                  b: DocumentCategoryPermissionEntity
                ) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0];
              setCurrentCatePermission(latestPermission);
              setSelectedUserIds(flattenPermission(latestPermission));
            } else {
              setCurrentCatePermission(undefined);
              setSelectedUserIds([]);
            }
          } catch (e) {
            console.log(e);
          }
        }
        setLoading(false);
      },
    }),
    []
  );
  useEffect(() => {
    if (currentCategory) {
      setTreeData(
        removeNodeById(
          treeDataCategories,
          currentCategory?.id_category.toString()
        )
      );
    } else {
      setTreeData(treeDataCategories);
    }
  }, [treeDataCategories, currentCategory, removeNodeById]);

  useEffect(() => {
    (async () => {
      const dataDepartment = await branchesService.findAllWithRelations();
      const treeData = buildDepartmentTreeData(dataDepartment.data);
      setTreeDepartment(treeData);
    })();
  }, []);

  const onOK = async (valueForm: any) => {
    try {
      if (currentCategory) {
        await documentCategoriesService.patch(
          {
            ...valueForm,
            parent_category_id: parseInt(valueForm.parent_category_id),
          },
          {
            endpoint: `/${currentCategory.id_category.toString()}`,
          }
        );
        let permissionList: {
          branch: number[];
          department: number[];
          user: number[];
        } = {
          branch: [],
          department: [],
          user: [],
        };
        if (selectedUserIds?.length) {
          permissionList = selectedUserIds.reduce(
            (acc: any, item: any) => {
              const [key, value] = item.split("-");
              if (acc[key]) acc[key].push(Number(value));
              else acc[key] = [value];
              return acc;
            },
            { branch: [], department: [], user: [] }
          );
        }
        if (currentCatePermission) {
          const permission = {
            document_category_id: currentCategory.id_category,
            user_id: permissionList.user,
            department_id: permissionList.department,
            branch_id: permissionList.branch,
          };
          await documentCategoryPermissionService.patch(permission, {
            endpoint: `/${currentCatePermission.id_permission.toString()}`,
          });
        } else {
          const permission = {
            document_category_id: currentCategory.id_category,
            user_id: permissionList.user,
            department_id: permissionList.department,
            branch_id: permissionList.branch,
          };
          await documentCategoryPermissionService.post(permission);
        }
      } else {
        const newCategory = await documentCategoriesService.post({
          ...valueForm,
          parent_category_id: parseInt(valueForm.parent_category_id),
          image: "",
          status: 1,
        });
        let permissionList: {
          branch: number[];
          department: number[];
          user: number[];
        } = {
          branch: [],
          department: [],
          user: [],
        };
        if (selectedUserIds?.length) {
          permissionList = selectedUserIds.reduce(
            (acc: any, item: any) => {
              const [key, value] = item.split("-");
              if (acc[key]) acc[key].push(Number(value));
              else acc[key] = [value];
              return acc;
            },
            { branch: [], department: [], user: [] }
          );
        }
        const permission = {
          document_category_id: newCategory.id_category,
          user_id: permissionList.user,
          department_id: permissionList.department,
          branch_id: permissionList.branch,
        };
        await documentCategoryPermissionService.post(permission);
      }
      message.success(
        currentCategory ? "Chỉnh sửa thành công" : "Thêm mới thành công"
      );
      await getPerDocumentCate();
      if (resetData) {
        resetData();
      }
      closeModal();
    } catch (e) {
      console.log(e);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory(undefined);
    setCurrentCatePermission(undefined);
    setSelectedUserIds([]);
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
        <Form layout="horizontal" form={form} style={{ padding: 12 }}>
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
                label="Mô tả"
                name="description"
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder={"Nhập mô tả"}
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>
          {(!currentCategory ||
            (currentCategory && currentCategory?.parent_category_id)) && (
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Danh mục cha"
                  name="parent_category_id"
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
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Phân quyền danh mục"
              >
                <TreeSelect
                  treeData={treeDepartment}
                  value={selectedUserIds}
                  onChange={(values) => {
                    console.log(values);
                    setSelectedUserIds(values);
                  }}
                  treeCheckable
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder="Chọn người dùng được phép truy cập"
                  allowClear
                  style={{ width: "100%" }}
                  treeDefaultExpandAll
                  maxTagCount="responsive"
                  filterTreeNode={(inputValue: string, treeNode: any) => {
                    const title =
                      typeof treeNode.title === "string" ? treeNode.title : "";
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
});
