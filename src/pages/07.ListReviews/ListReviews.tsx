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
import { dataReviews } from "../../components/constant/constant";
import { ReviewForm, ReviewFormRef } from "./ReviewForm";
import { FilterOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { QualityReview } from "./QualityReview";
import { ReviewEntity } from "../../common/services/review/review";
import dayjs from "dayjs";

const ListReviews = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [counterFilter, setCounterFilter] = useState<number>(0);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [listReviews, setListReviews] = useState<ReviewEntity[]>([]);
  const [listData, setListData] = useState<ReviewEntity[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const reviewFormRef = useRef<ReviewFormRef>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [openEvaluation, setOpenEvaluation] = useState<boolean>(false);
  const [form] = useForm();

  const columns: TableColumnsType<ReviewEntity> = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      width: 100,
      render: (value, record: ReviewEntity) => {
        return (
          <span
            className="cursor-pointer"
            onClick={() => {
              reviewFormRef.current?.show(record);
            }}
          >
            {record.name}
          </span>
        );
      },
      showSorterTooltip: false,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    { title: "Di động", width: 80, dataIndex: "phone" },
    { title: "Email", width: 100, dataIndex: "email" },
    {
      title: "Thời gian đánh giá",
      width: 100,
      showSorterTooltip: false,
      sorter: (a, b) => a.created.localeCompare(b.name),
      dataIndex: "created",
      render: (value) => <span>{dayjs(value).format("HH:mm DD/MM/YYYY")}</span>,
    },
    {
      title: "Góp ý",
      dataIndex: "review",
      width: 100,
      render: (value) => (
        <div className="line-clamp-2 whitespace-pre-line text-ellipsis overflow-hidden max-w-[300px]">
          {value}
        </div>
      ),
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

  const searchData = useCallback(async (formValues?: any) => {
    let dataFilter: ReviewEntity[] = [];
    calculateCounterFilter(formValues);
    if (formValues && formValues["keyword"]) {
      dataFilter = dataReviews.filter((patient) => {
        return (
          patient.name
            .toLowerCase()
            .includes(formValues["keyword"]?.toLowerCase()) ||
          patient.phone
            .toLowerCase()
            .includes(formValues["keyword"]?.toLowerCase()) ||
          (patient.email &&
            patient.email
              .toLowerCase()
              .includes(formValues["keyword"]?.toLowerCase()))
        );
      });
    } else {
      dataFilter = dataReviews;
    }
    setListReviews(dataFilter);
  }, []);

  useEffect(() => {
    (async () => {
      searchData();
    })();
  }, [searchData]);

  useEffect(() => {
    const data = listReviews.slice(
      pageSize * (pageIndex - 1),
      pageSize * pageIndex
    );
    setListData(data);
  }, [pageSize, pageIndex, listReviews]);

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-[28px]">
            Danh sách đánh giá
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/",
                title: <span>Trang chủ</span>,
              },
              {
                title: <Tag color="#108ee9">Danh sách đánh giá</Tag>,
              },
            ]}
          />
        </div>
      }
      toolbarRight={
        <div className="flex gap-[10px] items-center">
          <Button type="primary" onClick={() => setOpenEvaluation(true)}>
            Đánh giá dịch vụ
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
                pageSize * pageIndex >= listReviews.length
                  ? listReviews.length
                  : pageSize * pageIndex
              } / ${listReviews.length}`}
            </span>
            đánh giá
          </div>
          <Pagination
            pageSize={pageSize}
            total={listReviews.length}
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
        width={window.innerWidth < 768 ? (window.innerWidth * 70) / 100 : 400}
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
      <QualityReview
        open={openEvaluation}
        onClose={() => setOpenEvaluation(false)}
      />
      <ReviewForm ref={reviewFormRef} />
    </PageContainer>
  );
};

export default ListReviews;
