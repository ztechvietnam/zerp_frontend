/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, Button, Form, Input, Modal, Spin, Tooltip } from "antd";
import { useForm } from "antd/es/form/Form";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import QRCode from "qrcode";
import { DownloadOutlined } from "@ant-design/icons";
import "../../index.css";

export interface QRGeneratorModalRef {
  show(): Promise<void>;
}

interface QRGeneratorModalProps {}

export const QRGeneratorModal = forwardRef<
  QRGeneratorModalRef,
  QRGeneratorModalProps
>((_, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { message } = App.useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [form] = useForm();

  useImperativeHandle(ref, () => ({
    show: async () => {
      setShowModal(true);
      setQrDataUrl(null);
      form.resetFields();
    },
  }));

  const generateQr = async (values: any) => {
    try {
      setLoading(true);
      const { url } = values;
      if (!url) {
        message.error("Vui lòng nhập URL");
        setLoading(false);
        return;
      }
      const fixed = url.match(/^https?:\/\//) ? url : `https://${url}`;
      const opts = {
        errorCorrectionLevel: "H" as const,
        type: "image/png" as const,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      };
      const qrUrl = await QRCode.toDataURL(fixed, opts);
      setQrDataUrl(qrUrl);
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, fixed, { ...opts, scale: 8 });
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

  const closeModal = () => {
    setShowModal(false);
    setQrDataUrl(null);
    form.resetFields();
  };

  return (
    <Modal
      title={"Tạo mã QR từ URL"}
      onCancel={() => closeModal()}
      width={600}
      open={showModal}
      closable={!loading}
      footer={null}
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <Form
          layout="horizontal"
          form={form}
          style={{ padding: 24 }}
          onFinish={generateQr}
        >
          <Form.Item
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            label="Nhập link URL"
            name="url"
            rules={[
              {
                required: true,
                message: "Trường yêu cầu nhập!",
              },
            ]}
          >
            <Input
              style={{ width: "100%" }}
              placeholder={"Vui lòng điền link"}
              maxLength={500}
            />
          </Form.Item>

          <div className="flex items-center justify-center mb-[24px]">
            {qrDataUrl ? (
              <div
                className="relative w-[200px] h-[200px] cursor-pointer group"
                onClick={downloadPng}
              >
                <img
                  src={qrDataUrl}
                  alt="QR code"
                  className="w-full h-full block"
                />
                <Tooltip
                  title="Click để tải xuống"
                  placement="bottom"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <DownloadOutlined className="icon-download" />
                </Tooltip>
              </div>
            ) : (
              <p style={{ color: "#888" }}>
                Mã QR sẽ hiển thị tại đây sau khi tạo.
              </p>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              gap: 8,
            }}
          >
            <Button type="primary" htmlType="submit">
              Tạo mã QR
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
});
