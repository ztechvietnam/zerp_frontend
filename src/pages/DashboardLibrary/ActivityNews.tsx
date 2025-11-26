/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button, Descriptions, List, Popover, Tag, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { dataCategoryNews } from "../../components/constant/constant";
import { NewsEntity } from "../../common/services/news/news";

interface Props {
  data: NewsEntity[];
}

const ActivityNews: React.FC<Props> = ({ data }) => {
  const renderContent = (item: NewsEntity) => {
    return (
      <Descriptions column={2} bordered size="middle">
        <Descriptions.Item label="Ảnh bìa" span={2}>
          <img
            src={item.image}
            alt="Ảnh bìa"
            style={{ width: "100%", height: "auto", maxWidth: 300 }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Tiêu đề" span={2}>
          {item.title}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>
          {item.description}
        </Descriptions.Item>
        <Descriptions.Item label="Danh mục" span={2}>
          {item.category &&
            dataCategoryNews.find(
              (cate) => cate.id.toString() === item.category
            ) && (
              <Tag
                className="w-fit whitespace-break-spaces!"
                color="processing"
              >
                {dataCategoryNews.find(
                  (cate) => cate.id.toString() === item.category
                )?.name || ""}
              </Tag>
            )}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div>
        <h1 className="text-[24px] mb-0 font-semibold text-[#006699] leading-7">
          Tin tức hoạt động mới
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
                  <img
                    src={item.image}
                    alt="Ảnh bìa"
                    style={{ width: 85, height: 48 }}
                  />
                </div>
                <div className="flex flex-col justify-between w-[calc(100%-64px)]">
                  <div className="text-[#000000e0] text-[16px] font-bold truncate">
                    <Tooltip title={item.title}>{item.title}</Tooltip>
                  </div>
                  <div className="text-[#00000073] text-[14px] truncate">
                    <Tooltip
                      title={`Danh mục: ${
                        dataCategoryNews.find(
                          (cate) => cate.id.toString() === item.category
                        )?.name || ""
                      }`}
                    >
                      {item.category &&
                        dataCategoryNews.find(
                          (cate) => cate.id.toString() === item.category
                        ) && (
                          <Tag
                            className="w-fit whitespace-break-spaces!"
                            color="processing"
                          >
                            {dataCategoryNews.find(
                              (cate) => cate.id.toString() === item.category
                            )?.name || ""}
                          </Tag>
                        )}
                    </Tooltip>
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

export default ActivityNews;
