/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { App, Breadcrumb, Button, Modal, Table, Tag, Tooltip } from "antd";
import {
  DocumentCategoryForm,
  DocumentCategoryFormRef,
} from "./DocumentCategoryForm";
import { TreeNode } from "../../common/services/category/category";
import {
  buildCategoryTree,
  MEASSAGE,
} from "../../components/constant/constant";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { documentCategoriesService } from "../../common/services/document-categories/documentCategoriesService";
import { useSidebar } from "../../context/SidebarContext";

const DocumentCategories = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const documentCategoryFormRef = useRef<DocumentCategoryFormRef>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const { listDocumentCategories, setListDocumentCategories } = useSidebar();
  const { message, modal } = App.useApp();

  const getDocumentCategories = useCallback(async (formValues?: any) => {
    try {
      setLoading(true);
      const results = await documentCategoriesService.get({
        params: {
          limit: 100,
        },
      });
      if (results) {
        setListDocumentCategories(results.data);
      } else {
        setListDocumentCategories([]);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const treeCate = buildCategoryTree(listDocumentCategories);
    setTreeData(treeCate);
    setExpandedKeys(treeCate.map((item) => item.key));
    setLoading(false);
  }, [listDocumentCategories]);

  const findParentPath = useCallback(
    (
      nodes: TreeNode[],
      targetId: number,
      path: number[] = []
    ): number[] | null => {
      for (const node of nodes) {
        const newPath = [...path, node.item.id_category];
        if (node.item.id_category === targetId) return newPath;
        if (node.children) {
          const result = findParentPath(node.children, targetId, newPath);
          if (result) return result;
        }
      }
      return null;
    },
    []
  );

  const updateStatus = useCallback(
    async (record: TreeNode, status: number) => {
      if (status === 1) {
        const parentPath = findParentPath(treeData, record.item.id_category);
        if (parentPath && parentPath.length > 1) {
          const parentIds = parentPath.slice(0, -1);
          for (const parentId of parentIds) {
            await documentCategoriesService.patch(
              { status },
              { endpoint: `/${parentId}` }
            );
          }
        }
        await documentCategoriesService.patch(
          { status },
          { endpoint: `/${record.item.id_category}` }
        );
        if (record.children && record.children.length) {
          for (const child of record.children) {
            await updateStatus(child, status);
          }
        }
      } else {
        await documentCategoriesService.patch(
          {
            status: status,
          },
          {
            endpoint: `/${record.item.id_category.toString()}`,
          }
        );
        if (record.children && record.children.length) {
          for (let i = 0; i < record.children.length; i++) {
            const child = record.children[i];
            await updateStatus(child, status);
          }
        } else {
          return;
        }
      }
    },
    [findParentPath, treeData]
  );

  const stopWorking = async (record: TreeNode) => {
    try {
      setLoading(true);
      await updateStatus(record, 0);
      message.success("Dừng hoạt động danh mục thành công");
      await getDocumentCategories();
      setLoading(false);
    } catch (e) {
      message.success("Có lỗi xảy ra khi dừng hoạt động danh mục");
      console.log(e);
      setLoading(false);
    }
  };

  const startWorking = async (record: TreeNode) => {
    try {
      setLoading(true);
      await updateStatus(record, 1);
      message.success("Bật hoạt động danh mục thành công");
      await getDocumentCategories();
      setLoading(false);
    } catch (e) {
      message.success("Có lỗi xảy ra khi bật hoạt động danh mục");
      console.log(e);
      setLoading(false);
    }
  };

  const columns: ColumnsType<TreeNode> = [
    {
      title: "Tên danh mục",
      width: 200,
      render: (record) => (
        <span
          className={record.item.parent_category_id ? "cursor-pointer" : ""}
          onClick={() => {
            if (record.item.parent_category_id) {
              documentCategoryFormRef.current?.show(record.item);
            }
          }}
        >
          {record.item.name}
        </span>
      ),
    },
    {
      title: "Mô tả",
      width: 100,
      render: (record) => <span>{record.item.description}</span>,
    },
    {
      title: "Ngày tạo",
      width: 50,
      render: (record) => dayjs(record.item.createdAt).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      width: 50,
      render: (record) =>
        record.item.status ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="error">Inactive</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 50,
      render: (record) => (
        <div className="flex gap-2 min-h-8">
          {!!record.item.parent_category_id && (
            <Button
              className="!px-[10px]"
              variant="outlined"
              color={record.item.status ? "red" : "green"}
              onClick={async () => {
                if (record.item.status) {
                  await stopWorking(record);
                } else {
                  await startWorking(record);
                }
              }}
            >
              <Tooltip
                title={record.item.status ? "Dừng hoạt động" : "Bật hoạt động"}
              >
                {record.item.status ? (
                  <CloseCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )}
              </Tooltip>
            </Button>
          )}
          {!!record.item.parent_category_id && (
            <Button
              className="!px-[10px]"
              variant="outlined"
              color="red"
              onClick={async () => {
                if (record.children && record.children.length) {
                  message.error(
                    "Không thể xoá danh mục này do vẫn còn danh mục con"
                  );
                } else {
                  modal.confirm({
                    title: MEASSAGE.CONFIRM_DELETE,
                    okText: MEASSAGE.OK,
                    cancelText: MEASSAGE.NO,
                    onOk: async () => {
                      try {
                        try {
                          setLoading(true);
                          await documentCategoriesService.deleteCategory(
                            record.item.id_category.toString()
                          );
                          message.success("Xoá danh mục thành công");
                          await getDocumentCategories();
                          setLoading(false);
                        } catch (e) {
                          message.error(
                            "Có lỗi xảy ra trong quá trình xoá danh mục"
                          );
                          console.log(e);
                        }
                      } catch (error) {
                        console.log(error);
                        message.error(MEASSAGE.ERROR, 3);
                      }
                    },
                    onCancel() {},
                  });
                }
              }}
            >
              <Tooltip title="Xoá danh mục">
                <DeleteOutlined />
              </Tooltip>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-[28px]">
            Danh mục văn bản
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/dashboard/library",
                title: <span>Trang chủ</span>,
              },
              {
                title: <Tag color="#108ee9">Danh mục văn bản</Tag>,
              },
            ]}
          />
        </div>
      }
      toolbarRight={
        <div>
          <Button
            type="primary"
            className="flex !gap-[3px] items-center justify-center cursor-pointer"
            onClick={() => {
              documentCategoryFormRef.current?.show();
            }}
          >
            Thêm danh mục
          </Button>
        </div>
      }
    >
      <div className="flex gap-[10px] w-full h-[calc(100%-61.2px)] bg-[#fff] rounded-[8px]">
        <div ref={tableRef} className="flex h-full w-full">
          <Table
            loading={loading}
            bordered={false}
            pagination={false}
            columns={columns}
            dataSource={treeData}
            className="w-full"
            expandable={{
              rowExpandable: (record) =>
                Array.isArray(record.children) && record.children.length > 0,
              expandedRowKeys: expandedKeys,
              onExpandedRowsChange: (keys) => setExpandedKeys(keys as string[]),
            }}
            scroll={
              window.innerWidth < 768
                ? (tableRef.current?.offsetHeight ?? 0) >=
                  window.innerHeight - 200
                  ? { y: window.innerHeight - 200 }
                  : undefined
                : (tableRef.current?.offsetHeight ?? 0) >=
                  window.innerHeight - 190
                ? { y: window.innerHeight - 190 }
                : undefined
            }
            components={{
              body: {
                cell: (props) => (
                  <td {...props} style={{ padding: 10, ...props.style }}>
                    {props.children}
                  </td>
                ),
              },
              header: {
                cell: (props) => (
                  <th {...props} style={{ padding: 10, ...props.style }}>
                    {props.children}
                  </th>
                ),
              },
            }}
          />
        </div>
      </div>

      <DocumentCategoryForm
        ref={documentCategoryFormRef}
        treeDataCategories={treeData}
        resetData={async () => {
          await getDocumentCategories();
        }}
      />
    </PageContainer>
  );
};

export default DocumentCategories;
