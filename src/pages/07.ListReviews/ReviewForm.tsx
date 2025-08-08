/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Descriptions,
  Modal,
  Spin,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import dayjs from "dayjs";
import { ReviewEntity } from "../../common/services/review/review";

export interface ReviewFormRef {
  show(currentItem: ReviewEntity): Promise<void>;
}

interface ReviewFormProps {}

export const ReviewForm = forwardRef<ReviewFormRef, ReviewFormProps>(
  (props, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [currentReview, setCurrentReview] = useState<
      ReviewEntity | undefined
    >(undefined);
    const [form] = useForm();

    useImperativeHandle(
      ref,
      () => ({
        show: async (currentItem: ReviewEntity) => {
          setLoading(true);
          setShowModal(true);
          if (currentItem) {
            setCurrentReview(currentItem);
          }
          setLoading(false);
        },
      }),
      []
    );

    const closeModal = () => {
      setShowModal(false);
      setCurrentReview(undefined);
      form.resetFields();
    };

    return (
      <Modal
        title="Chi tiết đánh giá"
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
          {currentReview && (
            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item label="Họ tên" span={2}>
                {currentReview.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={2}>
                {currentReview.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {currentReview.email}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian đánh giá" span={2}>
                {dayjs(currentReview.created).format("HH:mm DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Đánh giá" span={2}>
                {currentReview.review}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    );
  }
);
