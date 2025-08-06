/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { Breadcrumb, Button, Table, Tag, Tooltip } from "antd";
import {
  DocumentCategoryForm,
  DocumentCategoryFormRef,
} from "./DocumentCategoryForm";
import { CategoryEntity, TreeNode } from "../../common/services/category/category";
import { buildCategoryTree, documentCategories } from "../../components/constant/constant";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const DocumentCategories = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const documentCategoryFormRef = useRef<DocumentCategoryFormRef>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const treeCate = buildCategoryTree(documentCategories);
    setTreeData(treeCate);
    setLoading(false);
  }, []);

  const columns: ColumnsType<TreeNode> = [
    {
      title: "Tên danh mục",
      width: 250,
      render: (record) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            documentCategoryFormRef.current?.show(record.item);
          }}
        >
          {record.item.name}
        </span>
      ),
    },
    {
      title: "Mã",
      width: 80,
      render: (record) => <span>{record.item.code}</span>,
    },
    {
      title: "Ngày tạo",
      width: 50,
      render: (record) => dayjs(record.item.created).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      width: 50,
      render: (record) =>
        record.item.status ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="default">Inactive</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 50,
      render: (record) => (
        <div className="flex gap-2">
          <Button
            className="!px-[10px]"
            variant="outlined"
            color={record.item.status ? "red" : "green"}
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
          <Button className="!px-[10px]" variant="outlined" color="red">
            <Tooltip title="Xoá danh mục">
              <DeleteOutlined />
            </Tooltip>
          </Button>
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
                href: "/",
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
        <div ref={tableRef} className="flex h-full">
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
        resetData={() => {
          console.log("Reset");
        }}
      />
    </PageContainer>
  );
};

export default DocumentCategories;
