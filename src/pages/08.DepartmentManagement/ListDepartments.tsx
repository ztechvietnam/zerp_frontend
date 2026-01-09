/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { App, Breadcrumb, Button, Table, Tag, Tooltip } from "antd";
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
import { MEASSAGE } from "../../components/constant/constant";
import { compact } from "lodash";
import { useSidebar } from "../../context/SidebarContext";

const ListDepartments = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<DepartmentTreeNode[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { message, modal } = App.useApp();
  const departmentFormRef = useRef<DepartmentFormRef>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const { setDepartmentTree } = useSidebar();

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
        selectable: true,
        children: [],
      });
    });

    departments.forEach((dep) => {
      depMap.set(dep.id_department, {
        title: dep.name,
        item: dep,
        value: `department-${dep.id_department}`,
        key: `department-${dep.id_department}`,
        selectable: true,
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

  const getData = useCallback(async () => {
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
    setDepartmentTree(treeDep);
    setLoading(false);
  }, [setDepartmentTree]);

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, [getData]);

  const findParentPath = useCallback(
    (
      nodes: DepartmentTreeNode[],
      targetId: number,
      path: number[] = []
    ): number[] | null => {
      for (const node of nodes) {
        const newPath = [
          ...path,
          (node.item as DepartmentEntity).id_department,
        ];
        if ((node.item as DepartmentEntity).id_department === targetId)
          return newPath;
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
    async (record: DepartmentTreeNode, status: number) => {
      if (status === 1) {
        const parentPath = compact(
          findParentPath(
            treeData,
            (record.item as DepartmentEntity).id_department
          )
        );
        if (parentPath && parentPath.length > 1) {
          const parentIds = parentPath.slice(0, -1);
          for (const parentId of parentIds) {
            await departmentService.patch(
              { status },
              { endpoint: `/${parentId}` }
            );
          }
        }
        await departmentService.patch(
          { status },
          { endpoint: `/${(record.item as DepartmentEntity).id_department}` }
        );
        if (record.children && record.children.length) {
          for (const child of record.children) {
            await updateStatus(child, status);
          }
        }
      } else {
        await departmentService.patch(
          {
            status: status,
          },
          {
            endpoint: `/${(
              record.item as DepartmentEntity
            ).id_department.toString()}`,
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

  const stopWorking = async (record: DepartmentTreeNode) => {
    try {
      setLoading(true);
      await updateStatus(record, 0);
      message.success("Dừng hoạt động danh mục thành công");
      await getData();
      setLoading(false);
    } catch (e) {
      message.success("Có lỗi xảy ra khi dừng hoạt động danh mục");
      console.log(e);
      setLoading(false);
    }
  };

  const startWorking = async (record: DepartmentTreeNode) => {
    try {
      setLoading(true);
      await updateStatus(record, 1);
      message.success("Bật hoạt động danh mục thành công");
      await getData();
      setLoading(false);
    } catch (e) {
      message.success("Có lỗi xảy ra khi bật hoạt động danh mục");
      console.log(e);
      setLoading(false);
    }
  };

  const columns: ColumnsType<DepartmentTreeNode> = [
    {
      title: "Tên đơn vị",
      width: 150,
      render: (record) => (
        <span
          className={
            record.item.is_system ? "cursor-default" : "cursor-pointer"
          }
          onClick={() => {
            if (record.item.is_system) return;
            departmentFormRef.current?.show(
              record.value.startsWith("branch-")
                ? TYPE_DEP.BRANCH
                : TYPE_DEP.DEPARTMENT,
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
          {record.item.is_system ? null : (
            <Tooltip
              title={record.item.status ? "Dừng hoạt động" : "Bật hoạt động"}
            >
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
                {record.item.status ? (
                  <CloseCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )}
              </Button>
            </Tooltip>
          )}
          {record.item.is_system ? null : (
            <Tooltip title="Xoá phòng ban">
              <Button
                className="!px-[10px]"
                variant="outlined"
                color="red"
                onClick={async () => {
                  if (record.children && record.children.length) {
                    message.error(
                      "Không thể xoá phòng ban này do vẫn còn phòng ban con"
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
                            await departmentService.deleteDepartment(
                              record.item.id_department.toString()
                            );
                            message.success("Xoá phòng ban thành công");
                            await getData();
                            setLoading(false);
                          } catch (e) {
                            message.error(
                              "Có lỗi xảy ra trong quá trình xoá phòng ban"
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
                <DeleteOutlined />
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const getTableScroll = () => {
    const height = tableRef.current?.offsetHeight ?? 0;
    const windowHeight = pageContainerRef.current?.offsetHeight ?? 0;
    const width = window.innerWidth;

    if (width < 768) {
      return height >= windowHeight - 165
        ? { y: windowHeight - 165, x: "max-content" }
        : undefined;
    }

    return height >= windowHeight - 144
      ? { y: windowHeight - 144, x: "max-content" }
      : undefined;
  };

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-1 font-semibold text-[#006699] leading-7">
            Danh sách đơn vị
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/dashboard/management",
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
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4">
          <Button
            type="primary"
            className="flex gap-[3px]! items-center justify-center cursor-pointer"
            onClick={() => {
              departmentFormRef.current?.show(TYPE_DEP.BRANCH);
            }}
          >
            Thêm đơn vị
          </Button>
          <Button
            type="primary"
            className="flex gap-[3px]! items-center justify-center cursor-pointer"
            onClick={() => {
              departmentFormRef.current?.show(TYPE_DEP.DEPARTMENT);
            }}
          >
            Thêm phòng ban
          </Button>
        </div>
      }
    >
      <div className="flex gap-2.5 w-full h-[calc(100%-61.2px)] bg-[#fff] rounded-lg">
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
            scroll={getTableScroll()}
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
        resetData={async () => {
          await getData();
        }}
      />
    </PageContainer>
  );
};

export default ListDepartments;
