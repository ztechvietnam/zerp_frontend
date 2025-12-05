/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable no-empty-pattern */
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { App, Skeleton } from "antd";
import { StickyButton } from "./StickyButton";
import { Content } from "antd/es/layout/layout";
import { NewsRelated } from "./NewsRelated";
import { NewsEntity } from "../../common/services/news/news";
import { contentTemplate, dataNews } from "../../components/constant/constant";
import { CaretLeftOutlined } from "@ant-design/icons";

interface NewsItemProps {}

export const NewDetail2: React.FC<NewsItemProps> = ({}) => {
  const [currentNew, setCurrentNew] = useState<NewsEntity | undefined>(
    undefined
  );
  const [newsRelated, setNewsRelated] = useState<NewsEntity[]>([]);
  const [fontSize, setFontSize] = useState<number>(18);
  const [loading, setLoading] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { idNew } = useParams();
  const { message } = App.useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const basePath = pathname.split("/new-detail")[0];

  useEffect(() => {
    if (idNew) {
      setLoading(true);
      const currentNew = dataNews.find((item) => item.id === parseInt(idNew));
      if (currentNew) {
        setCurrentNew(currentNew);
        const relatedNews = dataNews.filter(
          (item) =>
            item.category === currentNew.category && item.id !== currentNew.id
        );
        setNewsRelated(relatedNews);
      } else {
        setCurrentNew(undefined);
        message.error("Bài viết không tồn tại");
      }

      const fontSizeData = localStorage.getItem("fontSize");
      if (fontSizeData) {
        const fontSizeValue = JSON.parse(fontSizeData);
        const element = document.querySelector(
          ".content-detail"
        ) as HTMLElement | null;
        if (element) {
          element.style.fontSize = `${fontSizeValue.value}px`;
        }
        setFontSize(fontSizeValue.value);
      } else {
        const fontSizeToSave = { value: fontSize };
        localStorage.setItem("fontSize", JSON.stringify(fontSizeToSave));
        const element = document.querySelector(
          ".content-detail"
        ) as HTMLElement | null;
        if (element) {
          element.style.fontSize = `${fontSizeToSave}px`;
        }
      }
      setLoading(false);
    }
  }, [idNew, message, contentRef]);

  const onIncreaseFontSize = async () => {
    const fontSizeToSave = { value: fontSize + 1 };
    localStorage.setItem("fontSize", JSON.stringify(fontSizeToSave));
    if (contentRef.current) {
      contentRef.current.style.fontSize = `${fontSize + 1}px`;
    }
    setFontSize(fontSize + 1);
  };
  const onDefaultFontSize = async () => {
    setFontSize(18);
    const fontSizeToSave = { value: 18 };
    localStorage.setItem("fontSize", JSON.stringify(fontSizeToSave));
    if (contentRef.current) {
      contentRef.current.style.fontSize = `18px`;
    }
  };
  const onDecreaseFontSize = async () => {
    const fontSizeToSave = { value: fontSize - 1 };
    localStorage.setItem("fontSize", JSON.stringify(fontSizeToSave));
    if (contentRef.current) {
      contentRef.current.style.fontSize = `${fontSize - 1}px`;
    }
    setFontSize(fontSize - 1);
  };

  const onPrint = () => {
    window.print();
  };

  const copyLink = async (): Promise<boolean> => {
    const url = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      const success = document.execCommand("copy");
      textArea.remove();
      if (success) {
        message.success("Copy đường dẫn thành công!");
      } else {
        message.error("Copy không thành công!");
      }
      return success;
    } catch (error) {
      console.error("Lỗi khi sao chép URL:", error);
      textArea.remove();
      return false;
    }
  };

  return (
    <Content className="w-full pl-[50px]">
      <Skeleton loading={loading}>
        <div className="grid grid-cols-1 lg:grid-cols-24 gap-2 h-full">
          <div className="lg:col-span-16 order-1 lg:pr-2.5 lg:p-0 md:p-10px">
            <div className="sticky block box-border w-8 mb-5 top-[50px] left-0 ml-[-66px] h-0">
              <StickyButton
                display={{
                  changeFontSize: true,
                  copyLink: true,
                  shareFacebook: false,
                  comment: false,
                  savePost: false,
                  printPost: true,
                }}
                onIncreaseFontSize={() => {
                  onIncreaseFontSize();
                }}
                onDefaultFontSize={() => {
                  onDefaultFontSize();
                }}
                onDecreaseFontSize={() => {
                  onDecreaseFontSize();
                }}
                copyLink={() => {
                  copyLink();
                }}
                onPrint={() => {
                  onPrint();
                }}
              />
            </div>
            <div
              className="cursor-pointer flex items-center mb-4 text-[#1677ff] font-medium"
              onClick={() => navigate(basePath)}
            >
              <CaretLeftOutlined />
              Quay lại trang danh sách
            </div>
            <>
              <h1 className="text-3xl font-bold mb-4">{currentNew?.title}</h1>
              {currentNew?.description ? (
                <div style={{ fontSize: fontSize }}>
                  {currentNew?.description}
                </div>
              ) : null}
              <div
                className="prose prose-lg text-gray-800 content-detail"
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: contentTemplate }}
              />
            </>
          </div>

          <div className="lg:col-span-8 order-2">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 lg:mb-2">
                Bài viết liên quan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2">
                {newsRelated.map((item, index) => (
                  <NewsRelated key={index} news={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Skeleton>
    </Content>
  );
};
