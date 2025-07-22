import React, { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  Descriptions,
  Popover,
  Spin,
  Table,
  TableColumnsType,
  Tabs,
} from "antd";
import { dataMessages, dataPatients } from "../../components/constant/constant";
import { MessageEntity } from "../../common/services/message/message";
import dayjs from "dayjs";
import { PatientEntity } from "../../common/services/patient/patient";
import { groupBy } from "lodash";

interface MessagePatient {
  content: string;
  time: string;
  patient: PatientEntity;
}

interface GroupMessage {
  date: string;
  messages: MessagePatient[];
}

const ListMessages = () => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [groupMessage, setGroupMessage] = useState<GroupMessage[]>([]);
  const [tabActive, setTabActive] = useState<string>("1");

  useEffect(() => {
    setLoading(true);
    setTabActive("1");
    const messagePatients = dataMessages
      .map((msg) => {
        const patient = dataPatients.find((p) => p.id === msg.patient);
        if (!patient) return null; // hoặc throw error nếu cần đảm bảo dữ liệu
        return {
          content: msg.content,
          time: msg.time,
          patient,
        };
      })
      .filter(Boolean) as MessagePatient[];
    const groupedMessages = groupBy(messagePatients, (message) =>
      dayjs(message.time, "HH:mm DD/MM/YYYY").format("DD/MM/YYYY")
    );

    const groupedArray = Object.entries(groupedMessages)
      .map(([date, messages]) => ({
        date,
        messages: messages.sort(
          (a, b) =>
            dayjs(b.time, "HH:mm DD/MM/YYYY").valueOf() -
            dayjs(a.time, "HH:mm DD/MM/YYYY").valueOf()
        ),
      }))
      .sort(
        (a, b) =>
          dayjs(b.date, "DD/MM/YYYY").valueOf() -
          dayjs(a.date, "DD/MM/YYYY").valueOf()
      );
    setGroupMessage(groupedArray);
    setLoading(false);
  }, []);

  const renderPatient = (patient: PatientEntity) => {
    return (
      <Descriptions column={2} bordered size="middle">
        <Descriptions.Item label="Họ tên" span={2}>
          {patient.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại" span={2}>
          {patient.mobile}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {patient.address}
        </Descriptions.Item>
        <Descriptions.Item label="Khoa điều trị" span={2}>
          {patient.department}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const columns: TableColumnsType<MessagePatient> = [
    { title: "Nội dung tin nhắn", dataIndex: "content", width: 400 },
    {
      title: "Tên bệnh nhân",
      width: 200,
      render: (value, record) => {
        return (
          <div className="cursor-pointer w-fit flex items-center px-[6px] py-[2px] border border-transparent hover:border-gray-300 hover:rounded transition-all duration-200">
            <Popover
              content={renderPatient(record.patient)}
              placement="rightTop"
            >
              {record.patient.fullName}
            </Popover>
          </div>
        );
      },
    },
    {
      title: "Thời điểm gửi",
      dataIndex: "time",
      width: 100,
      render: (value) => {
        return dayjs(value, "HH:mm DD/MM/YYYY").format("HH:mm DD/MM/YYYY");
      },
    },
  ];

  return (
    <PageContainer ref={pageContainerRef}>
      <Spin spinning={loading}>
        <Tabs
          activeKey={tabActive}
          onChange={(e) => {
            setTabActive(e);
          }}
          type="card"
        >
          {groupMessage.map((group, index) => (
            <Tabs.TabPane tab={group.date} key={(index + 1).toString()}>
              <Table
                columns={columns}
                dataSource={group.messages}
                pagination={false}
              />
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Spin>
    </PageContainer>
  );
};

export default ListMessages;
