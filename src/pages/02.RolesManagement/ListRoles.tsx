import { Table, TableColumnsType } from "antd";
import React, { useRef } from "react";
import { RoleEntity } from "../../common/services/role/role";
import PageContainer from "../../components/PageContainer/PageContainer";
import { RoleForm, RoleFormRef } from "./RoleForm";

const ListRoles = () => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const roleFormRef = useRef<RoleFormRef>(null);

  const columns: TableColumnsType<RoleEntity> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value, record: RoleEntity) => {
        return (
          <span
            className="cursor-pointer"
            onClick={() => {
              roleFormRef.current?.show(record);
            }}
          >
            {record.name}
          </span>
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    { title: "Description", dataIndex: "description" },
  ];

  const dataSource = [
    {
      id: "1",
      name: 'Full Control',
      description: `Có toàn quyền trong hệ thống`,
    },
    {
      id: '2',
      name: 'Administrator',
      description: `Có quyền quản trị`,
    },
  ];

  return (
    <PageContainer
      ref={pageContainerRef}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        scroll={{ y: window.innerHeight - 255 }}
      />
      <RoleForm
        ref={roleFormRef}
        resetData={() => {
          console.log("resetData");
        }}
      />
    </PageContainer>
  );
};

export default ListRoles;