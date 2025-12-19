/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import React from "react";

interface Props {
  data: any[];
}

const ScheduleTime: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-col gap-1">
      {data &&
        data.length > 0 &&
        data.map((item: any, index: number) => (
          <div className="flex flex-col gap-0.5" key={index}>
            {item.endTime ? (
              <div className="bg-[#23ce64] w-[65%] h-1.5 rounded-xs"></div>
            ) : (
              <div className="bg-[#f83a42] w-full h-1.5"></div>
            )}
            {item?.action ? (
              <div className="flex items-center gap-1.5">
                {item.endTime ? (
                  <div className="bg-[#23ce64] w-1.5 h-1.5 rounded-full"></div>
                ) : (
                  <div className="bg-[#f83a42] w-1.5 h-1.5 rounded-full"></div>
                )}
                <div>{`${item.action} | ${dayjs(item.startTime).format(
                  "HH:mm"
                )} - ${
                  item.endTime ? dayjs(item.endTime).format("HH:mm") : "......"
                }`}</div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {item.endTime ? (
                  <div className="bg-[#23ce64] w-1.5 h-1.5 rounded-full"></div>
                ) : (
                  <div className="bg-[#f83a42] w-1.5 h-1.5 rounded-full"></div>
                )}
                <div>{`Vào: ${dayjs(item.startTime).format("HH:mm")} - Ra: ${
                  item.endTime ? dayjs(item.endTime).format("HH:mm") : "......"
                }`}</div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default ScheduleTime;
