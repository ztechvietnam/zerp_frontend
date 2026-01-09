/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  App,
  Breadcrumb,
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputRef,
  Pagination,
  Popover,
  Select,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
} from "antd";
import {
  RedoOutlined,
  SearchOutlined,
  SendOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { cloneDeep, debounce, set } from "lodash";
import Highlighter from "react-highlight-words";
import dayjs, { Dayjs } from "dayjs";
import "../../index.css";
import { ZaloMessageEntity } from "../../common/services/customer-zalo-messages/zalo-mesage";
import { zaloMessageService } from "../../common/services/customer-zalo-messages/zalo-mesage-service";
import { PatientEntity } from "../../common/services/patient/patient";
import { iconFilter, iconSendMessage } from "../../components/IconSvg/iconSvg";
import { zaloZnsTemplateService } from "../../common/services/zalo-zns-templates/zalo-zns-templates-service";
import { ZaloZnsTemplateEntity } from "../../common/services/zalo-zns-templates/zalo-zns-templates";

export interface FilterValues {
  customer_name?: string;
  message_type?: string[];
  status?: number;
}

const ListZaloMessages = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const [startSendMessage, setStartSendMessage] = useState<Dayjs | undefined>(
    undefined
  );
  const [endSendMessage, setEndSendMessage] = useState<Dayjs | undefined>(
    undefined
  );
  const [listMessages, setListMessages] = useState<ZaloMessageEntity[]>([]);
  const [messageTypeList, setMessageTypeList] = useState<
    ZaloZnsTemplateEntity[]
  >([]);
  const [dataFilter, setDataFilter] = useState<ZaloMessageEntity[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const { message } = App.useApp();
  const [form] = useForm();

  const getDataPatients = useCallback(
    async (formValues?: any) => {
      try {
        console.log(formValues);
        setLoading(true);
        const results = await zaloMessageService.get({
          params: {
            page: pageIndex,
            limit: pageSize,
          },
        });
        if (results) {
          setListMessages(results.data);
          setTotalData(results.total || 0);
        } else {
          setListMessages([]);
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
    let intervalId: number | null = null;

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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const results = await zaloZnsTemplateService.get({
          params: {
            page: 1,
            limit: 50,
          },
        });
        if (results) {
          setMessageTypeList(results.data);
        } else {
          setMessageTypeList([]);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    })();
  }, []);

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

  const filterData = useCallback(
    (startSendMessage?: Dayjs, endSendMessage?: Dayjs) => {
      let dataAfterFilter = listMessages;
      if (keyword) {
        dataAfterFilter = dataAfterFilter.filter((zaloMessage) => {
          return (
            zaloMessage.content &&
            removeVietnameseTones(zaloMessage.content)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase()))
          );
        });
      }
      if (startSendMessage || endSendMessage) {
        dataAfterFilter = dataAfterFilter.filter((zaloMessage) => {
          const sendTime = dayjs(zaloMessage.sent_time);
          return (
            !!zaloMessage.sent_time &&
            (startSendMessage
              ? sendTime.isAfter(startSendMessage) ||
                sendTime.isSame(startSendMessage)
              : true) &&
            (endSendMessage
              ? sendTime.isBefore(endSendMessage) ||
                sendTime.isSame(endSendMessage)
              : true)
          );
        });
      }
      setDataFilter(dataAfterFilter);
    },
    [listMessages, keyword]
  );

  useEffect(() => {
    if (keyword || startSendMessage || endSendMessage) {
      let dataAfterFilter = listMessages;
      if (keyword) {
        dataAfterFilter = dataAfterFilter.filter((zaloMessage) => {
          return (
            zaloMessage.content &&
            removeVietnameseTones(zaloMessage.content)
              .toLocaleLowerCase()
              .includes(removeVietnameseTones(keyword.toLocaleLowerCase()))
          );
        });
      }
      if (startSendMessage || endSendMessage) {
        dataAfterFilter = dataAfterFilter.filter((zaloMessage) => {
          const sendTime = dayjs(zaloMessage.sent_time);
          return (
            !!zaloMessage.sent_time &&
            (startSendMessage
              ? sendTime.isAfter(startSendMessage) ||
                sendTime.isSame(startSendMessage)
              : true) &&
            (endSendMessage
              ? sendTime.isBefore(endSendMessage) ||
                sendTime.isSame(endSendMessage)
              : true)
          );
        });
      }
      setDataFilter(dataAfterFilter);
    } else {
      setDataFilter(listMessages);
    }
  }, [endSendMessage, keyword, listMessages, startSendMessage]);

  const renderPatient = (patient: PatientEntity) => {
    return (
      <Descriptions column={2} bordered size="middle">
        <Descriptions.Item label="Họ tên" span={2}>
          {patient?.name || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Mã Y Tế" span={2}>
          {patient?.medical_id || ""}
        </Descriptions.Item>
        <Descriptions.Item label="CCCD" span={2}>
          {patient?.personal_id || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại" span={2}>
          {patient?.phone || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Email" span={2}>
          {patient?.email || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {patient?.address || ""}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const columns: TableColumnsType<ZaloMessageEntity> = [
    {
      title: "Nội dung tin nhắn",
      dataIndex: "content",
      width: 400,
      render: (value) => {
        return (
          <div>
            {value.split(/\r\n/).map((line: string, index: number) => (
              <p key={index}>{highlightText(line)}</p>
            ))}
          </div>
        );
      },
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
      title: "Người nhận",
      dataIndex: "customer",
      width: 150,
      render(value) {
        return (
          <div className="cursor-pointer w-fit flex items-center px-[6px] py-[2px] border border-transparent hover:border-gray-300 hover:rounded transition-all duration-200">
            <Popover content={renderPatient(value)} placement="rightTop">
              {value?.name || ""}
            </Popover>
          </div>
        );
      },
    },
    {
      title: "Loại tin nhắn",
      width: 100,
      dataIndex: "zns_template",
      render(value) {
        return (
          <Tag color="processing">
            {value?.zns_template_name || value?.zns_template_code || ""}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      width: 80,
      dataIndex: "sent",
      render: (value, record) => {
        return (
          <>
            {value ? (
              <Tag color="success">Đã gửi</Tag>
            ) : (
              <div className="flex gap-2">
                <Tag color="error" className="flex! items-center">
                  Chưa gửi
                </Tag>
                <Tooltip title="Gửi tin nhắn">
                  <Button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const result =
                          await zaloMessageService.sendMessageByMessageId(
                            record.id.toString()
                          );
                        if (result?.success) {
                          const newMessage = await zaloMessageService.getById(
                            record.id.toString()
                          );
                          setDataFilter((prev) =>
                            prev.map((item) =>
                              item.id === newMessage.id ? newMessage : item
                            )
                          );
                          message.success("Gửi tin nhắn thành công");
                        } else {
                          message.error("Gửi tin nhắn không thành công");
                        }
                      } catch (e) {
                        console.log(e);
                        message.error(
                          "Có lỗi xảy ra trong quá trình gửi tin nhắn"
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {iconSendMessage}
                  </Button>
                </Tooltip>
              </div>
            )}
          </>
        );
      },
    },
    {
      title: "Thời điểm gửi",
      width: 150,
      dataIndex: "sent_time",
      filterDropdown: ({ close }) => (
        <div
          className="flex flex-col gap-2 p-2"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5">
            <DatePicker
              value={startSendMessage}
              format="DD/MM/YYYY"
              onChange={(e) => setStartSendMessage(e.startOf("day"))}
              placeholder="Từ ngày"
              disabledDate={(date) => {
                return !!endSendMessage && date.isAfter(endSendMessage, "day");
              }}
            />
            <SwapRightOutlined />
            <DatePicker
              value={endSendMessage}
              format="DD/MM/YYYY"
              onChange={(e) => setEndSendMessage(e.endOf("day"))}
              placeholder="Đến ngày"
              disabledDate={(date) => {
                return (
                  !!startSendMessage && date.isBefore(startSendMessage, "day")
                );
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="primary"
              onClick={() => {
                filterData(startSendMessage, endSendMessage);
                close();
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                setStartSendMessage(undefined);
                setEndSendMessage(undefined);
                filterData();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Làm mới
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              Đóng
            </Button>
          </div>
        </div>
      ),
      render: (value) => {
        return value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "";
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

  const hasValidFilterValues = (values: any) => {
    if (!values) return false;

    return Object.values(values).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return value !== undefined && value !== null;
    });
  };

  const getTableScroll = () => {
    const height = tableRef.current?.offsetHeight ?? 0;
    const windowHeight = window.innerHeight;
    const width = window.innerWidth;

    if (width < 539) {
      return height >= windowHeight - 380
        ? { y: windowHeight - 380, x: "max-content" }
        : undefined;
    }

    if (width <= 640) {
      return height >= windowHeight - 358
        ? { y: windowHeight - 358, x: "max-content" }
        : undefined;
    }

    if (width <= 1280) {
      return height >= windowHeight - 330
        ? { y: windowHeight - 330, x: "max-content" }
        : undefined;
    }

    return height >= windowHeight - 290
      ? { y: windowHeight - 290, x: "max-content" }
      : undefined;
  };

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-1 font-semibold text-[#006699] leading-[28px]">
            Quản lý lịch sử gửi tin nhắn ZNS
          </h1>
          <Breadcrumb
            items={[
              {
                href: "/dashboard/customer-support",
                title: <span>Trang chủ</span>,
              },
              {
                title: (
                  <Tag color="#108ee9">Quản lý lịch sử gửi tin nhắn ZNS</Tag>
                ),
              },
            ]}
          />
        </div>
      }
      toolbarRight={
        <div className="flex gap-2.5 items-center">
          <Button
            className="flex gap-[5px]! items-center justify-center cursor-pointer"
            type="primary"
            onClick={async () => {
              try {
                setLoading(true);
                const result = await zaloMessageService.sendAllMessages();
                if (result) {
                  await getDataPatients();
                  message.success("Đã gửi tất cả tin nhắn");
                } else {
                  message.error("Có lỗi xảy ra trong quá trình gửi tin nhắn");
                }
              } catch (e) {
                console.log(e);
                message.error("Có lỗi xảy ra trong quá trình gửi tin nhắn");
              } finally {
                setLoading(false);
              }
            }}
          >
            <SendOutlined />
            Gửi tất cả
          </Button>
        </div>
      }
    >
      <div className="pb-2.5 filter-header">
        <Form layout="horizontal" form={form}>
          <div className="flex flex-col bg-[#f5f5f5] rounded-sm border border-[#d9d9d9] gap-2 px-2 py-1 sm:flex-row sm:flex-wrap sm:items-center">
            <div
              className={`flex flex-row items-stretch sm:items-center gap-2 w-full xl:w-[calc((100%-160px-16px)/2)] sm:flex-nowrap`}
            >
              <div className="flex items-center sm:w-auto">{iconFilter}</div>

              <Form.Item
                colon={false}
                className="flex-1 m-0"
                name="customer_name"
              >
                <Input
                  className="w-full"
                  placeholder="Nhập tên người nhận để tìm kiếm..."
                  maxLength={255}
                  onChange={(e) =>
                    debouncedOnFilter("customer_name", e.target?.value)
                  }
                />
              </Form.Item>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-[calc(100%-168px)] xl:w-[calc((100%-160px-16px)/2)] sm:flex-nowrap">
              <Form.Item
                colon={false}
                className="flex-1 m-0"
                name="message_type"
              >
                <Select
                  mode="multiple"
                  allowClear
                  options={messageTypeList.map((type) => ({
                    label:
                      type.zns_template_name || type.zns_template_code || "",
                    value: type.zns_template_code,
                  }))}
                  placeholder="Loại tin nhắn"
                  className="selectFilter"
                  maxTagCount="responsive"
                  onChange={(value) => debouncedOnFilter("message_type", value)}
                />
              </Form.Item>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-2 w-full sm:w-40 xl:ml-0 sm:flex-nowrap">
              <Form.Item colon={false} className="m-0 w-full" name="status">
                <Select
                  allowClear
                  options={[
                    { label: "Chưa gửi", value: "0" },
                    { label: "Đã gửi", value: "1" },
                  ]}
                  placeholder="Trạng thái"
                  className="selectFilter"
                  onChange={(value) => debouncedOnFilter("status", value)}
                />
              </Form.Item>
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
      <div className="flex flex-col gap-2.5 w-full h-[calc(100%-60px)]">
        <div ref={tableRef} className="flex h-[calc(100%-32px)]">
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={dataFilter}
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
            totalData > 0 ? "justify-end sm:justify-between" : "justify-end"
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
              tin nhắn
            </div>
          )}
          <Pagination
            className="paginationCustom"
            total={totalData}
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
    </PageContainer>
  );
};

export default ListZaloMessages;
