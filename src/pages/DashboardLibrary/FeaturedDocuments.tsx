/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Breadcrumb,
  Button,
  Descriptions,
  List,
  Popover,
  Tag,
  Tooltip,
} from "antd";
import { DocumentEntity } from "../../common/services/document/document";
import { getBorder, getIcon } from "../06.DocumentsManagement/DocumentsForm";
import { last } from "lodash";
import { useSidebar } from "../../context/SidebarContext";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface Props {
  data: DocumentEntity[];
  fetchFileAndShow: (url: string) => Promise<void>;
}

const FeaturedDocuments: React.FC<Props> = ({ data, fetchFileAndShow }) => {
  const { listDocumentCategories } = useSidebar();

  const renderContent = (item: DocumentEntity) => {
    return (
      <Descriptions column={2} bordered size="middle">
        <Descriptions.Item label="Tiêu đề" span={2}>
          {item.title}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>
          {item.description}
        </Descriptions.Item>
        <Descriptions.Item label="Mã hiệu văn bản" span={2}>
          {item.code}
        </Descriptions.Item>
        <Descriptions.Item label="Danh mục" span={2}>
          {item.category_id &&
            listDocumentCategories.find(
              (cate) =>
                cate.id_category.toString() === item.category_id.toString()
            ) && (
              <Tag
                className="w-fit whitespace-break-spaces!"
                color="processing"
              >
                {listDocumentCategories.find(
                  (cate) =>
                    cate.id_category.toString() === item.category_id.toString()
                )?.name || ""}
              </Tag>
            )}
        </Descriptions.Item>
        <Descriptions.Item label="Tài liệu" span={2}>
          <Tooltip title={last(item.file.split("/"))}>
            <div
              style={{
                border: `1px solid ${getBorder(last(item.file.split("/")))}`,
              }}
              className="flex flex-[0_1_auto] w-fit max-w-full px-2.5 py-1 items-center rounded-lg bg-white gap-2.5 cursor-pointer overflow-hidden"
              onClick={async (e) => {
                e.stopPropagation();
                await fetchFileAndShow(item.file);
              }}
            >
              <div className="flex w-6 h-[22px]">
                {getIcon(last(item.file.split("/")))}
              </div>
              <div className="text-[#000000e0] text-[14px] not-italic font-normal leading-normal overflow-hidden min-w-0">
                {last(item.file.split("/"))}
              </div>
            </div>
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày phát hành" span={2}>
          {dayjs(item.publish_date).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Biểu mẫu" span={2}>
          <div className="flex flex-col gap-1">
            {item.document_attachment && item.document_attachment?.length ? (
              item.document_attachment.map((atm: any, index: number) => (
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
        </Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div>
        <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-7">
          Văn bản quan trọng
        </h1>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item key={index} className="py-1.5!">
            <Popover
              placement="bottom"
              content={renderContent(item)}
              trigger={"click"}
            >
              <div className="flex gap-4 items-center bg-white w-full py-2.5 px-4 rounded-[5px] cursor-pointer">
                <div className="flex items-center">
                  {getIcon(last(item.file?.split("/")), 48)}
                </div>
                <div className="flex flex-col justify-between w-[calc(100%-112px)]">
                  <div className="text-[#000000e0] text-[16px] font-bold truncate">
                    <Tooltip title={item.title}>{item.title}</Tooltip>
                  </div>
                  <div className="text-[#00000073] text-[14px] truncate">
                    <Tooltip
                      title={`Danh mục: ${
                        listDocumentCategories.find(
                          (cate) =>
                            cate.id_category.toString() ===
                            item.category_id.toString()
                        )?.name || ""
                      }`}
                    >
                      {item.category_id &&
                        listDocumentCategories.find(
                          (cate) =>
                            cate.id_category.toString() ===
                            item.category_id.toString()
                        ) && (
                          <Tag
                            className="w-fit whitespace-break-spaces!"
                            color="processing"
                          >
                            {listDocumentCategories.find(
                              (cate) =>
                                cate.id_category.toString() ===
                                item.category_id.toString()
                            )?.name || ""}
                          </Tag>
                        )}
                    </Tooltip>
                  </div>
                </div>
                <div className="flex w-8 h-8">
                  <div className="hidden lg:block">
                    <Tooltip title="Xem văn bản">
                      <Button
                        className="px-[9px]!"
                        color="primary"
                        variant="outlined"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await fetchFileAndShow(item.file);
                        }}
                      >
                        <EyeOutlined />
                      </Button>
                    </Tooltip>
                  </div>
                  <div className="block lg:hidden">
                    <Button
                      className="px-[9px]!"
                      color="primary"
                      variant="outlined"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await fetchFileAndShow(item.file);
                      }}
                    >
                      <EyeOutlined />
                    </Button>
                  </div>
                </div>
              </div>
            </Popover>
          </List.Item>
        )}
      />
    </div>
  );
};

export default FeaturedDocuments;
