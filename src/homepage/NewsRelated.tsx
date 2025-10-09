import React from "react";
import { NewsEntity } from "../common/services/news/news";
import { Link } from "react-router-dom";
import { SIDE_BAR } from "../components/constant/constant";

interface NewsRelatedProps {
  news: NewsEntity;
}

export const NewsRelated: React.FC<NewsRelatedProps> = ({ news }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-2 w-full lg:pt-2 lg:border-t lg:border-gray-200">
      <div className="aspect-[5/3] flex-shrink-0 w-full h-auto order-1 lg:w-[100px] lg:h-[60px] lg:order-2">
        <img
          src={news.image}
          alt={news.title}
          loading="lazy"
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      <div className="flex flex-col gap-[4px] mt-2 sm:mt-0 w-full order-2 lg:order-1">
        <Link
          className="text-[14px] leading-[140%] font-semibold !text-gray-800 hover:!text-[#1677ff] cursor-pointer line-clamp-2"
          to={`${SIDE_BAR.NEW_DETAIL}/${news.id}`}
        >
          {news.title}
        </Link>
      </div>
    </div>
  );
};
