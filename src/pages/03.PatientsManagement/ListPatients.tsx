/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  App,
  Breadcrumb,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputRef,
  Pagination,
  Row,
  Table,
  TableColumnsType,
  Tag,
} from "antd";
import { PatientEntity } from "../../common/services/patient/patient";
import { PatientForm, PatientFormRef } from "./PatientForm";
import { FilterOutlined, SyncOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { customersService } from "../../common/services/patient/customersService";
import { debounce } from "lodash";
import Highlighter from "react-highlight-words";
import { patientService } from "../../common/services/patient/patientService";
import dayjs from "dayjs";
import "../../index.css";

const ListPatients = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [counterFilter, setCounterFilter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [listPatients, setListPatients] = useState<PatientEntity[]>([]);
  const [dataFilter, setDataFilter] = useState<PatientEntity[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const patientFormRef = useRef<PatientFormRef>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const { message } = App.useApp();
  const [form] = useForm();

  const getDataPatients = useCallback(
    async (formValues?: any) => {
      try {
        setLoading(true);
        const results = await customersService.get({
          params: {
            page: pageIndex,
            limit: pageSize,
          },
        });
        if (results) {
          setListPatients(results.data);
          setTotalData(results.total || 0);
        } else {
          setListPatients([]);
          setTotalData(0);
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
    let intervalId: NodeJS.Timeout | null = null;

    if (pageIndex === 1) {
      intervalId = setInterval(() => {
        getDataPatients();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pageIndex, getDataPatients]);

  useEffect(() => {
    (async () => await getDataPatients())();
  }, [getDataPatients]);

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
      const dataAfterFilter = listPatients.filter((patient) => {
        return (
          (patient.name &&
            removeVietnameseTones(patient.name)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase()))) ||
          (patient.phone &&
            removeVietnameseTones(patient.phone)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase()))) ||
          (patient.email &&
            removeVietnameseTones(patient.email)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase()))) ||
          (patient.address &&
            removeVietnameseTones(patient.address)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase())))
        );
      });
      setDataFilter(dataAfterFilter);
    } else {
      setDataFilter(listPatients);
    }
  }, [keyword, listPatients]);

  const columns: TableColumnsType<PatientEntity> = [
    {
      title: "Mã Y Tế",
      dataIndex: "customer_id",
      width: 120,
      render: (value: string) => highlightText(value),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      render: (value, record: PatientEntity) => {
        return (
          <span
            className="cursor-pointer"
            onClick={() => {
              patientFormRef.current?.show(record);
            }}
          >
            {highlightText(record.name)}
          </span>
        );
      },
      // showSorterTooltip: false,
      // sorter: (a, b) => a.name.localeCompare(b.name),
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
      title: "Di động",
      dataIndex: "phone",
      render: (value: string) => highlightText(value),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      render: (value: string) => highlightText(value),
    },
    {
      title: "Thời điểm đồng bộ",
      dataIndex: "createdAt",
      render: (value: string) => {
        return dayjs(value).format("HH:mm DD/MM/YYYY");
      },
    },
    {
      title: "Đã ủy quyền ZERP",
      dataIndex: "zalo_user_id",
      render: (value: string) => {
        return (
          <Tag color={value ? "success" : "error"}>
            {value ? "Đã ủy quyền" : "Chưa ủy quyền"}
          </Tag>
        );
      },
    },
  ];

  const calculateCounterFilter = (formValues?: any) => {
    if (formValues) {
      const filledCount = Object.values(formValues).filter((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "object" && value !== null)
          return Object.keys(value).length > 0;
        return value !== undefined && value !== null && value !== "";
      }).length;
      setCounterFilter(filledCount);
    } else {
      setCounterFilter(0);
    }
  };

  const syncData = async () => {
    try {
      setLoading(true);
      const result = await patientService.syncData();
      if (result.success) {
        message.success(result.message);
        await getDataPatients();
      } else {
        message.error(result.message);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
      message.error("Có lỗi xảy ra trong quá trình đồng bộ");
    }
  };

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-[28px]">
            Quản lý bệnh nhân
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/",
                title: <span>Trang chủ</span>,
              },
              {
                title: <Tag color="#108ee9">Quản lý bệnh nhân</Tag>,
              },
            ]}
          />
        </div>
      }
      toolbarRight={
        <div className="flex items-center gap-4">
          <Button
            type="primary"
            className="flex !gap-[5px] items-center justify-center cursor-pointer"
            onClick={async () => {
              await syncData();
            }}
          >
            <SyncOutlined />
            <span className="hidden lg:flex">Đồng bộ bệnh nhân</span>
          </Button>
          <Button
            className="flex !gap-[3px] items-center justify-center cursor-pointer"
            onClick={() => {
              setShowFilter(true);
            }}
          >
            <FilterOutlined />
            <span className="hidden lg:flex">Bộ lọc</span>
            <span
              className={`${counterFilter ? "flex" : "hidden"}`}
            >{`(${counterFilter})`}</span>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-[10px] w-full h-[calc(100%-60px)]">
        <div ref={tableRef} className="flex h-full">
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={dataFilter}
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
              bệnh nhân
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

      <Drawer
        title="Bộ lọc"
        placement="right"
        closable={false}
        onClose={() => {
          setShowFilter(false);
        }}
        width={window.innerWidth < 768 ? (window.innerWidth * 70) / 100 : 400}
        open={showFilter}
      >
        <Form layout="horizontal" form={form} style={{ padding: 12 }}>
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Từ khoá"
                name="keyword"
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder={"Nhập từ khoá để tìm kiếm..."}
                  maxLength={255}
                  onPressEnter={async () => {
                    try {
                      const formValues = form.getFieldsValue();
                      await getDataPatients(formValues);
                      setPageIndex(1);
                      setShowFilter(false);
                    } catch (e) {
                      await getDataPatients();
                      setPageIndex(1);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <div className="flex gap-[10px] justify-end">
                <Button
                  type="primary"
                  onClick={async () => {
                    try {
                      const formValues = form.getFieldsValue();
                      await getDataPatients(formValues);
                      setPageIndex(1);
                      setShowFilter(false);
                    } catch (e) {
                      await getDataPatients();
                      setPageIndex(1);
                    }
                  }}
                >
                  Tìm kiếm
                </Button>
                <Button
                  onClick={async () => {
                    form.resetFields();
                    await getDataPatients();
                    setPageIndex(1);
                    setShowFilter(false);
                  }}
                >
                  Đặt lại
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <PatientForm ref={patientFormRef} />
    </PageContainer>
  );
};

export default ListPatients;
