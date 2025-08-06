/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  App,
  Button,
  Modal,
  Select,
  Spin,
  Table,
  TableColumnsType,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { MEASSAGE } from "../../components/constant/constant";
import { RoleEntity } from "../../common/services/role/role";
import { iconClose } from "../../components/IconSvg/iconSvg";
import { UserEntity } from "../../components/header/EditProfileModal";

const Option = Select;

export interface RoleFormRef {
  show(currentItem?: RoleEntity): Promise<void>;
}

interface RoleFormProps {
  resetData: () => void;
}

export const RoleForm = forwardRef<RoleFormRef, RoleFormProps>(
  ({ resetData }, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [currentRole, setCurrentRole] = useState<RoleEntity | undefined>(
      undefined
    );
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [userPicked, setUserPicked] = useState<string[]>([]);
    const { message, modal } = App.useApp();
    const [form] = useForm();

    useImperativeHandle(
      ref,
      () => ({
        show: async (currentItem?: RoleEntity) => {
          setLoading(true);
          setShowModal(true);
          if (currentItem) {
            setCurrentRole(currentItem);
          }
          setLoading(false);
        },
      }),
      []
    );

    const onOK = async (valueForm: any) => {
      console.log(valueForm);
      message.success("Phân quyền thành công");
      if (resetData) {
        resetData();
      }
    };

    const addUserToGroup = async () => {
      console.log(userPicked);
      message.success("Phân quyền người dùng thành công");
      setUserPicked([]);
    };

    const closeModal = () => {
      setShowModal(false);
      setCurrentRole(undefined);
      form.resetFields();
    };

    const columns: TableColumnsType<UserEntity> = [
      {
        title: "Họ và tên",
        dataIndex: "name",
      },
      { title: "Địa chỉ email", dataIndex: "email" },
      { title: "Địa chỉ", dataIndex: "address" },
    ];

    const dataSource = Array.from({ length: 10 }).map((_, i) => ({
      id: i.toString(),
      name: `Nguyễn Văn ${i}`,
      email: `hailong${i}@gmail.com`,
      address: `Số ${i} Lý Tự Trọng, Hải Phòng`,
    }));

    const listUserPicker = Array.from({ length: 10 }).map((_, i) => ({
      id: (i + 10).toString(),
      name: `Nguyễn Văn ${i + 10}`,
      email: `hailong${i + 10}@gmail.com`,
      address: `Số ${i + 10} Lý Tự Trọng, Hải Phòng`,
    }));

    return (
      <Modal
        title={`Danh sách phân quyền ${currentRole?.name}`}
        onCancel={() => closeModal()}
        width={1200}
        open={showModal}
        closable={loading ? false : true}
        onOk={async () => {
          try {
            const valueForm = await form.validateFields();
            onOK(valueForm);
          } catch (e) {
            console.log(e);
          }
        }}
        okText={MEASSAGE.SAVE}
        cancelText={MEASSAGE.CANCEL}
        maskClosable={false}
      >
        <Spin spinning={loading}>
          <div className="flex h-[32px] my-[5px] mx-0 gap-[5px]">
            <Select
              showSearch
              mode="multiple"
              placeholder="Chọn người dùng"
              value={userPicked}
              onChange={(e: string[]) => {
                setUserPicked(e);
              }}
              filterOption={false}
              className="w-full"
            >
              {listUserPicker.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </Select>

            <Button
              type="default"
              disabled={userPicked.length === 0}
              onClick={() => addUserToGroup()}
              className="border border-gray-300"
            >
              Thêm
            </Button>
          </div>
          <div className="flex items-center justify-end gap-4 h-[32px] my-[5px] mx-0">
            {selectedRowKeys.length > 0 && (
              <Button
                type="dashed"
                size="middle"
                onClick={() => {
                  modal.confirm({
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
            scroll={{ y: window.innerHeight - 600 }}
          />
        </Spin>
      </Modal>
    );
  }
);
