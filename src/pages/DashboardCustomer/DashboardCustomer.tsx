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
  Col,
  DatePicker,
  Pagination,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import "./dashboardCustomer.css";
import { cloneDeep, debounce, set, uniqBy } from "lodash";
import dayjs, { Dayjs } from "dayjs";
import ScheduleTime from "./ScheduleTime";
import { patientDashboardService } from "../../common/services/patient/patientDashboardService";
import {
  CustomerParaclinicalEntity,
  PatientDashboardEntity,
} from "../../common/services/patient/patientDashboard";
import { PatientEntity } from "../../common/services/patient/patient";
import { ColumnsType } from "antd/es/table";
import { IdcardOutlined, PhoneOutlined } from "@ant-design/icons";

const DashboardCustomer = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataDashboard, setDataDashboard] = useState<PatientDashboardEntity[]>(
    []
  );
  const [listData, setListData] = useState<PatientDashboardEntity[]>([]);
  const [receptionDate, setReceptionDate] = useState<Dayjs>(dayjs());
  const [areaSelected, setAreaSelected] = useState<string>("all");
  const [totalData, setTotalData] = useState<number>(0);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const getDataDashboard = useCallback(
    async (formValues?: any) => {
      try {
        setLoading(true);
        const results = await patientDashboardService.get({
          params: {
            page: pageIndex,
            limit: pageSize,
          },
        });
        if (results) {
          setDataDashboard(results.data || []);
        } else {
          setDataDashboard([]);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    },
    [pageIndex, pageSize]
  );

  useEffect(() => {
    let intervalId: any | null = null;

    if (pageIndex === 1) {
      intervalId = setInterval(() => {
        getDataDashboard();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pageIndex, getDataDashboard]);

  useEffect(() => {
    (async () => {
      await getDataDashboard();
    })();
  }, [getDataDashboard]);

  useEffect(() => {
    if (dataDashboard.length === 0) {
      setTotalData(0);
      setListData([]);
      return;
    } else {
      let filterData = dataDashboard.filter((item: PatientDashboardEntity) => {
        if (receptionDate) {
          const itemDate = dayjs(item.reception_time);
          return itemDate.isSame(receptionDate, "day");
        }
        return true;
      });
      if (areaSelected !== "all") {
        filterData = filterData.filter((item: PatientDashboardEntity) => {
          return item.area === areaSelected;
        });
      }
      setListData(filterData);
      setTotalData(filterData.length);
    }
  }, [dataDashboard, receptionDate, areaSelected]);

  const columns: ColumnsType<PatientDashboardEntity> = [
    {
      title: "THÔNG TIN BỆNH NHÂN",
      width: 200,
      dataIndex: "customer",
      align: "left",
      onCell: () => ({
        style: {
          verticalAlign: "top",
          textAlign: "left",
        },
      }),
      render(value: PatientEntity) {
        return (
          <div className="flex flex-col">
            <span className="font-bold">{`${value?.name?.toLocaleUpperCase()}`}</span>
            <Tooltip title={`Số điện thoại: ${value?.phone}`}>
              <span className="flex gap-2 text-[16px] cursor-pointer">
                <PhoneOutlined />
                {value?.phone}
              </span>
            </Tooltip>
            <Tooltip title={`Mã y tế: ${value?.medical_id}`}>
              <span className="flex gap-2 text-[16px] cursor-pointer">
                <IdcardOutlined />
                {value?.medical_id}
              </span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "TIẾP ĐÓN",
      width: 100,
      dataIndex: "reception_time",
      align: "left",
      onCell: () => ({
        style: {
          verticalAlign: "top",
          textAlign: "left",
        },
      }),
      render(value: any) {
        return <span>{dayjs(value).format("DD/MM/YYYY HH:mm")}</span>;
      },
    },
    {
      title: "PHÒNG KHÁM",
      width: 250,
      align: "left",
      onCell: () => ({
        style: {
          verticalAlign: "top",
          textAlign: "left",
        },
      }),
      render(record: PatientDashboardEntity) {
        return (
          <ScheduleTime
            data={[
              {
                action: record.department_name,
                startTime: record.exam_time,
                endTime: record.exam_end_time,
                status: record.exam_status,
              },
            ]}
          />
        );
      },
    },
    {
      title: "CẬN LÂM SÀNG",
      width: 400,
      dataIndex: "customer_paraclinical",
      onCell: () => ({
        style: {
          verticalAlign: "top",
          textAlign: "left",
        },
      }),
      render(value: CustomerParaclinicalEntity[]) {
        return (
          <>
            {value && value?.length ? (
              <ScheduleTime
                data={uniqBy(uniqBy(value, "id"), "service_name").map(
                  (item) => {
                    return {
                      action: item.service_name,
                      startTime: item.diagnostic_checkin_time,
                      endTime: item.result_time,
                      status: item.paraclinical_status,
                    };
                  }
                )}
                isClinicalExamination
              />
            ) : (
              <>Không có dữ liệu</>
            )}
          </>
        );
      },
    },
  ];

  const getTableScroll = () => {
    const height = tableRef.current?.offsetHeight ?? 0;
    const windowHeight = pageContainerRef.current?.offsetHeight ?? 0;
    const width = window.innerWidth;
    if (width < 640) {
      return height >= windowHeight - 295
        ? { y: windowHeight - 295, x: "max-content" }
        : undefined;
    }

    if (width < 1081) {
      return height >= windowHeight - 220
        ? { y: windowHeight - 220, x: "max-content" }
        : undefined;
    }

    if (width < 1280) {
      return height >= windowHeight - 255
        ? { y: windowHeight - 255, x: "max-content" }
        : undefined;
    }

    return height >= windowHeight - 221
      ? { y: windowHeight - 221, x: "max-content" }
      : undefined;
  };

  return (
    <PageContainer className="dashboard-library">
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
                toolbarRight={
                  <div className="flex gap-2.5 items-center">
                    <Select
                      defaultValue={areaSelected}
                      value={areaSelected}
                      onChange={(value) => {
                        setAreaSelected(value);
                      }}
                      options={[
                        { label: "Tất cả", value: "all" },
                        { label: "Khu vực sản", value: "KhuVucSan" },
                        { label: "Khu vực nhi", value: "KhuVucNhi" },
                      ]}
                      placeholder="Loại thời gian"
                      className="w-[120px]"
                    />
                    <DatePicker
                      className="w-[120px]"
                      format={"DD/MM/YYYY"}
                      value={receptionDate}
                      onChange={(date) => setReceptionDate(date)}
                    />
                  </div>
                }
              >
                <div
                  className={`flex flex-col gap-2.5 w-full h-[calc(100%-64px)]`}
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
                      title={() => (
                        <span className="font-semibold">
                          Danh sách bệnh nhân hiện tại
                        </span>
                      )}
                    />
                  </div>
                  <div
                    className={`flex items-center ${
                      totalData > 0
                        ? "justify-end sm:justify-between"
                        : "justify-end"
                    }`}
                  >
                    {totalData > 0 && (
                      <div className="hidden sm:flex items-center justify-between gap-[5px]">
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
                        bệnh nhân
                      </div>
                    )}
                    <Pagination
                      className="paginationCustom"
                      total={totalData}
                      current={pageIndex}
                      pageSize={pageSize}
                      showSizeChanger
                      pageSizeOptions={[50, 100]}
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
            </Col>
          </Row>
        </div>
      </Spin>
    </PageContainer>
  );
};

export default DashboardCustomer;
