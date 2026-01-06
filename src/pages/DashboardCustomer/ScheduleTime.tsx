/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Popover } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";

interface Props {
  data: any[];
  isClinicalExamination?: boolean;
}

const ScheduleTime: React.FC<Props> = ({ data, isClinicalExamination }) => {
  const [lateList, setLateList] = useState<any[]>([]);
  const [isOnTime, setIsOnTime] = useState<boolean>(true);

  useEffect(() => {
    if (data && data.length > 0 && isClinicalExamination) {
      const checkOnTime = data.every((item) => item.status === "ĐÚNG");
      if (checkOnTime) {
        setLateList([]);
        setIsOnTime(true);
        return;
      } else {
        const dataLateList = data.filter((item) => {
          return item.status !== "ĐÚNG";
        });
        setLateList(dataLateList);
        setIsOnTime(false);
      }
    }
  }, [data, isClinicalExamination]);

  const contentClinicalExamination = useCallback(() => {
    return (
      <>
        <div className="font-bold mb-2">CHI TIẾT KHÁM CẬN LÂM SÀNG:</div>
        <div className="max-h-[90vh] overflow-auto">
          {data &&
            data.length > 0 &&
            data.map((item: any, index: number) => (
              <div className="flex flex-col gap-1" key={index}>
                {item.status === "ĐÚNG" ? (
                  <div className="bg-[#23ce64] w-[65%] h-1.5 rounded-xs"></div>
                ) : (
                  <div className="bg-[#f83a42] w-full h-1.5"></div>
                )}
                {item?.action ? (
                  <div className="flex items-start gap-1.5">
                    {item.status === "ĐÚNG" ? (
                      <div className="bg-[#23ce64] w-1.5 h-1.5 rounded-full mt-[9px]"></div>
                    ) : (
                      <div className="bg-[#f83a42] w-1.5 h-1.5 rounded-full mt-[9px]"></div>
                    )}
                    <div className="max-w-[calc(100%-12px)]">{`${
                      item.action
                    } | ${
                      item.startTime
                        ? dayjs(item.startTime).format("HH:mm")
                        : "......"
                    } - ${
                      item.endTime
                        ? dayjs(item.endTime).format("HH:mm")
                        : "......"
                    }`}</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {item.status === "ĐÚNG" ? (
                      <div className="bg-[#23ce64] w-1.5 h-1.5 rounded-full"></div>
                    ) : (
                      <div className="bg-[#f83a42] w-1.5 h-1.5 rounded-full"></div>
                    )}
                    <div>{`Vào: ${
                      item.startTime
                        ? dayjs(item.startTime).format("HH:mm")
                        : "......"
                    } - Ra: ${
                      item.endTime
                        ? dayjs(item.endTime).format("HH:mm")
                        : "......"
                    }`}</div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </>
    );
  }, [data]);

  const renderClinicalExamination = useCallback(() => {
    if (isOnTime) {
      return (
        <div className="flex flex-col gap-1">
          <div className="bg-[#23ce64] w-[65%] h-1.5 rounded-xs"></div>
          <div className="flex items-center gap-1.5">
            <div className="bg-[#23ce64] w-1.5 h-1.5 rounded-full"></div>
            <div>ĐÚNG GIỜ</div>
          </div>
          <Popover
            content={contentClinicalExamination()}
            trigger={"click"}
            placement="left"
            getPopupContainer={() => document.body}
            overlayStyle={{ maxHeight: "unset" }}
            className="w-fit"
          >
            <div className="w-fit cursor-pointer text-blue-600">{`Xem chi tiết >>`}</div>
          </Popover>
        </div>
      );
    } else {
      return (
        <>
          {lateList &&
            lateList.length > 0 &&
            lateList.map((item: any, index: number) => (
              <div className="flex flex-col gap-1" key={index}>
                <div className="bg-[#f83a42] w-full h-1.5"></div>
                <div className="flex items-start gap-1.5">
                  {item.status === "ĐÚNG" ? (
                    <div className="bg-[#23ce64] w-1.5 h-1.5 rounded-full mt-[9px]"></div>
                  ) : (
                    <div className="bg-[#f83a42] w-1.5 h-1.5 rounded-full mt-[9px]"></div>
                  )}
                  <div className="max-w-[calc(100%-12px)]">{`${item.action} | ${
                    item.startTime
                      ? dayjs(item.startTime).format("HH:mm")
                      : "......"
                  } - ${
                    item.endTime
                      ? dayjs(item.endTime).format("HH:mm")
                      : "......"
                  }`}</div>
                </div>
              </div>
            ))}
          {lateList.length !== data.length && (
            <Popover
              content={contentClinicalExamination()}
              trigger={"click"}
              placement="left"
              getPopupContainer={() => document.body}
              overlayStyle={{ maxHeight: "unset" }}
              className="w-fit"
            >
              <div className="w-fit cursor-pointer text-blue-600">{`Xem chi tiết >>`}</div>
            </Popover>
          )}
        </>
      );
    }
  }, [contentClinicalExamination, data.length, isOnTime, lateList]);

  const renderParaclinical = () => {
    return (
      <>
        {data &&
          data.length > 0 &&
          data.map((item: any, index: number) => (
            <div className="flex flex-col gap-1" key={index}>
              {item.status === "ĐÚNG" ? (
                <div className="bg-[#23ce64] w-[65%] h-1.5 rounded-xs"></div>
              ) : (
                <div className="bg-[#f83a42] w-full h-1.5"></div>
              )}
              <div className="flex items-start gap-1.5">
                {item.status === "ĐÚNG" ? (
                  <div className="bg-[#23ce64] w-1.5 h-1.5 rounded-full mt-[9px]"></div>
                ) : (
                  <div className="bg-[#f83a42] w-1.5 h-1.5 rounded-full mt-[9px]"></div>
                )}
                <div className="max-w-[calc(100%-12px)] flex flex-col gap-0.5">
                  <div className="w-full font-bold">{item.action}</div>
                  <div className="w-full">{`Giờ vào: ${
                    item.startTime
                      ? dayjs(item.startTime).format("HH:mm")
                      : "......"
                  } - Kết luận: ${
                    item.endTime
                      ? dayjs(item.endTime).format("HH:mm")
                      : "......"
                  }`}</div>
                </div>
              </div>
            </div>
          ))}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      {isClinicalExamination
        ? renderClinicalExamination()
        : renderParaclinical()}
    </div>
  );
};

export default ScheduleTime;
