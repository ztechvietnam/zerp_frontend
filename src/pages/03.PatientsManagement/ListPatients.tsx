import React, { useRef } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { Table, TableColumnsType } from "antd";
import { dataPatients } from "../../components/constant/constant";
import { PatientEntity } from "../../common/services/patient/patient";
import { PatientForm, PatientFormRef } from "./PatientForm";

const ListPatients = () => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const patientFormRef = useRef<PatientFormRef>(null);

  const columns: TableColumnsType<PatientEntity> = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      render: (value, record: PatientEntity) => {
        return (
          <span
            className="cursor-pointer"
            onClick={() => {
              patientFormRef.current?.show(record);
            }}
          >
            {record.fullName}
          </span>
        );
      },
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    { title: "Di động", dataIndex: "mobile" },
    { title: "Địa chỉ", dataIndex: "address" },
    { title: "Khoa điều trị", dataIndex: "department" },
  ];

  return (
    <PageContainer ref={pageContainerRef}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataPatients}
        scroll={{ y: window.innerHeight - 255 }}
      />
      <PatientForm ref={patientFormRef} />
    </PageContainer>
  );
};

export default ListPatients;
