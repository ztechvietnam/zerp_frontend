/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Modal, Spin } from "antd";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ReactPlayer from "react-player";

export interface ModalPlayVideoRef {
  show(): Promise<void>;
}

interface ModalPlayVideoProps {}

const ModalPlayVideo = forwardRef<ModalPlayVideoRef, ModalPlayVideoProps>(
  ({}, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [playing, setPlaying] = useState<boolean>(false);
    const reactPlayerRef = useRef<HTMLVideoElement>(null)

    useImperativeHandle(
      ref,
      () => ({
        show: async () => {
          setLoading(true);
          setShowModal(true);
          setLoading(false);
        },
      }),
      []
    );

    const closeModal = () => {
      setPlaying(false)
      setShowModal(false);
    };

    return (
      <Modal
        title="Trình phát video"
        onCancel={() => closeModal()}
        width={688}
        open={showModal}
        closable={!loading}
        maskClosable={false}
        footer={false}
      >
        <Spin spinning={loading}>
          {showModal && (
            <ReactPlayer
              playing={playing}
              ref={reactPlayerRef}
              controls={true}
              height={400}
              width={"100%"}
              src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"
              style={{
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: 12,
                borderRadius: 20,
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          )}
        </Spin>
      </Modal>
    );
  }
);

export default ModalPlayVideo;
