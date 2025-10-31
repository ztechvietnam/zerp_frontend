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
  Select,
  Spin,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
  TreeSelect,
} from "antd";
import {
  buildCategoryTree,
  dataDepartments,
  dataDocuments,
  dataTemplates,
  dataUsers,
  document_attachment,
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
import { useParams } from "react-router-dom";
import { CategoryEntity } from "../../common/services/category/category";
import { DocumentForm, DocumentFormRef } from "./DocumentsForm";
import {
  DepartmentEntity,
  DepartmentTreeNode,
} from "../../common/services/department/department";
import { UserEntity } from "../../common/services/user/user";
import { documentService } from "../../common/services/document/documentService";
import { useSidebar } from "../../context/SidebarContext";
import { DocumentCategoriesEntity } from "../../common/services/document-categories/documentCategories";

export interface TreeSelectNode {
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
  const [treeData, setTreeData] = useState<TreeSelectNode[]>([]);
  const [currentCategory, setCurrentCategory] = useState<
    DocumentCategoriesEntity | undefined
  >(undefined);
  const modalPlayVideoRef = useRef<ModalPlayVideoRef>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const documentFormRef = useRef<DocumentFormRef>(null);
  const [form] = useForm();
  const { listDocumentCategories } = useSidebar();
  const { idCategory } = useParams();

  useEffect(() => {
    setLoading(true);
    const treeCate = buildCategoryTree(listDocumentCategories, true);
    setTreeData(treeCate);
    setLoading(false);
  }, [listDocumentCategories]);

  const getDocuments = useCallback(
    async (formValues?: any) => {
      try {
        if (idCategory) {
          calculateCounterFilter(formValues);
          const category = listDocumentCategories.find((cate) => {
            return cate.id_category.toString() === idCategory.toString();
          });
          const idCateFilter = category
            ? [category]
                .map((cate) => {
                  const children = listDocumentCategories.filter((data) => {
                    return data.parent_category_id === cate.id_category;
                  });
                  return [
                    cate.id_category,
                    ...children.map((child) => child.id_category),
                  ];
                })
                .flat()
            : [];
          setLoading(true);
          const results = await documentService.findAndFilter(
            idCateFilter,
            formValues && formValues["keyword"] ? formValues["keyword"] : ""
          );
          if (results) {
            setListDocuments(results);
          } else {
            setListDocuments([]);
          }
          setLoading(false);
          setCurrentCategory(category);
        } else {
          setLoading(true);
          setCurrentCategory(undefined);
          calculateCounterFilter(formValues);
          if (formValues) {
            let idCateFilter: number[] = [];
            if (formValues["category"] && formValues["category"]?.length) {
              const categoryFilter = listDocumentCategories.filter((data) => {
                return formValues["category"].includes(
                  data.id_category.toString()
                );
              });
              idCateFilter = categoryFilter
                .map((cate) => {
                  const children = listDocumentCategories.filter((data) => {
                    return data.parent_category_id === cate.id_category;
                  });
                  return [
                    cate.id_category,
                    ...children.map((child) => child.id_category),
                  ];
                })
                .flat();
            } else {
              idCateFilter = listDocumentCategories.map(
                (cate) => cate.id_category
              );
            }
            const results = await documentService.findAndFilter(
              idCateFilter,
              formValues["keyword"] || ""
            );
            if (results) {
              setListDocuments(results);
            } else {
              setListDocuments([]);
            }
          } else {
            const results = await documentService.get({
              params: {
                page: pageIndex,
                limit: pageSize,
              },
            });
            if (results) {
              setListDocuments(results.data);
            } else {
              setListDocuments([]);
            }
          }
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    },
    [idCategory, listDocumentCategories, pageIndex, pageSize]
  );

  useEffect(() => {
    form.resetFields();
  }, [idCategory]);

  useEffect(() => {
    (async () => {
      await getDocuments();
    })();
  }, [getDocuments]);

  const columns: TableColumnsType<DocumentEntity> = [
    {
      title: "Tên văn bản",
      dataIndex: "title",
      width: 200,
      fixed: "left",
      render(value, record) {
        return (
          <span
            className="cursor-pointer"
            onClick={() => documentFormRef.current?.show(record)}
          >
            {value}
          </span>
        );
      },
    },
    { title: "Mã kí hiệu", dataIndex: "code", width: 80 },
    {
      title: "Biểu mẫu",
      dataIndex: "document_attachment",
      width: 100,
      render(value: any) {
        return (
          <div className="flex flex-col gap-1">
            {value && value?.length ? (
              value.map((atm: any) => (
                <Tag
                  className="w-fit !whitespace-break-spaces cursor-pointer !m-0"
                  color="processing"
                >
                  {atm.title}
                </Tag>
              ))
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category_id",
      width: 120,
      render(value: any) {
        return (
          <>
            {value &&
              listDocumentCategories.find(
                (cate) => cate.id_category.toString() === value.toString()
              ) && (
                <Tag
                  className="w-fit !whitespace-break-spaces"
                  color="processing"
                >
                  {listDocumentCategories.find(
                    (cate) => cate.id_category.toString() === value.toString()
                  )?.name || ""}
                </Tag>
              )}
          </>
        );
      },
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      width: 100,
      render(value) {
        return (
          <span>{value ? `${value.lastName} ${value.firstName}` : ""}</span>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 80,
      render(value) {
        return <span>{dayjs(value).format("DD/MM/YYYY")}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 75,
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
      width: 80,
      render(record) {
        return (
          <div className="w-full grid grid-cols-2 gap-[5px] flex-row flex-nowrap">
            <Tooltip title="Tải xuống">
              <Button className="!px-[10px]" color="primary" variant="outlined">
                <DownloadOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="Xoá văn bản">
              <Button className="!px-[10px]" variant="outlined" color="red">
                <DeleteOutlined />
              </Button>
            </Tooltip>
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
        <div className="flex items-center gap-4">
          {!currentCategory && (
            <Button
              type="primary"
              size="middle"
              style={{ marginLeft: 16 }}
              onClick={() => {
                documentFormRef.current?.show();
              }}
            >
              Thêm văn bản
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
            loading={loading}
            dataSource={listDocuments}
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
        <div
          className={`flex items-center ${
            listDocuments.length > 0 ? "justify-between" : "justify-end"
          }`}
        >
          {listDocuments.length > 0 && (
            <div className="flex items-center justify-between gap-[5px]">
              <span className="hidden lg:flex">Đang hiển thị</span>
              <span className="text-[#108ee9] font-medium">
                {`${
                  pageSize * (pageIndex - 1) + 1 >= listDocuments.length
                    ? listDocuments.length
                    : pageSize * (pageIndex - 1) + 1
                } - ${
                  pageSize * pageIndex >= listDocuments.length
                    ? listDocuments.length
                    : pageSize * pageIndex
                } / ${listDocuments.length}`}
              </span>
              văn bản
            </div>
          )}
          <Pagination
            className="paginationCustom"
            total={listDocuments.length}
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
                className="!mb-[10px]"
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder={"Nhập từ khoá để tìm kiếm..."}
                  maxLength={255}
                  onPressEnter={async () => {
                    try {
                      const formValues = form.getFieldsValue();
                      await getDocuments(formValues);
                      setPageIndex(1);
                      setShowFilter(false);
                    } catch (e) {
                      await getDocuments();
                      setPageIndex(1);
                    }
                  }}
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
                    placeholder="Chọn danh mục"
                    style={{
                      width: "100%",
                    }}
                    showSearch
                    filterTreeNode={(inputValue: string, treeNode: any) => {
                      const title =
                        typeof treeNode.title === "string"
                          ? treeNode.title
                          : "";
                      return title
                        .toLocaleLowerCase()
                        .includes(inputValue?.trim().toLocaleLowerCase());
                    }}
                  />
                </Form.Item>
              </Col>
            )}
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
                      await getDocuments(formValues);
                      setShowFilter(false);
                    } catch (e) {
                      await getDocuments();
                      setPageIndex(1);
                    }
                  }}
                >
                  Tìm kiếm
                </Button>
                <Button
                  onClick={async () => {
                    form.resetFields();
                    await getDocuments();
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
      <DocumentForm
        ref={documentFormRef}
        resetData={() => console.log("reset")}
      />
      <ModalPlayVideo ref={modalPlayVideoRef} />
    </PageContainer>
  );
};

export default DocumentsManagement;
