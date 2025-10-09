import React from "react";
import { NewsEntity } from "../common/services/news/news";
import { Link } from "react-router-dom";
import { SIDE_BAR } from "../components/constant/constant";

interface NewsItemProps {
  news: NewsEntity;
}

export const NewsItem: React.FC<NewsItemProps> = ({ news }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 w-full">
      <div className="w-full aspect-[5/3] sm:w-[240px] sm:h-[144px] sm:aspect-auto flex-shrink-0 lg:w-[270px] lg:h-[162px]">
        <img
          src={news.image}
          alt={news.title}
          loading="lazy"
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      <div className="flex flex-col gap-[4px] mt-2 sm:mt-0">
        <Link
          className="text-[18px] leading-[140%] font-semibold !text-gray-800 hover:!text-[#1677ff] cursor-pointer line-clamp-2 lg:line-clamp-3"
          to={`${SIDE_BAR.NEW_DETAIL}/${news.id}`}
        >
          {news.title}
        </Link>
        {window.innerWidth >= 640 && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
            {news.description}
          </p>
        )}
      </div>
    </div>
  );
};
