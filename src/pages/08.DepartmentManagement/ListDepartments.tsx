/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { Breadcrumb, Button, Table, Tag, Tooltip } from "antd";
import { DepartmentForm, DepartmentFormRef, TYPE_DEP } from "./DepartmentForm";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  BranchEntity,
  DepartmentEntity,
  DepartmentTreeNode,
} from "../../common/services/department/department";
import { departmentService } from "../../common/services/department/department-service";
import { branchesService } from "../../common/services/department/branches-service";

const ListDepartments = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<DepartmentTreeNode[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const departmentFormRef = useRef<DepartmentFormRef>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const buildDepartmentTree = (
    branches: BranchEntity[],
    departments: DepartmentEntity[]
  ): DepartmentTreeNode[] => {
    if (!Array.isArray(branches) || !Array.isArray(departments)) return [];

    const branchMap = new Map<number, DepartmentTreeNode>();
    const depMap = new Map<number, DepartmentTreeNode>();

    branches.forEach((branch) => {
      branchMap.set(branch.id_branch, {
        title: branch.name,
        item: branch,
        value: `branch-${branch.id_branch}`,
        key: `branch-${branch.id_branch}`,
        children: [],
      });
    });

    departments.forEach((dep) => {
      depMap.set(dep.id_department, {
        title: dep.name,
        item: dep,
        value: `department-${dep.id_department}`,
        key: `department-${dep.id_department}`,
        children: [],
      });
    });

    departments.forEach((dep) => {
      const node = depMap.get(dep.id_department)!;
      if (dep.parent_department_id) {
        const parentNode = depMap.get(dep.parent_department_id);
        if (parentNode) {
          parentNode.children!.push(node);
        } else {
          const branchNode = branchMap.get(dep.branch_id);
          branchNode?.children?.push(node);
        }
      } else {
        const branchNode = branchMap.get(dep.branch_id);
        branchNode?.children?.push(node);
      }
    });

    const cleanChildren = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0)
          cleanChildren(node.children);
        else delete node.children;
      });
    };

    const treeData = Array.from(branchMap.values());
    cleanChildren(treeData);

    return treeData;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const departments = await departmentService.get({
        params: {
          limit: 100,
        },
      });
      const branches = await branchesService.get({
        params: {
          limit: 100,
        },
      });
      const treeDep = buildDepartmentTree(branches.data, departments.data);
      setExpandedKeys(treeDep.map((item) => item.key));
      setTreeData(treeDep);
      setLoading(false);
    })();
  }, []);

  const columns: ColumnsType<DepartmentTreeNode> = [
    {
      title: "Tên đơn vị",
      width: 150,
      render: (record) => (
        <span
          className={record.item.is_system ? "cursor-default" : "cursor-pointer"}
          onClick={() => {
            if (record.item.is_system) return;
            departmentFormRef.current?.show(
              record.children && record.children.length
                ? TYPE_DEP.PARENT
                : TYPE_DEP.CHILD,
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
      width: 50,
      render: (record) => (
        <span>{record.item.branch_code || record.item.department_code}</span>
      ),
    },
    {
      title: "Địa chỉ",
      width: 80,
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
        <div className="flex gap-2 min-h-8">
          {record.item.is_system ? null : (
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
          )}
          {record.item.is_system ? null : (
            <Button className="!px-[10px]" variant="outlined" color="red">
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

      <DepartmentForm
        ref={departmentFormRef}
        treeDataDepartment={treeData}
        resetData={() => {
          console.log("Reset");
        }}
      />
    </PageContainer>
  );
};

export default ListDepartments;
