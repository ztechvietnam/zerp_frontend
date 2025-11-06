import { Breadcrumb, Pagination, Table, TableColumnsType, Tag } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RoleEntity } from "../../common/services/role/role";
import PageContainer from "../../components/PageContainer/PageContainer";
import { roleService } from "../../common/services/role/role-service";

const ListRoles = () => {
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataRoles, setDataRoles] = useState<RoleEntity[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const getDataUser = useCallback(async () => {
    try {
      setLoading(true);
      const results = await roleService.get({
        params: {
          page: pageIndex,
          limit: pageSize,
        },
      });
      if (results) {
        setTotalData(results.length);
        setDataRoles(results);
      } else {
        setTotalData(0);
        setDataRoles([]);
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

  const columns: TableColumnsType<RoleEntity> = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (value, record: RoleEntity, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Tên quyền",
      dataIndex: "role_name",
      render: (value, record: RoleEntity) => {
        return <span>{record.role_name}</span>;
      },
    },
    {
      title: "Mã quyền",
      render: (value, record: RoleEntity) => {
        return <span>{record.name}</span>;
      },
    },
  ];

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-[28px]">
            Quản lý phân quyền
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/dashboard/management",
                title: <span>Trang chủ</span>,
              },
              {
                title: <Tag color="#108ee9">Quản lý phân quyền</Tag>,
              },
            ]}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-[10px] w-full h-[calc(100%-60px)]">
        <div ref={tableRef} className="flex h-full">
          <Table
            loading={loading}
            rowKey="id"
            columns={columns}
            dataSource={dataRoles}
            pagination={false}
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
              quyền
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
    </PageContainer>
  );
};

export default ListRoles;
