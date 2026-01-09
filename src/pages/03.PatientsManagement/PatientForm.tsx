/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Descriptions,
  Modal,
  QRCode,
  Spin,
  Table,
  TableColumnsType,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { pick } from "lodash";
import { PatientEntity } from "../../common/services/patient/patient";
import dayjs from "dayjs";
import { zaloMessageService } from "../../common/services/customer-zalo-messages/zalo-mesage-service";
import { ZaloMessageEntity } from "../../common/services/customer-zalo-messages/zalo-mesage";
import { customersService } from "../../common/services/patient/customersService";
import "../../index.css";
import { DownloadOutlined } from "@ant-design/icons";

export interface PatientFormRef {
  show(currentItem?: PatientEntity): Promise<void>;
}

interface PatientFormProps {}

export const PatientForm = forwardRef<PatientFormRef, PatientFormProps>(
  (_props, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [tabActive, setTabActive] = useState<string>("profile");
    const [currentPatient, setCurrentPatient] = useState<
      PatientEntity | undefined
    >(undefined);
    const [listMessages, setListMessages] = useState<ZaloMessageEntity[]>([]);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [form] = useForm();

    useImperativeHandle(
      ref,
      () => ({
        show: async (currentItem?: PatientEntity) => {
          setLoading(true);
          setShowModal(true);
          if (currentItem) {
            setCurrentPatient(currentItem);
            const formControlValues = pick(currentItem, [
              "customer_id",
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
            setQrDataUrl(linkZaloAuthorization);
          }
          setLoading(false);
        },
      }),
      []
    );

    const columns = (
      haveData: boolean
    ): TableColumnsType<ZaloMessageEntity> => {
      return [
        {
          title: "Nội dung tin nhắn",
          dataIndex: "content",
          ...(haveData ? { width: 400 } : {}),
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
          ...(haveData ? { width: 100 } : {}),
          dataIndex: "zns_template",
          render(value) {
            return (
              <Tag color="processing">
                {value?.zns_template_name || value?.zns_template_code || ""}
              </Tag>
            );
          },
        },
        {
          title: "Thời điểm gửi",
          dataIndex: "sent_time",
          ...(haveData ? { width: 100 } : {}),
          render: (value) => {
            return dayjs(value).format("HH:mm DD/MM/YYYY");
          },
        },
      ];
    };

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

    const downloadQRCodePNG = async () => {
      const svgEl = document.querySelector("#myqrcode svg") as SVGSVGElement;
      if (!svgEl) return;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);

      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svgStr);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = 4;
        canvas.width = 222 * scale;
        canvas.height = 222 * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const url = canvas.toDataURL("image/png");

        const a = document.createElement("a");
        a.href = url;
        a.download = "QRCode.png";
        a.click();
      };
    };

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
                    className="w-[calc(100%-242px)] description-patient"
                  >
                    <Descriptions.Item label="Họ tên" span={2}>
                      {currentPatient.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã Y Tế" span={2}>
                      {currentPatient.medical_id}
                    </Descriptions.Item>
                    <Descriptions.Item label="CCCD" span={2}>
                      {currentPatient.personal_id}
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
                  className="qr-code-container description-patient2"
                  id="myqrcode"
                >
                  <Descriptions.Item label="QR cấp phép Zalo App" span={1}>
                    <div
                      className="relative w-[222px] h-[222px] cursor-pointer group"
                      onClick={downloadQRCodePNG}
                    >
                      <QRCode
                        value={qrDataUrl || ""}
                        size={222}
                        errorLevel="L"
                        type="svg"
                      />
                      <Tooltip
                        title="Click để tải xuống"
                        placement="bottom"
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      >
                        <DownloadOutlined className="icon-download" />
                      </Tooltip>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Lịch sử gửi tin nhắn" key="historyMessage">
              <Table
                rowKey="id"
                columns={columns(!!listMessages?.length)}
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
