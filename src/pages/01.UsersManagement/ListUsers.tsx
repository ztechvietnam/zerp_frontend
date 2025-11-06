import React, { useCallback, useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  App,
  Breadcrumb,
  Button,
  Input,
  InputRef,
  Pagination,
  Popover,
  Skeleton,
  Table,
  TableColumnsType,
  Tag,
} from "antd";
import { UserForm, UserFormRef } from "./UserForm";
import { MEASSAGE } from "../../components/constant/constant";
import { iconClose } from "../../components/IconSvg/iconSvg";
import { userService } from "../../common/services/user/user-service";
import { UserEntity } from "../../common/services/user/user";
import "./usersManagement.css";
import { debounce } from "lodash";
import Highlighter from "react-highlight-words";
import { Role } from "../../common/services/role/role";
import "../../index.css";
import { useSidebar } from "../../context/SidebarContext";
import { departmentService } from "../../common/services/department/department-service";
import { branchesService } from "../../common/services/department/branches-service";
import {
  BranchEntity,
  DepartmentEntity,
  DepartmentTreeNode,
} from "../../common/services/department/department";
import { ColumnFilterItem } from "antd/es/table/interface";

const RoleUser: Record<Role, string> = {
  [Role.Admin]: "Quản trị viên",
  [Role.User]: "Người dùng",
};

