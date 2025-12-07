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
  Pagination,
  Row,
  Select,
  Table,
  TableColumnsType,
  Tag,
} from "antd";
import { dataCategoryNews, dataNews } from "../../components/constant/constant";
import { FilterOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import dayjs from "dayjs";
import {
  NewsForm,
  NewsFormRef,
} from "./NewsForm";
import { NewsEntity } from "../../common/services/news/news";

const NewsManagement = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [counterFilter, setCounterFilter] = useState<number>(0);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [listNews, setListNews] = useState<NewsEntity[]>([]);
  const [listData, setListData] = useState<NewsEntity[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const newsFormRef = useRef<NewsFormRef>(null);
  const [form] = useForm();
  const { message } = App.useApp();

  const columns: TableColumnsType<NewsEntity> = [
    { title: "Tiêu đề", dataIndex: "title", width: 200, fixed: "left" },
    {
      title: "Ảnh bìa",
      dataIndex: "image",
      width: 120,
      render: (value) => {
        return (
          <img src={value} alt="Ảnh bìa" style={{ width: 120, height: 72 }} />
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      width: 120,
      render: (value) => {
        const category = dataCategoryNews.find(
          (cate) => cate.id.toString() === value
        );
        return <span>{category ? category.name : ""}</span>;
      },
    },
    { title: "Người tạo", dataIndex: "createdBy", width: 100 },
    {
      title: "Ngày tạo",
      dataIndex: "created",
      width: 100,
      render(value) {
        return <span>{dayjs(value).format("DD/MM/YYYY")}</span>;
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

  const searchData = useCallback(async (formValues?: any) => {
    let dataFilter: NewsEntity[] = dataNews;
    calculateCounterFilter(formValues);
    if (formValues) {
      if (formValues["keyword"]) {
        dataFilter = dataFilter.filter((document) => {
          return (
            document.title
              .toLowerCase()
              .includes(formValues["keyword"]?.toLowerCase()) ||
            document.description
              .toLowerCase()
              .includes(formValues["keyword"]?.toLowerCase())
          );
        });
      }
      if (formValues["category"] && formValues["category"]?.length) {
        const idCateFilter = formValues["category"].map((cate: number) =>
          cate.toString()
        );
        dataFilter = dataFilter.filter((doc) => {
          return doc.category && idCateFilter.includes(doc.category);
        });
      }
    }
    setListNews(dataFilter);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await searchData();
      setLoading(false);
    })();
  }, [searchData]);

  useEffect(() => {
    const data = listNews.slice(
      pageSize * (pageIndex - 1),
      pageSize * pageIndex
    );
    setListData(data);
  }, [pageSize, pageIndex, listNews]);

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-[28px]">
            Tin hoạt động
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/",
                title: <span>Trang chủ</span>,
              },
              {
                title: <Tag color="#108ee9">Tin hoạt động</Tag>,
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
              newsFormRef.current?.show();
            }}
          >
            Thêm tin tức
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              type="dashed"
              size="middle"
              onClick={() => {
                setSelectedRowKeys([]);
                message.success("Xoá thành công");
              }}
            >
              Xoá
            </Button>
          )}
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
      <div className={`flex flex-col gap-[10px] w-full h-[calc(100%-61.2px)]`}>
        <div ref={tableRef} className="flex h-full">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={listData}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: (e) => {
                setSelectedRowKeys(e);
              },
            }}
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
        <div className={`flex items-center justify-end lg:mt-[10px]`}>
          <Pagination
            pageSize={pageSize}
            total={listNews.length}
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
        <Form layout="horizontal" form={form} style={{ padding: 12 }}>
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Từ khoá"
                name="keyword"
                className="!mb-[10px]"
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
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Danh mục"
                name="category"
                className="!mb-[10px]"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn danh mục"
                  allowClear
                  style={{ width: "100%" }}
                  options={dataCategoryNews.map((item) => {
                    return { label: item.name, value: item.id };
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12} className="!mt-[10px]">
            <Col span={24}>
              <div className="flex gap-[10px] justify-end">
                <Button
                  type="primary"
                  onClick={async () => {
                    try {
                      const formValues = form.getFieldsValue();
                      setPageIndex(1);
                      await searchData(formValues);
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
      <NewsForm ref={newsFormRef} />
    </PageContainer>
  );
};

export default NewsManagement;
