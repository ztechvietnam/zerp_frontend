/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  App,
  Breadcrumb,
  Button,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputRef,
  Pagination,
  Popover,
  Row,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
} from "antd";
import {
  FilterOutlined,
  SearchOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { debounce } from "lodash";
import Highlighter from "react-highlight-words";
import dayjs, { Dayjs } from "dayjs";
import "../../index.css";
import {
  ZaloMessageType,
  ZaloMessageEntity,
} from "../../common/services/customer-zalo-messages/zalo-mesage";
import { zaloMessageService } from "../../common/services/customer-zalo-messages/zalo-mesage-service";
import { PatientEntity } from "../../common/services/patient/patient";
import { iconSendMessage } from "../../components/IconSvg/iconSvg";

export const TypeZaloMessage: Record<ZaloMessageType, string> = {
  [ZaloMessageType.CamOn]: "Tin cảm ơn",
  [ZaloMessageType.HenTaiKham]: "Hẹn tái khám",
};

const ListZaloMessages = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [counterFilter, setCounterFilter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const [startSendMessage, setStartSendMessage] = useState<Dayjs | undefined>(
    undefined
  );
  const [endSendMessage, setEndSendMessage] = useState<Dayjs | undefined>(
    undefined
  );
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [listMessages, setListMessages] = useState<ZaloMessageEntity[]>([]);
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
        <Descriptions.Item label="Mã Y Tế" span={2}>
          {patient.customer_id}
        </Descriptions.Item>
        <Descriptions.Item label="Họ tên" span={2}>
          {patient.name}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại" span={2}>
          {patient.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {patient.address}
        </Descriptions.Item>
        <Descriptions.Item label="Email" span={2}>
          {patient.email}
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
      width: 100,
      render(value) {
        return (
          <div className="cursor-pointer w-fit flex items-center px-[6px] py-[2px] border border-transparent hover:border-gray-300 hover:rounded transition-all duration-200">
            <Popover content={renderPatient(value)} placement="rightTop">
              {value.name}
            </Popover>
          </div>
        );
      },
    },
    {
      title: "Loại tin nhắn",
      width: 100,
      dataIndex: "message_type",
      render(value) {
        return (
          <Tag color="processing">
            {TypeZaloMessage[value as ZaloMessageType]}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      width: 80,
      dataIndex: "sent",
      render: (value) => {
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
                      message.success("Gửi tin nhắn thành công");
                      await getDataPatients();
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
      width: 100,
      dataIndex: "sent_time",
      filterDropdown: ({ clearFilters, close }) => (
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

  const getTableScroll = () => {
    const height = tableRef.current?.offsetHeight ?? 0;
    const windowHeight = window.innerHeight;
    const width = window.innerWidth;

    if (width < 428) {
      return height >= windowHeight - 316
        ? { y: windowHeight - 316, x: "max-content" }
        : undefined;
    }

    if (width < 538) {
      return height >= windowHeight - 288
        ? { y: windowHeight - 288, x: "max-content" }
        : undefined;
    }

    if (width < 1200) {
      return height >= windowHeight - 274
        ? { y: windowHeight - 274, x: "max-content" }
        : undefined;
    }

    return height >= windowHeight - 234
      ? { y: windowHeight - 234, x: "max-content" }
      : undefined;
  };

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarLeft={
        <div>
          <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-[28px]">
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
        <div className="flex items-center gap-4">
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
    </PageContainer>
  );
};

export default ListZaloMessages;
