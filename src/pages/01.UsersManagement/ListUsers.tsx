import React, { useCallback, useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { App, Button, Spin, Table, TableColumnsType, Tag } from "antd";
import { UserForm, UserFormRef } from "./UserForm";
import {
  DEFAULT_PAGE_SIZE,
  MEASSAGE,
} from "../../components/constant/constant";
import { iconClose } from "../../components/IconSvg/iconSvg";
import { userService } from "../../common/services/user/user-service";
import { UserEntity } from "../../common/services/user/user";
import CustomPagination from "../../components/common/CustomPagination";
import './usersManagement.css';

const ListUsers = () => {
  const pageSize = DEFAULT_PAGE_SIZE || 10;
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataUsers, setDataUsers] = useState<UserEntity[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { message, modal } = App.useApp();
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const userFormRef = useRef<UserFormRef>(null);
  const hasFetched = useRef(false);

  const getDataUser = useCallback(async () => {
    try {
      setLoading(true);
      const results = await userService.get({
        params: {
          page: pageIndex,
          limit: pageSize,
        },
      });
      if (results) {
        setHasNextPage(results.hasNextPage);
        setDataUsers(results.data);
      } else {
        setHasNextPage(false);
        setDataUsers([]);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }, [pageIndex, pageSize]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      getDataUser();
    } else {
      getDataUser();
    }
  }, [getDataUser]);

  const columns: TableColumnsType<UserEntity> = [
    {
      title: "Họ và tên",
      render: (value, record: UserEntity) => {
        return (
          <span
            className="cursor-pointer"
            onClick={() => {
              userFormRef.current?.show(record);
            }}
          >
            {record.lastName} {record.firstName}
          </span>
        );
      },
      sorter: (a, b) => {
        if (a.lastName && b.lastName) {
          const sortLastName = a.lastName.localeCompare(b.lastName);
          if (sortLastName == 0) {
            return a.firstName.localeCompare(b.firstName);
          }
          return sortLastName;
        } else {
          return 1;
        }
      },
    },
    { title: "Địa chỉ email", dataIndex: "email" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render(value) {
        return (
          <Tag color={value?.name === "Active" ? "success" : "error"}>
            {value?.name}
          </Tag>
        );
      },
    },
  ];

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
                modal.confirm({
                  title: MEASSAGE.CONFIRM_DELETE,
                  okText: MEASSAGE.OK,
                  cancelText: MEASSAGE.NO,
                  onOk: async () => {
                    try {
                      await Promise.all([
                        ...selectedRowKeys.map((id) => {
                          userService.deleteById(id);
                        }),
                      ]);
                      setSelectedRowKeys([]);
                      message.success(MEASSAGE.DELETE_SUCCESS);
                      setPageIndex(1);
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
      <Spin spinning={loading} wrapperClassName="spinContainer">
        <div className="flex flex-col justify-between h-full">
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: (e) => {
                setSelectedRowKeys(e);
              },
            }}
            pagination={false}
            rowKey="id"
            columns={columns}
            dataSource={dataUsers}
            scroll={{ y: window.innerHeight - 255 }}
          />
          <CustomPagination
            hasNextPage={hasNextPage}
            pageIndex={pageIndex}
            onChange={(page) => {
              setPageIndex(page);
            }}
          />
        </div>
      </Spin>
      <UserForm
        ref={userFormRef}
        resetData={() => {
          setPageIndex(1);
        }}
      />
    </PageContainer>
  );
};

export default ListUsers;
