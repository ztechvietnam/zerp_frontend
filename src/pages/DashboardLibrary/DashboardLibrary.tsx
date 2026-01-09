/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
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
  TableColumnsType,
  Tag,
  Tooltip,
  TreeSelect,
} from "antd";
import {
  FilterValues,
  TreeSelectNode,
} from "../06.DocumentsManagement/DocumentsManagement";
import FeaturedDocuments from "./FeaturedDocuments";
import {
  DocumentForm,
  DocumentFormRef,
} from "../06.DocumentsManagement/DocumentsForm";
import DocumentViewer, {
  DocumentViewerRef,
} from "../../components/document-viewer/DocumentViewer";
import { iconFilter } from "../../components/IconSvg/iconSvg";
import {
  EyeOutlined,
  RedoOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import { debounce, last } from "lodash";
import { DocumentEntity } from "../../common/services/document/document";
import { useForm } from "antd/es/form/Form";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import useApp from "antd/es/app/useApp";
import {
  buildCategoryTree,
  dataNews,
} from "../../components/constant/constant";
import { documentService } from "../../common/services/document/documentService";
import Highlighter from "react-highlight-words";
import axios from "axios";
import dayjs from "dayjs";
import "./dashboardLibrary.css";
import ActivityNews from "./ActivityNews";
import { NewsEntity } from "../../common/services/news/news";

const DashboardLibrary = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [listDocuments, setListDocuments] = useState<DocumentEntity[]>([]);
  const [featuredDocuments, setFeaturedDocuments] = useState<DocumentEntity[]>(
    []
  );
  const [activityNews, setActivityNews] = useState<NewsEntity[]>([]);
  const [treeData, setTreeData] = useState<TreeSelectNode[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [timeType, setTimeType] = useState<"year" | "date">("date");
  const documentViewerRef = useRef<DocumentViewerRef>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const documentFormRef = useRef<DocumentFormRef>(null);
  const [form] = useForm();
  const { listDocumentCategories, perDocument } = useSidebar();
  const { currentUser } = useAuth();
  const { message } = useApp();

  useEffect(() => {
    setLoading(true);
    const treeCate = buildCategoryTree(listDocumentCategories, true);
    setTreeData(treeCate);
    setLoading(false);
  }, [listDocumentCategories]);

  const getDocuments = useCallback(async () => {
    try {
      setLoading(true);
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
          idCateFilter = listDocumentCategories.map((cate) => cate.id_category);
        }
        if (idCateFilter?.length) {
          const results = await documentService.findAndFilter(
            idCateFilter,
            filterValues.keyword || "",
            filterValues.years || [],
            filterValues.startDate || null,
            filterValues.endDate || null
          );
          if (results) {
            let docList: DocumentEntity[] = [];
            if (currentUser?.role?.name === "admin") {
              docList = results;
            } else {
              docList = results.filter((doc: DocumentEntity) => {
                return (
                  doc?.created_id?.toString() === currentUser?.id?.toString() ||
                  perDocument.includes(doc?.id_document?.toString())
                );
              });
            }
            setListDocuments(docList);
            if (featuredDocuments.length === 0) {
              const featureData = docList
                .filter((doc: DocumentEntity) => doc?.is_featured === 1)
                .sort(
                  (a: DocumentEntity, b: DocumentEntity) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 3);
              setFeaturedDocuments(featureData);
            }
          } else {
            setListDocuments([]);
          }
        } else {
          setListDocuments([]);
        }
      } else {
        setListDocuments([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [
    currentUser?.id,
    featuredDocuments.length,
    filterValues,
    listDocumentCategories,
    perDocument,
  ]);

  const getActivityNews = () => {
    const activityNewsData = dataNews
      .sort(
        (a: NewsEntity, b: NewsEntity) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
    setActivityNews(activityNewsData);
  };

  const listData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return listDocuments.slice(start, start + pageSize);
  }, [listDocuments, pageIndex, pageSize]);

  useEffect(() => {
    (async () => {
      await getDocuments();
      getActivityNews();
    })();
  }, [getDocuments]);

  const highlightText = useCallback(
    (text: string) => {
      if (!filterValues.keyword) return text;
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
    },
    [filterValues.keyword]
  );

  const fetchFileAndShow = useCallback(
    async (url: string) => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await axios.get(url, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        });
        const mimeType =
          res.headers["content-type"] || "application/octet-stream";
        const pickName = url.split("/").pop() || "Tài lif";
        const ext = pickName.includes(".") ? "" : guessExtFromMime(mimeType);
        const fileName = decodeURIComponent(pickName + ext);
        const file = new File([res.data], fileName, { type: mimeType });
        documentViewerRef.current?.show([file], { titles: [fileName] });
      } catch (err) {
        console.error("❌ Lỗi khi tải file:", err);
        message.error("Không thể mở tệp, vui lòng thử lại sau");
      }
    },
    [message]
  );

  const guessExtFromMime = (mime: string) => {
    if (mime.includes("pdf")) return ".pdf";
    if (mime.includes("word")) return ".docx";
    if (mime.includes("excel")) return ".xlsx";
    if (mime.includes("powerpoint")) return ".pptx";
    return "";
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
                documentFormRef.current?.show(record, true);
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
        render(value) {
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
                      await fetchFileAndShow(atm.linkFile);
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
        ...(haveData ? { width: 60 } : {}),
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
                    await fetchFileAndShow(record.file);
                  }}
                >
                  <EyeOutlined />
                </Button>
              </Tooltip>
            </div>
          );
        },
      },
    ];
  };

  const onFilter = useCallback(
    (field: keyof FilterValues, value?: string | string[]) => {
      setFilterValues((prev) => {
        const next = { ...prev, [field]: value };
        return next;
      });
      setPageIndex(1);
    },
    []
  );

  const debouncedOnFilter = useMemo(
    () =>
      debounce(
        (field: keyof FilterValues, value: any) => onFilter(field, value),
        300
      ),
    [onFilter]
  );

  useEffect(() => {
    return () => debouncedOnFilter.cancel();
  }, [debouncedOnFilter]);

  const getTableScroll = () => {
    const height = tableRef.current?.offsetHeight ?? 0;
    const windowHeight = window.innerHeight ?? 0;
    const width = window.innerWidth;
    const base =
      width < 550
        ? 338
        : width < 768
        ? 308
        : width < 1280
        ? 626
        : width < 1620
        ? 586
        : 564;
    return height >= windowHeight - base
      ? { y: windowHeight - base, x: "max-content" }
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
    <PageContainer className="dashboard-library">
      <Spin spinning={loading}>
        <div className="shrink-0 min-h-[274px]">
          <Row gutter={24}>
            <Col xs={24} sm={24} md={12} lg={12}>
              <FeaturedDocuments
                data={featuredDocuments}
                fetchFileAndShow={fetchFileAndShow}
              />
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <ActivityNews data={activityNews} />
            </Col>
          </Row>
        </div>
        <div className="flex-1 mt-4.5">
          <Row className="h-full">
            <Col span={24}>
              <PageContainer
                ref={pageContainerRef}
                toolbarLeft={
                  <div>
                    <h1 className="text-[24px] mb-1 font-semibold text-[#006699] leading-7">
                      Tất cả văn bản
                    </h1>
                  </div>
                }
              >
                <div className="pb-2.5 filter-header">
                  <Form layout="horizontal" form={form}>
                    <div className="flex flex-col bg-[#f5f5f5] rounded-sm border border-[#d9d9d9] gap-2 px-2 py-1 sm:flex-row sm:flex-wrap sm:items-center">
                      <div
                        className={`flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-[calc(50%-4px)] xl:w-[calc((100%-32px-107px-46px)/3)] xl:max-w-[calc((100%-399px-32px)/2)] sm:flex-nowrap`}
                      >
                        <div className="flex items-center sm:w-auto">
                          {iconFilter}
                        </div>

                        <Form.Item
                          colon={false}
                          className="flex-1 m-0"
                          name="keyword"
                        >
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
                            showCheckedStrategy={"SHOW_PARENT"}
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
                          <Form.Item
                            colon={false}
                            className="m-0 w-full"
                            name={"years"}
                          >
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
                                    !!startDate &&
                                    date.isBefore(startDate, "day")
                                  );
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

                <div
                  className={`flex flex-col gap-2.5 w-full h-[calc(100%-90px)]`}
                >
                  <div ref={tableRef} className="flex h-[calc(100%-32px)]">
                    <Table
                      rowKey="id"
                      columns={columns(listData?.length > 0)}
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
                      onShowSizeChange={(size: number) => {
                        setPageSize(size);
                      }}
                      onChange={(currentPage) => {
                        setPageIndex(currentPage);
                      }}
                    />
                  </div>
                </div>
                <DocumentForm ref={documentFormRef} resetData={getDocuments} />
                <DocumentViewer ref={documentViewerRef} />
              </PageContainer>
            </Col>
          </Row>
        </div>
      </Spin>
    </PageContainer>
  );
};

export default DashboardLibrary;
