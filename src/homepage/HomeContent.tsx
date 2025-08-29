import { Content } from "antd/es/layout/layout";
import React, { useState } from "react";
import { dataCategoryNews } from "../components/constant/constant";
import { Menu } from "antd";
import ListNews from "./ListNews";

const HomeContent = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    dataCategoryNews[0].id.toString()
  );
  return (
    <Content className="py-6 bg-white overflow-y-auto">
      <div className="w-full max-w-[1200px] px-[15px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-24 gap-2">
          <div className="md:col-span-17 order-2 md:order-1">
            <ListNews category={selectedCategory} />
          </div>

          <div className="md:col-span-7 order-1 md:order-2">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
              <Menu
                mode="inline"
                style={{ width: "100%" }}
                className="!border-r-0"
                items={dataCategoryNews.map((category) => ({
                  key: category.id,
                  label: category.name,
                }))}
                defaultSelectedKeys={[selectedCategory]}
                onClick={(e) => {
                  setSelectedCategory(e.key);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Content>
  );
};

export default HomeContent;
