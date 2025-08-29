import React, { useEffect, useRef, useState } from "react";
import { CategoryNewsEntity } from "../common/services/category-news/categoryNews";
import { dataCategoryNews, dataNews } from "../components/constant/constant";
import { NewsEntity } from "../common/services/news/news";
import { List } from "antd";
import { NewsItem } from "./NewsItem";

interface ListNewsProps {
  category: string;
}

const ListNews: React.FC<ListNewsProps> = ({ category }) => {
  const [categorySelected, setCategorySelected] = useState<
    CategoryNewsEntity | undefined
  >(undefined);

  const listNewsRef = useRef<HTMLDivElement>(null);

  const [pageIndex, setPageIndex] = useState<number>(1);
  const [listNews, setListNews] = useState<NewsEntity[]>([]);

  useEffect(() => {
    setCategorySelected(
      dataCategoryNews.find((item) => item.id.toString() === category) ||
        undefined
    );
    const data = dataNews.filter((item) => item.category === category);
    setListNews(data);
  }, [category]);

  useEffect(() => {
    listNewsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pageIndex]);

  return (
    <div className="px-4" ref={listNewsRef}>
      <h3 className="text-2xl font-bold mb-4 mt-4 md:mt-0">{categorySelected?.name}</h3>
      {listNews.length ? (
        <List
          itemLayout="horizontal"
          dataSource={listNews}
          pagination={{
            pageSize: 5,
            onChange: (newPage) => {
              setPageIndex(newPage);
            },
          }}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <NewsItem news={item} />
            </List.Item>
          )}
        />
      ) : (
        <div>No news available</div>
      )}
    </div>
  );
};

export default ListNews;
