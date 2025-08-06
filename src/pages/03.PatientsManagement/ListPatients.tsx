/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  Breadcrumb,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Pagination,
  Row,
  Table,
  TableColumnsType,
  Tag,
} from "antd";
import { dataPatients } from "../../components/constant/constant";
import { PatientEntity } from "../../common/services/patient/patient";
import { PatientForm, PatientFormRef } from "./PatientForm";
import { FilterOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { useSidebar } from "../../context/SidebarContext";

const ListPatients = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [counterFilter, setCounterFilter] = useState<number>(0);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [listPatients, setListPatients] = useState<PatientEntity[]>([]);
  const [listData, setListData] = useState<PatientEntity[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const patientFormRef = useRef<PatientFormRef>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const { isMobileOpen } = useSidebar();
  const [form] = useForm();

  const columns: TableColumnsType<PatientEntity> = [
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
            {record.fullName}
          </span>
        );
      },
      showSorterTooltip: false,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    { title: "Di động", dataIndex: "mobile" },
    { title: "Địa chỉ", dataIndex: "address" },
    { title: "Khoa điều trị", dataIndex: "department" },
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

  const searchData = useCallback(async (formValues?: any) => {
    let dataFilter: PatientEntity[] = [];
    calculateCounterFilter(formValues);
    if (formValues && formValues["keyword"]) {
      dataFilter = dataPatients.filter((patient) => {
        return (
          patient.fullName
            .toLowerCase()
            .includes(formValues["keyword"]?.toLowerCase()) ||
          patient.address
            .toLowerCase()
            .includes(formValues["keyword"]?.toLowerCase()) ||
          patient.department
            .toLowerCase()
            .includes(formValues["keyword"]?.toLowerCase())
        );
      });
    } else {
      dataFilter = dataPatients;
    }
    setListPatients(dataFilter);
  }, []);

  useEffect(() => {
    (async () => {
      searchData();
    })();
  }, [searchData]);

  useEffect(() => {
    const data = listPatients.slice(
      pageSize * (pageIndex - 1),
      pageSize * pageIndex
    );
    setListData(data);
  }, [pageSize, pageIndex, listPatients]);

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
        <div>
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
      <div className="flex flex-col gap-[10px] w-full h-[calc(100%-61.2px)]">
        <div ref={tableRef} className="flex h-full">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={listData}
            pagination={false}
            scroll={
              window.innerWidth < 768
                ? (tableRef.current?.offsetHeight ?? 0) >=
                  window.innerHeight - 265
                  ? { y: window.innerHeight - 265 }
                  : undefined
                : (tableRef.current?.offsetHeight ?? 0) >=
                  window.innerHeight - 255
                ? { y: window.innerHeight - 255 }
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
        <div className="flex items-center justify-between lg:mt-[10px]">
          <div className="flex items-center justify-between gap-[5px]">
            <span className="hidden lg:flex">Đang hiển thị</span>
            <span className="text-[#108ee9] font-medium">
              {`${pageSize * (pageIndex - 1) + 1} - ${
                pageSize * pageIndex >= listPatients.length
                  ? listPatients.length
                  : pageSize * pageIndex
              } / ${listPatients.length}`}
            </span>
            bệnh nhân
          </div>
          <Pagination
            pageSize={pageSize}
            total={listPatients.length}
            current={pageIndex}
            onChange={(page) => {
              setPageIndex(page);
            }}
            align="end"
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
        width={window.innerWidth < 768 ? window.innerWidth*70/100 : 400}
        open={showFilter}
      >
        <Form layout="horizontal" form={form}>
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
                      await searchData(formValues);
                      setPageIndex(1);
                      setShowFilter(false);
                    } catch (e) {
                      await searchData();
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
                      await searchData(formValues);
                      setPageIndex(1);
                      setShowFilter(false);
                    } catch (e) {
                      await searchData();
                      setPageIndex(1);
                    }
                  }}
                >
                  Tìm kiếm
                </Button>
                <Button
                  onClick={async () => {
                    form.resetFields();
                    await searchData();
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
