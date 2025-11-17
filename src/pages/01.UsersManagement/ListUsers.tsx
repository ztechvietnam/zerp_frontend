/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  App,
  Breadcrumb,
  Button,
  Form,
  Input,
  Pagination,
  Popover,
  Skeleton,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
  TreeSelect,
} from "antd";
import { UserForm, UserFormRef } from "./UserForm";
import { MEASSAGE } from "../../components/constant/constant";
import { iconFilter } from "../../components/IconSvg/iconSvg";
import { userService } from "../../common/services/user/user-service";
import { UserEntity } from "../../common/services/user/user";
import "./usersManagement.css";
import { cloneDeep, debounce, set } from "lodash";
import Highlighter from "react-highlight-words";
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
import { roleService } from "../../common/services/role/role-service";
import { RoleEntity } from "../../common/services/role/role";
import { RedoOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";

interface FilterValues {
  keyword?: string;
  departmentIds?: string[];
}

const ListUsers = () => {
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataRoles, setDataRoles] = useState<RoleEntity[]>([]);
  const [dataUsers, setDataUsers] = useState<UserEntity[]>([]);
  const [listData, setListData] = useState<UserEntity[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { message, modal } = App.useApp();
  const [form] = useForm();
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const userFormRef = useRef<UserFormRef>(null);
  const { departmentTree, setDepartmentTree } = useSidebar();

  const findNodeByCode = (
    tree: DepartmentTreeNode[],
    value: string
  ): DepartmentTreeNode | null => {
    for (const node of tree) {
      if (node.value === value) {
        return node;
      }
      if (node.children?.length) {
        const found = findNodeByCode(node.children, value);
        if (found) return found;
      }
    }
    return null;
  };

  const getAllDeptIds = (node: DepartmentTreeNode): number[] => {
    let ids: number[] = [];

    if ((node.item as DepartmentEntity)?.id_department) {
      ids.push((node.item as DepartmentEntity).id_department);
    }

    if (node.children?.length) {
      for (const child of node.children) {
        ids = ids.concat(getAllDeptIds(child));
      }
    }

    return ids;
  };

  const getDepartmentIds = useCallback(
    (values?: string[]) => {
      if (!values || values.length === 0) {
        let allIds: number[] = [];
        for (const node of departmentTree) {
          allIds = allIds.concat(getAllDeptIds(node));
        }
        return Array.from(new Set(allIds));
      }

      let resultIds: number[] = [];
      for (const value of values) {
        const node = findNodeByCode(departmentTree, value);
        if (!node) continue;

        if (value.startsWith("branch-")) {
          for (const child of node.children || []) {
            resultIds = resultIds.concat(getAllDeptIds(child));
          }
        } else if (value.startsWith("department-")) {
          const id = (node.item as DepartmentEntity).id_department;
          if (id) {
            resultIds.push(id);
          }
        }
      }
      return Array.from(new Set(resultIds));
    },
    [departmentTree]
  );

  const getDataUser = useCallback(async () => {
    try {
      setLoading(true);
      if (filterValues) {
        const idCateFilter: number[] = getDepartmentIds(
          filterValues.departmentIds
        );
        const results = await userService.findAndFilter(
          idCateFilter,
          filterValues.keyword || ""
        );
        if (results) {
          setDataUsers(results);
        } else {
          setDataUsers([]);
        }
      } else {
        setDataUsers([]);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }, [filterValues, getDepartmentIds]);

  useEffect(() => {
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    setListData(dataUsers.slice(start, end));
  }, [dataUsers, pageIndex, pageSize]);

  useEffect(() => {
    (async () => {
      await getDataUser();
    })();
  }, [getDataUser]);

  useEffect(() => {
    (async () => {
      try {
        const results = await roleService.get({
          params: {
            page: 1,
            limit: 50,
          },
        });
        if (results) {
          setDataRoles(results);
        } else {
          setDataRoles([]);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

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
      searchWords={[filterValues?.keyword || ""]}
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
      render: (record: UserEntity) => {
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
      title: "Username",
      dataIndex: "username",
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

  const onFilter = useCallback(
    (field: keyof FilterValues, value?: string | string[]) => {
      setFilterValues((currentFilters) => {
        const newFilters = cloneDeep(currentFilters);
        set(newFilters, field, value);
        return newFilters;
      });
      setPageIndex(1);
    },
    []
  );

  const debouncedOnFilter = useMemo(
    () =>
      debounce((field: keyof FilterValues, value: any) => {
        onFilter(field, value);
      }, 1000),
    [onFilter]
  );

  const getTableScroll = () => {
    const height = tableRef.current?.offsetHeight ?? 0;
    const windowHeight = pageContainerRef.current?.offsetHeight ?? 0;
    const width = window.innerWidth;

    if (width < 428) {
      return height >= windowHeight - 271
        ? { y: windowHeight - 271, x: "max-content" }
        : undefined;
    }

    if (width < 768) {
      return height >= windowHeight - 271
        ? { y: windowHeight - 271, x: "max-content" }
        : undefined;
    }
    if (width < 1200) {
      return height >= windowHeight - 231
        ? { y: windowHeight - 231, x: "max-content" }
        : undefined;
    }
    if (width < 1488) {
      return height >= windowHeight - 234
        ? { y: windowHeight - 234, x: "max-content" }
        : undefined;
    }

    return height >= windowHeight - 209
      ? { y: windowHeight - 209, x: "max-content" }
      : undefined;
  };

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-7">
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
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4">
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
        </div>
      }
    >
      <div className="pb-2.5 filter-header">
        <Form layout="horizontal" form={form}>
          <div className="flex flex-col bg-[#f5f5f5] rounded-sm border border-[#d9d9d9] gap-2 px-2 py-1 md:flex-row md:flex-wrap md:items-center">
            {/* icon + input keyword */}
            <div className="flex flex-row items-stretch sm:items-center gap-2 md:flex-row md:items-center w-full md:w-[calc(50%-8px)] md:flex-nowrap">
              <div className="flex items-center sm:w-auto">{iconFilter}</div>
              <Form.Item
                colon={false}
                className="flex-1 m-0 min-w-[200px]"
                name="keyword"
              >
                <Input
                  className="w-full placeholder:text-[#8c8c8c] placeholder:text-[12px] placeholder:font-normal placeholder:leading-[18px] placeholder:tracking-[-0.02em]"
                  placeholder="Nhập từ khoá để tìm kiếm..."
                  maxLength={255}
                  onChange={(e) =>
                    debouncedOnFilter("keyword", e.target?.value)
                  }
                />
              </Form.Item>
            </div>
            <div className="flex flex-row items-stretch sm:items-center gap-2 md:flex-row md:items-center w-full md:w-[calc(50%-8px)] md:flex-nowrap">
              <Form.Item
                colon={false}
                className="flex-1 m-0 min-w-[200px]"
                name="categoryIds"
              >
                <TreeSelect
                  treeData={departmentTree}
                  treeCheckable
                  allowClear
                  showCheckedStrategy={"SHOW_PARENT"}
                  placeholder="Chọn phòng ban"
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  showSearch
                  filterTreeNode={(inputValue: string, treeNode: any) => {
                    const title =
                      typeof treeNode.title === "string" ? treeNode.title : "";
                    return title
                      .toLocaleLowerCase()
                      .includes(inputValue?.trim().toLocaleLowerCase());
                  }}
                  onChange={(e) => debouncedOnFilter("departmentIds", e)}
                />
              </Form.Item>
              <Tooltip title="Làm mới">
                <Button
                  type="primary"
                  disabled={Object.keys(filterValues || {}).length === 0}
                  onClick={async () => {
                    form.resetFields();
                    setFilterValues({});
                    setPageIndex(1);
                  }}
                  className="px-3 py-1 text-sm bg-white border border-[#d9d9d9] rounded hover:bg-[#fafafa] transition w-fit lg:w-auto"
                >
                  <RedoOutlined />
                </Button>
              </Tooltip>
            </div>
          </div>
        </Form>
      </div>

      <div className={`flex flex-col gap-2.5 w-full h-[calc(100%-112px)]`}>
        <div ref={tableRef} className="flex h-[calc(100%-32px)]">
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
            dataSource={listData}
            scroll={getTableScroll()}
            style={{
              boxShadow: "0px 0px 11px 0px rgba(1, 41, 112, 0.1)",
              borderRadius: "8px",
              width: "100%",
              height: "fit-content",
            }}
          />
        </div>
        <div
          className={`flex items-center ${
            dataUsers.length > 0
              ? "justify-end sm:justify-between"
              : "justify-end"
          }`}
        >
          {dataUsers.length > 0 && (
            <div className="hidden sm:flex items-center justify-between gap-[5px]">
              <span className="hidden lg:flex">Đang hiển thị</span>
              <span className="text-[#108ee9] font-medium">
                {`${
                  pageSize * (pageIndex - 1) + 1 >= dataUsers.length
                    ? dataUsers.length
                    : pageSize * (pageIndex - 1) + 1
                } - ${
                  pageSize * pageIndex >= dataUsers.length
                    ? dataUsers.length
                    : pageSize * pageIndex
                } / ${dataUsers.length}`}
              </span>
              người dùng
            </div>
          )}
          <Pagination
            className="paginationCustom"
            total={dataUsers.length}
            current={pageIndex}
            pageSize={pageSize}
            showSizeChanger
            pageSizeOptions={[10, 20, 30, 50]}
            onShowSizeChange={(current: number, size: number) => {
              setPageIndex(current);
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
        dataRoles={dataRoles}
        resetData={async () => {
          await getDataUser();
        }}
      />
    </PageContainer>
  );
};

export default ListUsers;
