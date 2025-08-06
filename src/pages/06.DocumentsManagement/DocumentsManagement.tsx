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
  Drawer,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Spin,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
  TreeSelect,
} from "antd";
import {
  dataDocuments,
  dataTemplates,
  documentCategories,
} from "../../components/constant/constant";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { DocumentEntity } from "../../common/services/document/document";
import dayjs from "dayjs";
import ModalPlayVideo, { ModalPlayVideoRef } from "./ModalPlayVideo";
import { useParams } from "react-router";
import { CategoryEntity } from "../../common/services/category/category";

interface TreeSelectNode {
  title: string;
  value: string;
  key: string;
  children?: TreeSelectNode[];
}

const { SHOW_PARENT } = TreeSelect;

const DocumentsManagement = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [counterFilter, setCounterFilter] = useState<number>(0);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [listDocuments, setListDocuments] = useState<DocumentEntity[]>([]);
  const [listData, setListData] = useState<DocumentEntity[]>([]);
  const [treeData, setTreeData] = useState<TreeSelectNode[]>([]);
  const [currentCategory, setCurrentCategory] = useState<
    CategoryEntity | undefined
  >(undefined);
  const modalPlayVideoRef = useRef<ModalPlayVideoRef>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [form] = useForm();
  const { idCategory } = useParams();

  const buildCategoryTree = (
    categories: CategoryEntity[]
  ): TreeSelectNode[] => {
    const categoryMap = new Map<string, TreeSelectNode>();
    categories.forEach((category) => {
      categoryMap.set(category.code, {
        title: category.name,
        value: category.id,
        key: category.id,
        children: [],
      });
    });

    const tree: TreeSelectNode[] = [];
    categories.forEach((category) => {
      const node = categoryMap.get(category.code)!;

      if (category.parentCode) {
        const parentNode = categoryMap.get(category.parentCode);
        if (parentNode) {
          parentNode.children!.push(node);
        } else {
          console.warn(
            `⚠️ Không tìm thấy parent với code: '${category.parentCode}' cho node '${category.code}'`
          );
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });
    const cleanEmptyChildren = (nodes: TreeSelectNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          cleanEmptyChildren(node.children);
        } else {
          delete node.children;
        }
      });
    };

    cleanEmptyChildren(tree);
    return tree;
  };

  useEffect(() => {
    if (idCategory) {
      const category = documentCategories.find((cate) => {
        return cate.id === idCategory;
      });
      setCurrentCategory(category);
    } else {
      setCurrentCategory(undefined);
    }
  }, [idCategory]);

  useEffect(() => {
    setTreeData(buildCategoryTree(documentCategories));
  }, [])

  const columns: TableColumnsType<DocumentEntity> = [
    { title: "Tên văn bản", dataIndex: "name", width: 200, fixed: "left" },
    { title: "Mã kí hiệu", dataIndex: "code", width: 80 },
    {
      title: "Biểu mẫu",
      dataIndex: "template",
      width: 80,
      render(value: any) {
        return (
          <Tag className="w-fit !whitespace-break-spaces" color="processing">
            {value}
          </Tag>
        );
      },
    },
    ...(currentCategory
      ? []
      : [
          {
            title: "Danh mục",
            dataIndex: "category",
            width: 120,
            render(value: any) {
              return (
                <Tag
                  className="w-fit !whitespace-break-spaces"
                  color="processing"
                >
                  {value.name}
                </Tag>
              );
            },
          },
        ]),
    { title: "Người tạo", dataIndex: "createdBy", width: 100 },
    {
      title: "Ngày tạo",
      dataIndex: "created",
      width: 100,
      render(value) {
        return <span>{dayjs(value).format("DD/MM/YYYY")}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 80,
      render(value) {
        return (
          <Tag color={value ? "success" : "error"}>
            {value ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Hoạt động",
      width: 150,
      render(record) {
        return (
          <div className="w-full grid grid-cols-2 gap-[5px] sm:flex sm:flex-row sm:flex-nowrap">
            <Button
              className="!px-[10px]"
              color="primary"
              variant="outlined"
              onClick={() => {
                modalPlayVideoRef.current?.show();
              }}
            >
              <Tooltip title="Xem chi tiết">
                <EyeOutlined />
              </Tooltip>
            </Button>
            <Button className="!px-[10px]" color="primary" variant="outlined">
              <Tooltip title="Tải xuống">
                <DownloadOutlined />
              </Tooltip>
            </Button>
            <Button
              className="!px-[10px]"
              variant="outlined"
              color={record.status ? "red" : "green"}
            >
              <Tooltip
                title={record.status ? "Dừng hoạt động" : "Bật hoạt động"}
              >
                {record.status ? (
                  <CloseCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )}
              </Tooltip>
            </Button>
            <Button className="!px-[10px]" variant="outlined" color="red">
              <Tooltip title="Xoá văn bản">
                <DeleteOutlined />
              </Tooltip>
            </Button>
          </div>
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

  const searchData = useCallback(
    async (formValues?: any) => {
      let dataFilter: DocumentEntity[] = idCategory
        ? dataDocuments.filter((doc) => {
            return doc.category && doc.category.id === idCategory;
          })
        : dataDocuments;
      calculateCounterFilter(formValues);
      if (formValues) {
        if (formValues["keyword"]) {
          dataFilter = dataFilter.filter((document) => {
            return (
              document.name
                .toLowerCase()
                .includes(formValues["keyword"]?.toLowerCase()) ||
              document.code
                .toLowerCase()
                .includes(formValues["keyword"]?.toLowerCase())
            );
          });
        }
        if (formValues["template"]) {
          dataFilter = dataFilter.filter((document) => {
            return formValues["template"]
              .map((t: string) => t.toLowerCase())
              .includes(document.template.toLowerCase());
          });
        }
        if (formValues["category"] && formValues["category"]?.length) {
          const categoryFilter = treeData.filter((data) => {
            return formValues["category"].includes(data.value);
          });
          const idCateFilter = categoryFilter
            .map((cate) => [
              cate.value,
              ...(cate.children && cate.children.length
                ? cate.children.map((child) => child.value)
                : []),
            ])
            .flat();
          dataFilter = dataFilter.filter((doc) => {
            return doc.category && idCateFilter.includes(doc.category.id);
          });
        }
        if (typeof formValues["status"] === "boolean") {
          dataFilter = dataFilter.filter((document) => {
            return document.status === formValues["status"];
          });
        }
      }
      setListDocuments(dataFilter);
    },
    [idCategory, treeData]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await searchData();
      setLoading(false);
    })();
  }, [searchData]);

  useEffect(() => {
    const data = listDocuments.slice(
      pageSize * (pageIndex - 1),
      pageSize * pageIndex
    );
    setListData(data);
  }, [pageSize, pageIndex, listDocuments]);

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-[28px]">
            {`${currentCategory ? currentCategory.name : "Quản lý văn bản"}`}
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/",
                title: <span>Trang chủ</span>,
              },
              {
                title: (
                  <Tag color="#108ee9">{`${
                    currentCategory ? currentCategory.name : "Quản lý văn bản"
                  }`}</Tag>
                ),
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
      <Spin spinning={loading}>
        <div
          className={`flex flex-col gap-[10px] w-full h-[calc(100%-61.2px)]`}
        >
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
          <div
            className={`flex items-center ${
              listDocuments.length > 0 ? "justify-between" : "justify-end"
            } lg:mt-[10px]`}
          >
            {listDocuments.length > 0 && (
              <div className="flex items-center justify-between gap-[5px]">
                <span className="hidden lg:flex">Đang hiển thị</span>
                <span className="text-[#108ee9] font-medium">
                  {`${pageSize * (pageIndex - 1) + 1} - ${
                    pageSize * pageIndex >= listDocuments.length
                      ? listDocuments.length
                      : pageSize * pageIndex
                  } / ${listDocuments.length}`}
                </span>
                văn bản
              </div>
            )}
            <Pagination
              pageSize={pageSize}
              total={listDocuments.length}
              current={pageIndex}
              onChange={(page) => {
                setPageIndex(page);
              }}
              align="end"
            />
          </div>
        </div>
      </Spin>

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
                label="Biểu mẫu"
                name="template"
                className="!mb-[10px]"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn biểu mẫu"
                  allowClear
                  style={{ width: "100%" }}
                  options={dataTemplates}
                />
              </Form.Item>
            </Col>
            {!currentCategory && (
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Danh mục"
                  name="category"
                  className="!mb-[10px]"
                >
                  <TreeSelect
                    treeData={treeData}
                    treeCheckable
                    allowClear
                    showCheckedStrategy={SHOW_PARENT}
                    placeholder="Please select"
                    style={{
                      width: "100%",
                    }}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                label="Trạng thái"
                name="status"
              >
                <Select
                  placeholder="Chọn trạng thái"
                  style={{ width: "100%" }}
                  allowClear
                  options={[
                    { label: "Active", value: true },
                    { label: "Inactive", value: false },
                  ]}
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
      {/* <PatientForm ref={patientFormRef} /> */}
      <ModalPlayVideo ref={modalPlayVideoRef} />
    </PageContainer>
  );
};

export default DocumentsManagement;
