import React, { useEffect, useRef, useState } from "react";
import { List, Pagination } from "antd";
import { NewsItem } from "./NewsItem";
import { CategoryNewsEntity } from "../../common/services/category-news/categoryNews";
import { NewsEntity } from "../../common/services/news/news";
import { dataCategoryNews, dataNews } from "../../components/constant/constant";

interface ListNewsProps {
  category: string;
}

const ListNews: React.FC<ListNewsProps> = ({ category }) => {
  const [categorySelected, setCategorySelected] = useState<
    CategoryNewsEntity | undefined
  >(undefined);

  const listNewsRef = useRef<HTMLDivElement>(null);

  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [listNews, setListNews] = useState<NewsEntity[]>([]);
  const [listData, setListData] = useState<NewsEntity[]>([]);

  useEffect(() => {
    setCategorySelected(
      dataCategoryNews.find((item) => item.id.toString() === category) ||
        undefined
    );
    const data = dataNews.filter((item) => item.category === category);
    setListNews(data);
  }, [category]);

  useEffect(() => {
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    setListData(listNews.slice(start, end));
  }, [listNews, pageIndex, pageSize]);

  useEffect(() => {
    listNewsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pageIndex]);

  return (
    <div className="pr-4" ref={listNewsRef}>
      <h3 className="text-2xl font-bold mb-4 mt-4 md:mt-0">
        {categorySelected?.name}
      </h3>
      {listNews.length ? (
        <div className={`flex flex-col gap-2.5 w-full`}>
          <List
            itemLayout="horizontal"
            dataSource={listData}
            rootClassName="overflow-auto md:max-h-[calc(100vh-175px)] pr-2.5!"
            pagination={false}
            renderItem={(item, index) => (
              <List.Item key={index}>
                <NewsItem news={item} />
              </List.Item>
            )}
          />
          <div
            className={`flex items-center ${
              listNews.length > 0
                ? "justify-end sm:justify-between"
                : "justify-end"
            }`}
          >
            {listNews.length > 0 && (
              <div className="hidden sm:flex items-center justify-between gap-[5px]">
                <span className="hidden lg:flex">Đang hiển thị</span>
                <span className="text-[#108ee9] font-medium">
                  {`${
                    pageSize * (pageIndex - 1) + 1 >= listNews.length
                      ? listNews.length
                      : pageSize * (pageIndex - 1) + 1
                  } - ${
                    pageSize * pageIndex >= listNews.length
                      ? listNews.length
                      : pageSize * pageIndex
                  } / ${listNews.length}`}
                </span>
                tin tức
              </div>
            )}
            <Pagination
              className="paginationCustom"
              total={listNews.length}
              current={pageIndex}
              pageSize={pageSize}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50]}
              onShowSizeChange={(size: number) => {
                setPageSize(size);
              }}
              onChange={(currentPage) => {
                setPageIndex(currentPage);
              }}
            />
          </div>
        </div>
      ) : (
        <div>No news available</div>
      )}
    </div>
  );
};

export default ListNews;
