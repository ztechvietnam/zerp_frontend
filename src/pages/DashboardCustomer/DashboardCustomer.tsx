/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  Breadcrumb,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  ProfileOutlined,
  RedoOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import "./dashboardCustomer.css";
import { cloneDeep, debounce, max, set } from "lodash";
import {
  DashboardCustomerEntity,
  dataDashboardCustomer,
} from "../../components/constant/constant";
import dayjs from "dayjs";
import ScheduleTime from "./ScheduleTime";
import { iconFilter } from "../../components/IconSvg/iconSvg";
import { useForm } from "antd/es/form/Form";

export interface FilterValues {
  customer_name?: string;
  startDate?: string;
  endDate?: string;
  status?: number;
}

const DashboardCustomer = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [listDocuments, setListDocuments] = useState<DashboardCustomerEntity[]>(
    []
  );
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [form] = useForm();

  const getDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setListDocuments(dataDashboardCustomer);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const listData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return listDocuments.slice(start, start + pageSize);
  }, [listDocuments, pageIndex, pageSize]);

  useEffect(() => {
    (async () => {
      await getDocuments();
    })();
  }, [getDocuments]);

  const columns = [
    {
      title: "THÔNG TIN BỆNH NHÂN",
      width: 250,
      dataIndex: "patient",
      render(value: any) {
        return (
          <div className="flex flex-col">
            <span>{`${value?.name} | ${value?.phone}`}</span>
            <span>{`MaYTe: ${value?.customer_id}`}</span>
          </div>
        );
      },
    },
    {
      title: "TIẾP ĐÓN",
      width: 150,
      dataIndex: "created_at",
      render(value: any) {
        return <span>{dayjs(value).format("DD/MM/YYYY HH:mm")}</span>;
      },
    },
    {
      title: "PHÒNG KHÁM CHẨN ĐOÁN",
      width: 250,
      dataIndex: "diagnostic_clinic",
      render(value: any) {
        return <ScheduleTime data={value} />;
      },
    },
    {
      title: "CẬN LÂM SÀNG",
      width: 250,
      dataIndex: "clinical_examination",
      render(value: any) {
        return <ScheduleTime data={value} />;
      },
    },
    {
      title: "PHÒNG KHÁM KẾT LUẬN",
      width: 250,
      dataIndex: "clinic_concluded",
      render(value: any) {
        return <ScheduleTime data={value} />;
      },
    },
    {
      title: "TÌNH TRẠNG",
      width: 150,
      dataIndex: "status",
      render(value: any) {
        return (
          <div>
            {value === 1 ? (
              <div className="flex gap-1 w-fit items-center border bg-[#f4fff0] border-[#67b27b] px-1.5 py-0.5 rounded-[50px]">
                <div className="bg-[#23ce64] w-1.5 h-1.5 rounded-full"></div>
                Tốt
              </div>
            ) : (
              <div className="flex gap-1 w-fit items-center border bg-[#ffebeb] border-[#ff9c9c] px-1.5 py-0.5 rounded-[50px]">
                <div className="bg-[#f83a42] w-1.5 h-1.5 rounded-full"></div>
                Quá thời gian
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "",
      width: 50,
      render() {
        return (
          <div className="w-full cursor-pointer">
            <Tooltip title="Xem chi tiết">
              <ProfileOutlined />
            </Tooltip>
          </div>
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

  const hasValidFilterValues = (values: any) => {
    if (!values) return false;

    return Object.values(values).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return value !== undefined && value !== null;
    });
  };

  const getTableScroll = () => {
    const height = tableRef.current?.offsetHeight ?? 0;
    const windowHeight = pageContainerRef.current?.offsetHeight ?? 0;
    const width = window.innerWidth;

    if (width < 428) {
      return height >= windowHeight - 275
        ? { y: windowHeight - 275, x: "max-content" }
        : undefined;
    }

    if (width < 768) {
      return height >= windowHeight - 275
        ? { y: windowHeight - 275, x: "max-content" }
        : undefined;
    }
    if (width < 1200) {
      return height >= windowHeight - 235
        ? { y: windowHeight - 235, x: "max-content" }
        : undefined;
    }
    if (width < 1488) {
      return height >= windowHeight - 238
        ? { y: windowHeight - 238, x: "max-content" }
        : undefined;
    }

    return height >= windowHeight - 213
      ? { y: windowHeight - 213, x: "max-content" }
      : undefined;
  };

  return (
    <PageContainer
      className="dashboard-library"
      // toolbarLeft={
      //   <div className="w-full">
      //     <Tabs
      //       className="tab-header"
      //       defaultActiveKey={undefined}
      //       moreIcon={
      //         <div className="flex gap-1 items-center">
      //           More <DownOutlined style={{ fontSize: 10}}/>
      //         </div>
      //       }
      //       tabBarExtraContent={
      //         <DatePicker
      //           className="w-40"
      //           defaultValue={dayjs()}
      //           format="[Tháng] M, YYYY"
      //           suffixIcon={<DownOutlined />}
      //           prefix={<CalendarOutlined />}
      //           picker="month"
      //         />
      //       }
      //       items={departmentTree}
      //       onChange={(e) => {
      //         const currentDep = dataDepartment.find(
      //           (dep) => dep.id_department.toString() === e.toString()
      //         );
      //         setDepSelected(currentDep ? currentDep : null);
      //       }}
      //     />
      //   </div>
      // }
    >
      <Spin spinning={loading}>
        <div className="flex-1">
          <Row className="h-full">
            <Col span={24}>
              <PageContainer
                ref={pageContainerRef}
                toolbarLeft={
                  <div>
                    <h1 className="text-[24px] mb-1 font-semibold text-[#006699] leading-7">
                      Khoa khám bệnh
                    </h1>
                    <Breadcrumb
                      items={[
                        {
                          title: <span>Dashboard</span>,
                        },
                        { title: <Tag color="#108ee9">Khoa khám bệnh</Tag> },
                      ]}
                    />
                  </div>
                }
              >
                <div className="pb-2.5 filter-header">
                  <Form layout="horizontal" form={form}>
                    <div className="flex flex-col bg-[#f5f5f5] rounded-sm border border-[#d9d9d9] gap-2 px-2 py-1 sm:flex-row sm:flex-wrap sm:items-center">
                      <div
                        className={`flex flex-row items-stretch sm:items-center gap-2 w-full xl:w-[calc((100%-200px-16px)/2)] sm:flex-nowrap`}
                      >
                        <div className="flex items-center sm:w-auto">
                          {iconFilter}
                        </div>

                        <Form.Item
                          colon={false}
                          className="flex-1 m-0"
                          name="customer_name"
                        >
                          <Input
                            className="w-full"
                            placeholder="Nhập tên bệnh nhân để tìm kiếm..."
                            maxLength={255}
                            onChange={(e) =>
                              debouncedOnFilter(
                                "customer_name",
                                e.target?.value
                              )
                            }
                          />
                        </Form.Item>
                      </div>

                      <div className="flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-[calc(100%-168px)] xl:w-[calc((100%-200px-16px)/2)] xl:min-w-[300px] sm:flex-nowrap">
                        <div className="flex items-center gap-0.5 w-full">
                          <Form.Item
                            colon={false}
                            className="m-0 w-[calc(50%-9px)] min-w-[114px]"
                            name={"startDate"}
                          >
                            <DatePicker
                              className="w-full dateFilter"
                              format="DD/MM/YYYY"
                              onChange={(v) =>
                                debouncedOnFilter(
                                  "startDate",
                                  v.format("DD/MM/YYYY")
                                )
                              }
                              placeholder="Từ ngày"
                              disabledDate={(date) => {
                                const endDate = form.getFieldValue("endDate");
                                return (
                                  !!endDate && date.isAfter(endDate, "day")
                                );
                              }}
                            />
                          </Form.Item>
                          <SwapRightOutlined />
                          <Form.Item
                            colon={false}
                            className="m-0 w-[calc(50%-9px)] min-w-[114px]"
                            name={"endDate"}
                          >
                            <DatePicker
                              className="w-full dateFilter"
                              format="DD/MM/YYYY"
                              onChange={(v) =>
                                debouncedOnFilter(
                                  "endDate",
                                  v.format("DD/MM/YYYY")
                                )
                              }
                              placeholder="Đến ngày"
                              disabledDate={(date) => {
                                const startDate =
                                  form.getFieldValue("startDate");
                                return (
                                  !!startDate && date.isBefore(startDate, "day")
                                );
                              }}
                            />
                          </Form.Item>
                        </div>
                      </div>

                      <div className="flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-50 xl:ml-0 sm:flex-nowrap">
                        <Form.Item
                          colon={false}
                          className="m-0 w-full"
                          name="status"
                        >
                          <Select
                            allowClear
                            options={[
                              { label: "Quá thời gian", value: "0" },
                              { label: "Tốt", value: "1" },
                            ]}
                            placeholder="Tình trạng"
                            className="selectFilter"
                            onChange={(value) =>
                              debouncedOnFilter("status", value)
                            }
                          />
                        </Form.Item>
                        <Tooltip title="Làm mới">
                          <Button
                            type="primary"
                            disabled={!hasValidFilterValues(filterValues)}
                            onClick={async () => {
                              form.resetFields();
                              setFilterValues({});
                              setPageIndex(1);
                            }}
                            className="px-3 py-1 text-sm bg-white border border-[#d9d9d9] rounded hover:bg-[#fafafa] 
                         transition w-fit lg:w-auto"
                          >
                            <RedoOutlined />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  </Form>
                </div>
                <div
                  className={`flex flex-col gap-2.5 w-full h-[calc(100%-90px)]`}
                >
                  <div ref={tableRef} className="flex h-[calc(100%-32px)]">
                    <Table
                      rowKey="id"
                      columns={columns}
                      dataSource={listData}
                      pagination={false}
                      scroll={getTableScroll()}
                      style={{
                        boxShadow: "0px 0px 11px 0px rgba(1, 41, 112, 0.1)",
                        borderRadius: "8px",
                        width: "100%",
                        height: "fit-content",
                      }}
                      rowSelection={{
                        selectedRowKeys,
                        onChange: (e) => {
                          setSelectedRowKeys(e);
                        },
                      }}
                      title={() => (
                        <span className="font-semibold">
                          Danh sách bệnh nhân hiện tại
                        </span>
                      )}
                      footer={() => (
                        <div
                          className={`flex items-center ${
                            listDocuments.length > 0
                              ? "justify-end sm:justify-between"
                              : "justify-end"
                          }`}
                        >
                          {listDocuments.length > 0 && (
                            <div className="hidden sm:flex items-center justify-between gap-[5px]">
                              <span className="hidden lg:flex">
                                Đang hiển thị
                              </span>
                              <span className="text-[#108ee9] font-medium">
                                {`${
                                  pageSize * (pageIndex - 1) + 1 >=
                                  listDocuments.length
                                    ? listDocuments.length
                                    : pageSize * (pageIndex - 1) + 1
                                } - ${
                                  pageSize * pageIndex >= listDocuments.length
                                    ? listDocuments.length
                                    : pageSize * pageIndex
                                } / ${listDocuments.length}`}
                              </span>
                              bệnh nhân
                            </div>
                          )}
                          <Pagination
                            className="paginationCustom"
                            total={listDocuments.length}
                            current={pageIndex}
                            pageSize={pageSize}
                            showSizeChanger
                            pageSizeOptions={[10, 20, 30, 50]}
                            onShowSizeChange={(
                              current: number,
                              size: number
                            ) => {
                              setPageSize(size);
                            }}
                            onChange={(currentPage) => {
                              setPageIndex(currentPage);
                            }}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </PageContainer>
            </Col>
          </Row>
        </div>
      </Spin>
    </PageContainer>
  );
};

export default DashboardCustomer;
