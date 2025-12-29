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
  DatePicker,
  Form,
  Input,
  Pagination,
  Select,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
  TreeSelect,
} from "antd";
import {
  buildCategoryTree,
  MEASSAGE,
} from "../../components/constant/constant";
import {
  DeleteOutlined,
  EyeOutlined,
  RedoOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { DocumentEntity } from "../../common/services/document/document";
import dayjs from "dayjs";
import ModalPlayVideo, { ModalPlayVideoRef } from "./ModalPlayVideo";
import { useParams } from "react-router-dom";
import { DocumentForm, DocumentFormRef } from "./DocumentsForm";
import { documentService } from "../../common/services/document/documentService";
import { useSidebar } from "../../context/SidebarContext";
import { DocumentCategoriesEntity } from "../../common/services/document-categories/documentCategories";
import { iconFilter } from "../../components/IconSvg/iconSvg";
import { cloneDeep, debounce, last, set } from "lodash";
import Highlighter from "react-highlight-words";
import { useAuth } from "../../context/AuthContext";
import useApp from "antd/es/app/useApp";
import DocumentViewer, {
  DocumentViewerRef,
} from "../../components/document-viewer/DocumentViewer";
import axios from "axios";

export interface FilterValues {
  keyword?: string;
  categoryIds?: string[];
  years?: string[];
  startDate?: string | null;
  endDate?: string | null;
}

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
  const [loading, setLoading] = useState<boolean>(false);
  const [listDocuments, setListDocuments] = useState<DocumentEntity[]>([]);
  const [listData, setListData] = useState<DocumentEntity[]>([]);
  const [treeData, setTreeData] = useState<TreeSelectNode[]>([]);
  const [currentCategory, setCurrentCategory] = useState<
    DocumentCategoriesEntity | undefined
  >(undefined);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [timeType, setTimeType] = useState<"year" | "date">("date");
  const modalPlayVideoRef = useRef<ModalPlayVideoRef>(null);
  const documentViewerRef = useRef<DocumentViewerRef>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const documentFormRef = useRef<DocumentFormRef>(null);
  const [form] = useForm();
  const { listDocumentCategories, perDocument } = useSidebar();
  const { currentUser } = useAuth();
  const { idCategory } = useParams();
  const { message, modal } = useApp();

  useEffect(() => {
    setLoading(true);
    const treeCate = buildCategoryTree(listDocumentCategories, true);
    setTreeData(treeCate);
    setLoading(false);
  }, [listDocumentCategories]);

  const getDocuments = useCallback(async () => {
    try {
      if (idCategory && idCategory !== "all") {
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
          filterValues && filterValues.keyword ? filterValues.keyword : "",
          filterValues.years || [],
          filterValues.startDate || null,
          filterValues.endDate || null
        );
        if (results) {
          if (currentUser?.role?.name === "admin") {
            setListDocuments(results);
          } else {
            const docList = results.filter((doc: DocumentEntity) => {
              return (
                doc?.created_id?.toString() === currentUser?.id?.toString() ||
                perDocument.includes(doc?.id_document?.toString())
              );
            });
            setListDocuments(docList);
          }
        } else {
          setListDocuments([]);
        }
        setLoading(false);
        setCurrentCategory(category);
      } else {
        setLoading(true);
        setCurrentCategory(undefined);
        if (filterValues) {
          let idCateFilter: number[] = [];
          if (filterValues.categoryIds && filterValues.categoryIds?.length) {
            const categoryFilter = listDocumentCategories.filter((data) => {
              return filterValues.categoryIds?.includes(
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
            filterValues.keyword || "",
            filterValues.years || [],
            filterValues.startDate || null,
            filterValues.endDate || null
          );
          if (results) {
            if (currentUser?.role?.name === "admin" && idCategory !== "all") {
              setListDocuments(results);
            } else {
              const docList = results.filter((doc: DocumentEntity) => {
                return (
                  doc?.created_id?.toString() === currentUser?.id?.toString() ||
                  perDocument.includes(doc?.id_document?.toString())
                );
              });
              setListDocuments(docList);
            }
          } else {
            setListDocuments([]);
          }
        } else {
          setListDocuments([]);
        }
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }, [
    currentUser?.id,
    currentUser?.role?.name,
    filterValues,
    idCategory,
    listDocumentCategories,
    perDocument,
  ]);

  useEffect(() => {
    setPageIndex(1);
    setPageSize(10);
    setFilterValues({});
    setTimeType("date");
    form.resetFields();
  }, [idCategory]);

  useEffect(() => {
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    setListData(listDocuments.slice(start, end));
  }, [listDocuments, pageIndex, pageSize]);

  useEffect(() => {
    (async () => {
      await getDocuments();
    })();
  }, [getDocuments]);

  const highlightText = (text: string) => {
    if (filterValues.keyword) {
      return (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffff00", padding: 0 }}
          searchWords={[filterValues.keyword]}
          autoEscape
          textToHighlight={text || ""}
          findChunks={({ textToHighlight, searchWords }) => {
            const keyword =
              typeof searchWords[0] === "string"
                ? searchWords[0].toLowerCase()
                : "";
            if (!keyword) return [];

            const lowerText = textToHighlight.toLowerCase();
            const chunks: { start: number; end: number }[] = [];
            let startIndex = 0;

            while (true) {
              const index = lowerText.indexOf(keyword, startIndex);
              if (index === -1) break;
              chunks.push({ start: index, end: index + keyword.length });
              startIndex = index + keyword.length;
            }

            return chunks;
          }}
        />
      );
    } else {
      return text;
    }
  };

  const columns = (haveData: boolean): TableColumnsType<DocumentEntity> => {
    return [
      {
        title: "Tên văn bản",
        dataIndex: "title",
        ...(haveData ? { width: 200 } : {}),
        render(value, record) {
          return (
            <span
              className="cursor-pointer"
              onClick={() => {
                if (
                  (currentUser?.role.name === "admin" ||
                    record?.created_id?.toString() ===
                      currentUser?.id?.toString()) &&
                  !idCategory
                ) {
                  documentFormRef.current?.show(record);
                } else {
                  documentFormRef.current?.show(record, true);
                }
              }}
            >
              <Tooltip title={highlightText(record?.description)}>
                {highlightText(value.trim())}
              </Tooltip>
            </span>
          );
        },
      },
      {
        title: "Mã kí hiệu",
        dataIndex: "code",
        ...(haveData ? { width: 80 } : {}),
        render(value, record) {
          return <span>{highlightText(value.trim())}</span>;
        },
      },
      {
        title: "Biểu mẫu",
        dataIndex: "document_attachment",
        ...(haveData ? { width: 100 } : {}),
        render(value: any) {
          return (
            <div className="flex flex-col gap-1">
              {value && value?.length ? (
                value.map((atm: any, index: number) => (
                  <Tag
                    key={index}
                    className="w-fit whitespace-break-spaces! cursor-pointer m-0!"
                    color="processing"
                    onClick={async () => {
                      const token = localStorage.getItem("access_token");

                      try {
                        const response = await axios.get(atm.linkFile, {
                          responseType: "blob",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        const mimeType =
                          response.headers["content-type"] ||
                          "application/octet-stream";
                        const fileName =
                          atm.title ||
                          last(
                            (
                              (last(atm.linkFile.split("/")) as string) || ""
                            ).split("-")
                          ) ||
                          "Tài liệu";
                        const file = new File([response.data], fileName, {
                          type: mimeType,
                        });
                        documentViewerRef.current?.show([file], {
                          titles: [fileName],
                        });
                      } catch (err) {
                        console.error(err);
                        message.error("Có lỗi trong quá trình mở file");
                      }
                    }}
                  >
                    {atm.title ||
                      last(
                        ((last(atm.linkFile.split("/")) as string) || "")
                          .split(".")[0]
                          ?.split("-")
                      ) ||
                      ""}
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
        ...(haveData ? { width: 120 } : {}),
        render(value: any) {
          return (
            <>
              {value &&
                listDocumentCategories.find(
                  (cate) => cate.id_category.toString() === value.toString()
                ) && (
                  <Tag
                    className="w-fit whitespace-break-spaces!"
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
        ...(haveData ? { width: 100 } : {}),
        render(value) {
          return (
            <span>{value ? `${value.lastName} ${value.firstName}` : ""}</span>
          );
        },
      },
      {
        title: "Ngày phát hành",
        dataIndex: "publish_date",
        ...(haveData ? { width: 80 } : {}),
        render(value) {
          return <span>{value ? dayjs(value).format("DD/MM/YYYY") : ""}</span>;
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        ...(haveData ? { width: 75 } : {}),
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
        ...(haveData ? { width: 80 } : {}),
        render(record) {
          return (
            <div className="w-full grid grid-cols-2 gap-[5px] flex-row flex-nowrap">
              <Tooltip title="Xem văn bản">
                <Button
                  className="px-2.5!"
                  color="primary"
                  variant="outlined"
                  onClick={async () => {
                    const token = localStorage.getItem("access_token");

                    if (!record?.file) {
                      message.warning("Không tìm thấy đường dẫn file");
                      return;
                    }

                    try {
                      const response = await axios.get(record.file.replace("https://zerp.hih.vn", "http://172.16.124.100:2207"), {
                        responseType: "blob",
                        headers: { Authorization: `Bearer ${token}` },
                      });

                      const mimeType =
                        response.headers["content-type"] ||
                        "application/octet-stream";

                      const urlParts = record.file.split("/");
                      const lastPart =
                        urlParts[urlParts.length - 1] || "Tài liệu";

                      const ext = lastPart.includes(".")
                        ? ""
                        : mimeType.includes("pdf")
                        ? ".pdf"
                        : mimeType.includes("word")
                        ? ".docx"
                        : mimeType.includes("excel")
                        ? ".xlsx"
                        : mimeType.includes("powerpoint")
                        ? ".pptx"
                        : "";

                      const fileName = decodeURIComponent(lastPart + ext);

                      const file = new File([response.data], fileName, {
                        type: mimeType,
                      });

                      documentViewerRef.current?.show([file], {
                        titles: [fileName],
                      });
                    } catch (err) {
                      console.error("❌ Lỗi khi tải file:", err);
                      message.error("Không thể mở tệp, vui lòng thử lại sau");
                    }
                  }}
                >
                  <EyeOutlined />
                </Button>
              </Tooltip>
              {(currentUser?.role?.name === "admin" ||
                record?.created_id?.toString() ===
                  currentUser?.id?.toString()) &&
                !(currentCategory || idCategory === "all") && (
                  <Tooltip title="Xoá văn bản">
                    <Button
                      className="px-2.5!"
                      variant="outlined"
                      color="red"
                      onClick={async () => {
                        modal.confirm({
                          title: MEASSAGE.CONFIRM_DELETE,
                          okText: MEASSAGE.OK,
                          cancelText: MEASSAGE.NO,
                          onOk: async () => {
                            try {
                              try {
                                setLoading(true);
                                await documentService.deleteDocument(
                                  record.id_document
                                );
                                message.success("Xoá văn bản thành công");
                                await getDocuments();
                                setLoading(false);
                              } catch (e) {
                                message.error(
                                  "Có lỗi xảy ra trong quá trình xoá văn bản"
                                );
                                console.log(e);
                              }
                            } catch (error) {
                              console.log(error);
                              message.error(MEASSAGE.ERROR, 3);
                            }
                          },
                          onCancel() {},
                        });
                      }}
                    >
                      <DeleteOutlined />
                    </Button>
                  </Tooltip>
                )}
            </div>
          );
        },
      },
    ];
  };

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

    if (width < 540) {
      if (currentCategory) {
        return height >= windowHeight - 337
          ? { y: windowHeight - 337, x: "max-content" }
          : undefined;
      }
      return height >= windowHeight - 377
        ? { y: windowHeight - 377, x: "max-content" }
        : undefined;
    }

    if (width < 640) {
      if (currentCategory) {
        return height >= windowHeight - 315
          ? { y: windowHeight - 315, x: "max-content" }
          : undefined;
      }
      return height >= windowHeight - 355
        ? { y: windowHeight - 355, x: "max-content" }
        : undefined;
    }
    if (width < 1280) {
      return height >= windowHeight - 275
        ? { y: windowHeight - 275, x: "max-content" }
        : undefined;
    }
    if (width < 1488) {
      return height >= windowHeight - 238
        ? { y: windowHeight - 238, x: "max-content" }
        : undefined;
    }

    if (idCategory) {
      return height >= windowHeight - 213
        ? { y: windowHeight - 213, x: "max-content" }
        : undefined;
    }

    return height >= windowHeight - 236
      ? { y: windowHeight - 236, x: "max-content" }
      : undefined;
  };

  const hasValidFilterValues = (values: any) => {
    if (!values) return false;

    return Object.values(values).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return value !== undefined && value !== null;
    });
  };

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-1 font-semibold text-[#006699] leading-7">
            {`${
              currentCategory
                ? currentCategory.name
                : idCategory === "all"
                ? "Tất cả văn bản"
                : "Quản lý văn bản"
            }`}
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/dashboard/library",
                title: <span>Trang chủ</span>,
              },
              {
                title: (
                  <Tag color="#108ee9">{`${
                    currentCategory
                      ? currentCategory.name
                      : idCategory === "all"
                      ? "Tất cả văn bản"
                      : "Quản lý văn bản"
                  }`}</Tag>
                ),
              },
            ]}
          />
        </div>
      }
      toolbarRight={
        <div className="flex items-center gap-4">
          {!(currentCategory || idCategory === "all") && (
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
        </div>
      }
    >
      <div className="pb-2.5 filter-header">
        <Form layout="horizontal" form={form}>
          <div className="flex flex-col bg-[#f5f5f5] rounded-sm border border-[#d9d9d9] gap-2 px-2 py-1 sm:flex-row sm:flex-wrap sm:items-center">
            <div
              className={`flex flex-row items-stretch sm:items-center gap-2 w-full ${
                currentCategory
                  ? "xl:w-[calc((100%-20px-107px-46px)*2/3)] xl:max-w-[calc(100%-399px-24px)]"
                  : "sm:w-[calc(50%-4px)] xl:w-[calc((100%-32px-107px-46px)/3)] xl:max-w-[calc((100%-399px-32px)/2)]"
              } sm:flex-nowrap`}
            >
              <div className="flex items-center sm:w-auto">{iconFilter}</div>

              <Form.Item colon={false} className="flex-1 m-0" name="keyword">
                <Input
                  className="w-full"
                  placeholder="Nhập từ khoá để tìm kiếm..."
                  maxLength={255}
                  onChange={(e) =>
                    debouncedOnFilter("keyword", e.target?.value)
                  }
                />
              </Form.Item>
            </div>

            {!currentCategory && (
              <div className="flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-[calc(50%-4px)] xl:w-[calc((100%-32px-107px-46px)/3)] xl:max-w-[calc((100%-399px-32px)/2)] sm:flex-nowrap">
                <Form.Item
                  colon={false}
                  className="flex-1 m-0"
                  name="categoryIds"
                >
                  <TreeSelect
                    treeData={treeData}
                    treeCheckable
                    allowClear
                    showCheckedStrategy={SHOW_PARENT}
                    placeholder="Chọn danh mục"
                    style={{ width: "100%" }}
                    maxTagCount="responsive"
                    showSearch
                    filterTreeNode={(inputValue, treeNode) => {
                      const title =
                        typeof treeNode.title === "string"
                          ? treeNode.title
                          : "";
                      return title
                        .toLowerCase()
                        .includes(inputValue?.trim().toLowerCase());
                    }}
                    onChange={(value) =>
                      debouncedOnFilter("categoryIds", value)
                    }
                  />
                </Form.Item>
              </div>
            )}

            <div className="flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-[107px] sm:ml-[18px] xl:ml-0 sm:flex-nowrap">
              <Form.Item
                colon={false}
                className="m-0 w-full"
                name="timeType"
                initialValue="date"
              >
                <Select
                  value={timeType}
                  onChange={(value) => {
                    setTimeType(value);
                    form.setFieldsValue({
                      years: [],
                      startDate: null,
                      endDate: null,
                    });
                    filterValues.years = [];
                    filterValues.startDate = null;
                    filterValues.endDate = null;
                    setFilterValues({ ...filterValues });
                  }}
                  options={[
                    { label: "Theo năm", value: "year" },
                    { label: "Theo ngày", value: "date" },
                  ]}
                  placeholder="Loại thời gian"
                  className="selectFilter"
                />
              </Form.Item>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-[calc(100%-107px-8px-18px)] xl:w-[calc((100%-32px-107px-46px)/3+54px)] xl:min-w-[300px] sm:flex-nowrap">
              {timeType === "year" ? (
                <Form.Item colon={false} className="m-0 w-full" name={"years"}>
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Chọn năm"
                    maxTagCount="responsive"
                    options={Array.from({ length: 6 }, (_, i) => {
                      const currentYear = new Date().getFullYear();
                      const y = currentYear - i;
                      return {
                        label: String(y),
                        value: y,
                      };
                    })}
                    onChange={(v) => debouncedOnFilter("years", v)}
                    className="selectFilter"
                  />
                </Form.Item>
              ) : (
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
                        debouncedOnFilter("startDate", v.format("DD/MM/YYYY"))
                      }
                      placeholder="Từ ngày"
                      disabledDate={(date) => {
                        const endDate = form.getFieldValue("endDate");
                        return !!endDate && date.isAfter(endDate, "day");
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
                        debouncedOnFilter("endDate", v.format("DD/MM/YYYY"))
                      }
                      placeholder="Đến ngày"
                      disabledDate={(date) => {
                        const startDate = form.getFieldValue("startDate");
                        return !!startDate && date.isBefore(startDate, "day");
                      }}
                    />
                  </Form.Item>
                </div>
              )}

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

      <div className={`flex flex-col gap-2.5 w-full h-[calc(100%-112px)]`}>
        <div ref={tableRef} className="flex h-[calc(100%-32px)]">
          <Table
            rowKey="id"
            columns={columns(listData?.length > 0)}
            loading={loading}
            dataSource={listData}
            pagination={false}
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
            listDocuments.length > 0
              ? "justify-end sm:justify-between"
              : "justify-end"
          }`}
        >
          {listDocuments.length > 0 && (
            <div className="hidden sm:flex items-center justify-between gap-[5px]">
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
      <DocumentForm ref={documentFormRef} resetData={getDocuments} />
      <ModalPlayVideo ref={modalPlayVideoRef} />
      <DocumentViewer ref={documentViewerRef} />
    </PageContainer>
  );
};

export default DocumentsManagement;
