/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { Breadcrumb, Button, Table, Tag, Tooltip } from "antd";
import { DepartmentForm, DepartmentFormRef, TYPE_DEP } from "./DepartmentForm";
import { dataDepartments } from "../../components/constant/constant";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  DepartmentEntity,
  DepartmentTreeNode,
} from "../../common/services/department/department";

const ListDepartments = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<DepartmentTreeNode[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const departmentFormRef = useRef<DepartmentFormRef>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const buildDepartmentTree = (
    departments: DepartmentEntity[]
  ): DepartmentTreeNode[] => {
    const categoryMap = new Map<string, DepartmentTreeNode>();
    departments.forEach((department) => {
      categoryMap.set(department.code, {
        item: department,
        key: department.code,
        children: [],
      });
    });

    const tree: DepartmentTreeNode[] = [];
    departments.forEach((department) => {
      const node = categoryMap.get(department.code)!;

      if (department.parentCode) {
        const parentNode = categoryMap.get(department.parentCode);
        if (parentNode) {
          parentNode.children!.push(node);
        } else {
          console.warn(
            `⚠️ Không tìm thấy parent với code: '${department.parentCode}' cho node '${department.code}'`
          );
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });
    const cleanEmptyChildren = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          cleanEmptyChildren(node.children);
        } else {
          delete node.children;
        }
      });
    };

    cleanEmptyChildren(tree);
    return tree;
  };

  useEffect(() => {
    setLoading(true);
    const treeCate = buildDepartmentTree(dataDepartments);
    setTreeData(treeCate);
    setLoading(false);
  }, []);

  const columns: ColumnsType<DepartmentTreeNode> = [
    {
      title: "Tên đơn vị",
      width: 200,
      render: (record) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            departmentFormRef.current?.show(
              record.children && record.children.length ? TYPE_DEP.PARENT : TYPE_DEP.CHILD,
              record.item
            );
          }}
        >
          {record.item.name}
        </span>
      ),
    },
    {
      title: "Mã đơn vị",
      width: 80,
      render: (record) => <span>{record.item.code}</span>,
    },
    {
      title: "Địa chỉ",
      width: 100,
      render: (record) => <span>{record.item.address}</span>,
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
            Danh sách đơn vị
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/",
                title: <span>Trang chủ</span>,
              },
              {
                title: <Tag color="#108ee9">Danh sách đơn vị</Tag>,
              },
            ]}
          />
        </div>
      }
      toolbarRight={
        <div className="flex items-center gap-4">
          <Button
            className="flex !gap-[3px] items-center justify-center cursor-pointer"
            onClick={() => {
              departmentFormRef.current?.show(TYPE_DEP.PARENT);
            }}
          >
            Thêm đơn vị
          </Button>
          <Button
            className="flex !gap-[3px] items-center justify-center cursor-pointer"
            onClick={() => {
              departmentFormRef.current?.show(TYPE_DEP.CHILD);
            }}
          >
            Thêm phòng ban
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

      <DepartmentForm
        ref={departmentFormRef}
        resetData={() => {
          console.log("Reset");
        }}
      />
    </PageContainer>
  );
};

export default ListDepartments;