const ListUsers = () => {
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataUsers, setDataUsers] = useState<UserEntity[]>([]);
  const [dataFilter, setDataFilter] = useState<UserEntity[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { message, modal } = App.useApp();
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const userFormRef = useRef<UserFormRef>(null);
  const { departmentTree, setDepartmentTree } = useSidebar();

  const getDataUser = useCallback(async () => {
    try {
      setLoading(true);
      const results = await userService.get({
        params: {
          page: pageIndex,
          limit: pageSize,
        },
      });
      if (results) {
        setTotalData(results.total);
        setDataUsers(results.data);
      } else {
        setTotalData(0);
        setDataUsers([]);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }, [pageIndex, pageSize]);

  useEffect(() => {
    (async () => {
      await getDataUser();
    })();
  }, [getDataUser]);

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
        selectable: false,
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

  const getDataDepartment = useCallback(async () => {
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
    setDepartmentTree(treeDep);
    setLoading(false);
  }, [setDepartmentTree]);

  useEffect(() => {
    (async () => {
      if (departmentTree.length === 0) {
        await getDataDepartment();
      }
    })();
  }, [departmentTree, getDataDepartment]);

  const getDepartmentBreadcrumb = useCallback(
    (departmentId: number): string | null => {
      const findPath = (
        nodes: DepartmentTreeNode[],
        targetId: number,
        path: DepartmentTreeNode[]
      ): DepartmentTreeNode[] | null => {
        for (const node of nodes) {
          const item = node.item as any;
          const newPath = [...path, node];

          if (item.id_department === targetId) {
            return newPath;
          }

          if (node.children && node.children.length > 0) {
            const result = findPath(node.children, targetId, newPath);
            if (result) return result;
          }
        }
        return null;
      };

      for (const branchNode of departmentTree) {
        const path = findPath(branchNode.children || [], departmentId, [
          branchNode,
        ]);
        if (path) {
          return path.map((n) => n.title).join(" > ");
        }
      }

      return null;
    },
    [departmentTree]
  );

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const highlightText = (text: string) => (
    <Highlighter
      highlightStyle={{ backgroundColor: "#ffff00", padding: 0 }}
      searchWords={[keyword]}
      autoEscape
      textToHighlight={text || ""}
      findChunks={({ textToHighlight, searchWords }) => {
        const text = removeVietnameseTones(textToHighlight.toLowerCase());
        const searchWord =
          typeof searchWords[0] === "string" ? searchWords[0] : "";
        const search = removeVietnameseTones(searchWord.toLowerCase());
        if (!search) return [];

        const chunks: { start: number; end: number }[] = [];
        let startIndex = 0;

        while (true) {
          const index = text.indexOf(search, startIndex);
          if (index === -1) break;
          chunks.push({ start: index, end: index + search.length });
          startIndex = index + search.length;
        }

        return chunks;
      }}
    />
  );

  useEffect(() => {
    if (keyword) {
      const dataAfterFilter = dataUsers.filter((user) => {
        return (
          (user.firstName &&
            removeVietnameseTones(user.firstName)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase()))) ||
          (user.lastName &&
            removeVietnameseTones(user.lastName)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase()))) ||
          (user.email &&
            removeVietnameseTones(user.email)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase())))
        );
      });
      setDataFilter(dataAfterFilter);
    } else {
      setDataFilter(dataUsers);
    }
  }, [keyword, dataUsers]);

  const convertDepartmentTreeToFilters = useCallback(
    (tree: DepartmentTreeNode[]): ColumnFilterItem[] => {
      return tree.map((node) => ({
        text: node.title,
        value: node.key,
        children: node.children
          ? convertDepartmentTreeToFilters(node.children)
          : undefined,
      }));
    },
    []
  );

  const columns: TableColumnsType<UserEntity> = [
    {
      title: "Họ và tên",
      render: (value, record: UserEntity) => {
        return (
          <span
            className="cursor-pointer"
            onClick={() => {
              userFormRef.current?.show(record);
            }}
          >
            {highlightText(
              `${record?.lastName || ""} ${record?.firstName || ""}`.trim()
            )}
          </span>
        );
      },
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }
      },
      filterDropdown: () => (
        <div
          className="flex flex-col gap-2 p-2"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5">
            <Input
              ref={inputRef}
              onChange={debounce((e) => setKeyword(e.target.value), 500)}
              allowClear
              autoFocus
            />
          </div>
        </div>
      ),
    },
    {
      title: "Địa chỉ email",
      dataIndex: "email",
      render: (value, record: UserEntity) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            userFormRef.current?.show(record);
          }}
        >
          {highlightText(value)}
        </span>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      filters: convertDepartmentTreeToFilters(departmentTree),
      filterMode: "tree",
      filterSearch: true,
      onFilter: (value, record) =>
        value
          ? record.department?.id_department ===
            parseInt((value as string).replace("department-", ""))
          : true,
      render(value) {
        return (
          <>
            {departmentTree.length > 0 ? (
              <Popover content={getDepartmentBreadcrumb(value?.id_department)}>
                <Tag color="processing" className="cursor-pointer">
                  {value?.name}
                </Tag>
              </Popover>
            ) : (
              <Skeleton />
            )}
          </>
        );
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      render(value) {
        return (
          <Tag color="processing">
            {value ? value?.role_name : "Người dùng"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render(value) {
        return (
          <Tag color={value?.name === "Active" ? "success" : "error"}>
            {value?.name}
          </Tag>
        );
      },
    },
  ];

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-[28px]">
            Quản lý người dùng
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/dashboard/management",
                title: <span>Trang chủ</span>,
              },
              {
                title: <Tag color="#108ee9">Quản lý người dùng</Tag>,
              },
            ]}
          />
        </div>
      }
      toolbarRight={
        <div className="flex items-center gap-4">
          <Button
            type="primary"
            size="middle"
            onClick={() => {
              userFormRef.current?.show();
            }}
          >
            Thêm mới
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              // type="dashed"
              color="red"
              variant="solid"
              size="middle"
              onClick={() => {
                modal.confirm({
                  title: MEASSAGE.CONFIRM_DELETE,
                  okText: MEASSAGE.OK,
                  cancelText: MEASSAGE.NO,
                  onOk: async () => {
                    try {
                      await Promise.all([
                        ...selectedRowKeys.map((id) => {
                          userService.deleteById(id);
                        }),
                      ]);
                      setSelectedRowKeys([]);
                      message.success(MEASSAGE.DELETE_SUCCESS);
                      setPageIndex(1);
                      await getDataUser();
                    } catch (error) {
                      console.log(error);
                      message.error(MEASSAGE.ERROR, 3);
                    }
                  },
                  onCancel() {},
                });
              }}
            >
              Xóa
            </Button>
          )}

          {selectedRowKeys.length > 0 && (
            <Button
              icon={iconClose}
              onClick={() => {
                setSelectedRowKeys([]);
              }}
            >
              Đã chọn {selectedRowKeys.length} bản ghi
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-[10px] w-full h-[calc(100%-60px)]">
        <div ref={tableRef} className="flex h-full">
          <Table
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (e) => {
                setSelectedRowKeys(e);
              },
            }}
            pagination={false}
            rowKey="id"
            columns={columns}
            dataSource={dataFilter}
            scroll={
              window.innerWidth < 1025
                ? window.innerWidth < 544
                  ? (tableRef.current?.offsetHeight ?? 0) >=
                    window.innerHeight - 244
                    ? { y: window.innerHeight - 244 }
                    : undefined
                  : (tableRef.current?.offsetHeight ?? 0) >=
                    window.innerHeight - 221
                  ? { y: window.innerHeight - 221 }
                  : undefined
                : (tableRef.current?.offsetHeight ?? 0) >=
                  window.innerHeight - 233
                ? { y: window.innerHeight - 233 }
                : undefined
            }
            style={{
              boxShadow: "0px 0px 11px 0px rgba(1, 41, 112, 0.1)",
              borderRadius: "8px",
              width: "100%",
              height: "fit-content",
            }}
          />
        </div>
        <div className={`flex items-center ${totalData > 0 ? 'justify-between': 'justify-end'}`}>
          {totalData > 0 && (
            <div className="flex items-center justify-between gap-[5px]">
              <span className="hidden lg:flex">Đang hiển thị</span>
              <span className="text-[#108ee9] font-medium">
                {`${
                  pageSize * (pageIndex - 1) + 1 >= totalData
                    ? totalData
                    : pageSize * (pageIndex - 1) + 1
                } - ${
                  pageSize * pageIndex >= totalData
                    ? totalData
                    : pageSize * pageIndex
                } / ${totalData}`}
              </span>
              người dùng
            </div>
          )}
          <Pagination
            className="paginationCustom"
            total={totalData}
            current={pageIndex}
            pageSize={pageSize}
            showSizeChanger
            pageSizeOptions={[10, 20, 30, 50]}
            onShowSizeChange={(current: number, size: number) => {
              setPageSize(size);
            }}
            onChange={(currentPage) => {
              setPageIndex(currentPage);
            }}
          />
        </div>
      </div>
      <UserForm
        ref={userFormRef}
        resetData={async () => {
          await getDataUser();
        }}
      />
    </PageContainer>
  );
};

export default ListUsers;
