import React, { useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { Button, message, Modal, Table, TableColumnsType } from "antd";
import { UserEntity, UserForm, UserFormRef } from "./UserForm";
import { MEASSAGE } from "../../components/constant/constant";
import { iconClose } from "../../components/IconSvg/iconSvg";

const ListUsers = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const userFormRef = useRef<UserFormRef>(null);

  const columns: TableColumnsType<UserEntity> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value, record: UserEntity) => {
        return (
          <span
            className="cursor-pointer"
            onClick={() => {
              userFormRef.current?.show(record);
            }}
          >
            {record.name}
          </span>
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    { title: "Email", dataIndex: "email" },
    { title: "Address", dataIndex: "address" },
  ];

  const dataSource = Array.from({ length: 46 }).map((_, i) => ({
    id: i,
    name: `Nguyễn Văn ${i}`,
    email: `hailong${i}@gmail.com`,
    address: `Số ${i} Lý Tự Trọng, Hải Phòng`,
  }));

  return (
    <PageContainer
      ref={pageContainerRef}
      toolbarRight={
        <div className="flex items-center gap-4">
          <Button
            type="primary"
            size="middle"
            style={{ marginLeft: 16 }}
            onClick={() => {
              userFormRef.current?.show();
            }}
          >
            Thêm mới
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              type="dashed"
              size="middle"
              style={{ marginLeft: 16 }}
              onClick={() => {
                Modal.confirm({
                  title: MEASSAGE.CONFIRM_DELETE,
                  okText: MEASSAGE.OK,
                  cancelText: MEASSAGE.NO,
                  onOk: async () => {
                    try {
                      setSelectedRowKeys([]);
                      message.success(MEASSAGE.DELETE_SUCCESS);
                    } catch (error) {
                      console.log(error);
                      message.error(MEASSAGE.ERROR, 3);
                    }
                  },
                  onCancel() {},
                });
              }}
            >
              Xóa
            </Button>
          )}

          {selectedRowKeys.length > 0 ? (
            <Button
              icon={iconClose}
              onClick={() => {
                setSelectedRowKeys([]);
              }}
            >
              Đã chọn {selectedRowKeys.length} bản ghi
            </Button>
          ) : (
            ""
          )}
        </div>
      }
    >
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (e) => {
            setSelectedRowKeys(e);
          },
        }}
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        scroll={{ y: window.innerHeight - 255 }}
      />
      <UserForm
        ref={userFormRef}
        resetData={() => {
          console.log("resetData");
        }}
      />
    </PageContainer>
  );
};

export default ListUsers;
