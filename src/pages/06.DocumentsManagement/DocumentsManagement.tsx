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
  Form,
  Input,
  Pagination,
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
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
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

interface FilterValues {
  keyword?: string;
  categoryIds?: string[];
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
      if (idCategory) {
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
          filterValues && filterValues.keyword ? filterValues.keyword : ""
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
            filterValues.keyword || ""
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
            onClick={() => {
              if (
                currentUser?.role.name === "admin" ||
                record?.created_id?.toString() === currentUser?.id?.toString()
              ) {
                documentFormRef.current?.show(record);
              } else {
                message.error("Bạn không có quyền chỉnh sửa văn bản này");
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
      width: 80,
    },
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
            <Tooltip title="Xem văn bản">
              <Button
                className="!px-[10px]"
                color="primary"
                variant="outlined"
                onClick={async () => {
                  const token = localStorage.getItem("access_token");

                  if (!record?.file) {
                    message.warning("Không tìm thấy đường dẫn file");
                    return;
                  }

                  try {
                    const response = await axios.get(record.file, {
                      responseType: "blob",
                      headers: { Authorization: `Bearer ${token}` },
                    });

                    const mimeType =
                      response.headers["content-type"] ||
                      "application/octet-stream";

                    const urlParts = record.file.split("/");
                    const lastPart =
                      urlParts[urlParts.length - 1] || "Tài liệu";

                    const splitParts = lastPart.split("-");
                    const guessedName =
                      splitParts.length > 2
                        ? splitParts.slice(2).join("-")
                        : lastPart;

                    const ext = guessedName.includes(".")
                      ? ""
                      : mimeType.includes("pdf")
                      ? ".pdf"
                      : mimeType.includes("word")
                      ? ".docx"
                      : mimeType.includes("excel")
                      ? ".xlsx"
                      : "";

                    const fileName = decodeURIComponent(guessedName + ext);

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
                currentUser?.id?.toString()) && (
              <Tooltip title="Xoá văn bản">
                <Button
                  className="!px-[10px]"
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
        </div>
      }
    >
      <div className="pb-[10px] filter-header">
        <Form layout="horizontal" form={form}>
          <div className="flex flex-row items-center bg-[#f5f5f5] rounded-sm border border-[#d9d9d9] gap-[5px] px-2 py-1 pl-3">
            <div className="flex items-center">{iconFilter}</div>
            <Form.Item
              colon={false}
              className={!idCategory ? "w-[50%]" : "w-[100%]"}
              name="keyword"
            >
              <Input
                className="w-full placeholder:text-[#8c8c8c] placeholder:text-[12px] placeholder:font-normal placeholder:leading-[18px] placeholder:tracking-[-0.02em]"
                placeholder="Nhập từ khoá để tìm kiếm..."
                maxLength={255}
                onChange={(e) => debouncedOnFilter("keyword", e.target?.value)}
              />
            </Form.Item>
            {!idCategory && (
              <Form.Item colon={false} className="w-[50%]" name="categoryIds">
                <TreeSelect
                  treeData={treeData}
                  treeCheckable
                  allowClear
                  showCheckedStrategy={SHOW_PARENT}
                  placeholder="Chọn danh mục"
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  showSearch
                  filterTreeNode={(inputValue: string, treeNode: any) => {
                    const title =
                      typeof treeNode.title === "string" ? treeNode.title : "";
                    return title
                      .toLocaleLowerCase()
                      .includes(inputValue?.trim().toLocaleLowerCase());
                  }}
                  onChange={(e) => debouncedOnFilter("categoryIds", e)}
                />
              </Form.Item>
            )}

            <Button
              type="primary"
              onClick={async () => {
                form.resetFields();
                setFilterValues({});
                setPageIndex(1);
              }}
              className="ml-2 px-3 py-1 text-sm bg-white border border-[#d9d9d9] rounded hover:bg-[#fafafa] transition"
            >
              Reset
            </Button>
          </div>
        </Form>
      </div>
      <div className={`flex flex-col gap-[10px] w-full h-[calc(100%-117.2px)]`}>
        <div ref={tableRef} className="flex h-full">
          <Table
            rowKey="id"
            columns={columns}
            loading={loading}
            dataSource={listData}
            pagination={false}
            scroll={
              window.innerWidth < 1025
                ? window.innerWidth < 544
                  ? (tableRef.current?.offsetHeight ?? 0) >=
                    window.innerHeight - 296
                    ? { y: window.innerHeight - 296 }
                    : undefined
                  : (tableRef.current?.offsetHeight ?? 0) >=
                    window.innerHeight - 273
                  ? { y: window.innerHeight - 273 }
                  : undefined
                : (tableRef.current?.offsetHeight ?? 0) >=
                  window.innerHeight - 285
                ? { y: window.innerHeight - 285 }
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
      <DocumentForm ref={documentFormRef} resetData={getDocuments} />
      <ModalPlayVideo ref={modalPlayVideoRef} />
      <DocumentViewer ref={documentViewerRef} />
    </PageContainer>
  );
};

export default DocumentsManagement;
