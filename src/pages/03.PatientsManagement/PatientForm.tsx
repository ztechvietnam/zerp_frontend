/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  App,
  Button,
  Descriptions,
  Modal,
  Spin,
  Table,
  TableColumnsType,
  Tabs,
  Tag,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { pick } from "lodash";
import { PatientEntity } from "../../common/services/patient/patient";
import dayjs from "dayjs";
import { zaloMessageService } from "../../common/services/customer-zalo-messages/zalo-mesage-service";
import {
  ZaloMessageEntity,
  ZaloMessageType,
} from "../../common/services/customer-zalo-messages/zalo-mesage";
import { TypeZaloMessage } from "../04.MessagesManagement/ListZaloMessages";
import { customersService } from "../../common/services/patient/customersService";
import QRCode from "qrcode";
import "../../index.css";

export interface PatientFormRef {
  show(currentItem?: PatientEntity): Promise<void>;
}

interface PatientFormProps {}

export const PatientForm = forwardRef<PatientFormRef, PatientFormProps>(
  (props, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [tabActive, setTabActive] = useState<string>("profile");
    const [currentPatient, setCurrentPatient] = useState<
      PatientEntity | undefined
    >(undefined);
    const [listMessages, setListMessages] = useState<ZaloMessageEntity[]>([]);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [form] = useForm();
    const { message } = App.useApp();

    useImperativeHandle(
      ref,
      () => ({
        show: async (currentItem?: PatientEntity) => {
          setLoading(true);
          setShowModal(true);
          if (currentItem) {
            setCurrentPatient(currentItem);
            const formControlValues = pick(currentItem, [
              "name",
              "phone",
              "email",
              "address",
            ]);
            setTimeout(() => {
              form.setFieldsValue(formControlValues);
            }, 0);
            const linkZaloAuthorization =
              await customersService.getLinkZaloAuthorization(currentItem.id);
            await generateQr(linkZaloAuthorization);
          }
          setLoading(false);
        },
      }),
      []
    );

    const generateQr = async (url: string) => {
      try {
        setLoading(true);
        const fixed = url.match(/^https?:\/\//) ? url : `https://${url}`;
        const opts = {
          errorCorrectionLevel: "H" as const,
          type: "image/png" as const,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
          width: 131,
          height: 131,
        };
        const qrUrl = await QRCode.toDataURL(fixed, opts);
        setQrDataUrl(qrUrl);
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, fixed, {
            ...opts,
          });
        }
      } catch (err) {
        console.log(err);
        message.error("Tạo mã QR thất bại");
      } finally {
        setLoading(false);
      }
    };

    const downloadPng = () => {
      if (!qrDataUrl) return;
      const link = document.createElement("a");
      if (canvasRef.current) {
        link.href = canvasRef.current.toDataURL("image/png");
      } else {
        link.href = qrDataUrl;
      }
      link.download = "qrcode.png";
      link.click();
    };

    const columns: TableColumnsType<ZaloMessageEntity> = [
      {
        title: "Nội dung tin nhắn",
        dataIndex: "content",
        width: 400,
        render(value) {
          return (
            <p
              dangerouslySetInnerHTML={{
                __html: value.replace(/\r\n/g, "<br />"),
              }}
            />
          );
        },
      },
      {
        title: "Loại tin nhắn",
        dataIndex: "message_type",
        width: 100,
        render(value) {
          return (
            <Tag color="processing">
              {TypeZaloMessage[value as ZaloMessageType]}
            </Tag>
          );
        },
      },
      {
        title: "Thời điểm gửi",
        dataIndex: "sent_time",
        width: 100,
        render: (value) => {
          return dayjs(value).format("HH:mm DD/MM/YYYY");
        },
      },
    ];

    const getDataMessage = useCallback(async () => {
      setLoading(true);
      if (currentPatient) {
        const message = await zaloMessageService.getMessageByCustomerId(
          currentPatient.id
        );
        setListMessages(message ?? []);
      } else {
        setListMessages([]);
      }
      setLoading(false);
    }, [currentPatient]);

    const closeModal = () => {
      setShowModal(false);
      setTabActive("profile");
      setCurrentPatient(undefined);
      setListMessages([]);
      form.resetFields();
    };

    return (
      <Modal
        title={`Bệnh nhân ${currentPatient?.name}`}
        onCancel={() => closeModal()}
        width={1200}
        open={showModal}
        closable={loading ? false : true}
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Đóng
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <Tabs
            activeKey={tabActive}
            defaultActiveKey="profile"
            onChange={async (e) => {
              setTabActive(e);
              if (e === "historyMessage") {
                await getDataMessage();
              }
            }}
          >
            <Tabs.TabPane tab="Thông tin bệnh nhân" key="profile">
              <div className="flex gap-[10px]">
                {currentPatient && (
                  <Descriptions
                    column={2}
                    bordered
                    size="middle"
                    className="w-[calc(100%-199.59px)]"
                  >
                    <Descriptions.Item label="Họ tên" span={2}>
                      {currentPatient.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại" span={2}>
                      {currentPatient.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email" span={2}>
                      {currentPatient.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>
                      {currentPatient.address}
                    </Descriptions.Item>
                  </Descriptions>
                )}
                <Descriptions
                  column={2}
                  bordered
                  size="middle"
                  layout="vertical"
                  className="qr-code-container"
                >
                  <Descriptions.Item label="QR cấp phép Zalo App" span={1}>
                    <canvas ref={canvasRef} />
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Lịch sử gửi tin nhắn" key="historyMessage">
              <Table
                rowKey="id"
                columns={columns}
                dataSource={listMessages}
                scroll={{ y: window.innerHeight - 430 }}
              />
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </Modal>
    );
  }
);
