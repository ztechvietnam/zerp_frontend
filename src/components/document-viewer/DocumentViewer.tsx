import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
} from "react";
import { Button, Modal, Tooltip } from "antd";
import { renderAsync } from "docx-preview";
import "./DocumentViewer.css";
import { iconDownload } from "../IconSvg/iconSvg";

export interface DocumentViewerRef {
  show: (
    files: (string | Blob | File)[],
    options?: { titles?: string[] }
  ) => void;
}

const DocumentViewer = forwardRef<DocumentViewerRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Xem văn bản");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<"pdf" | "docx" | "other" | null>(
    null
  );
  const docxContainerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    show(files, options) {
      const firstFile = files[0];
      const fileName =
        options?.titles?.[0] ||
        (typeof firstFile !== "string"
          ? (firstFile as File).name
          : firstFile.split("/").pop() || "Tài liệu");

      const lower = fileName.toLowerCase();

      const isExcel =
        lower.endsWith(".xlsx") ||
        (typeof firstFile !== "string" &&
          (firstFile as File).type.includes(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ));
      const isPowerpoint =
        lower.endsWith(".pptx") ||
        (typeof firstFile !== "string" &&
          (firstFile as File).type.includes(
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          ));

      const isDocx =
        lower.endsWith(".docx") ||
        (typeof firstFile !== "string" &&
          (firstFile as File).type.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ));

      const isPdf =
        lower.endsWith(".pdf") ||
        (typeof firstFile !== "string" &&
          (firstFile as File).type.includes("application/pdf"));

      const url =
        typeof firstFile === "string"
          ? firstFile
          : URL.createObjectURL(firstFile);

      if (isExcel || isPowerpoint) {
        downloadFile(url, fileName);
        return;
      }
      setFileUrl(url);

      if (isDocx && typeof firstFile !== "string") {
        setVisible(true);
        setModalTitle(fileName);
        setFileType("docx");

        setTimeout(() => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            if (docxContainerRef.current) {
              docxContainerRef.current.innerHTML = ""; // reset
              await renderAsync(buffer, docxContainerRef.current);
            }
          };
          reader.readAsArrayBuffer(firstFile);
        }, 50);

        return;
      }
      setModalTitle(fileName);
      setFileType(isPdf ? "pdf" : "other");
      setVisible(true);
    },
  }));

  const handleClose = () => {
    if (fileUrl?.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    setVisible(false);
    setFileUrl("");
    setFileType(null);
    if (docxContainerRef.current) {
      docxContainerRef.current.replaceChildren();
    }
  };

  const downloadFile = useCallback(
    (url: string, fileName?: string) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName
        ? fileName
        : modalTitle.includes(fileType || "")
        ? modalTitle
        : `${modalTitle}.${fileType}`;
      a.click();
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    },
    [modalTitle, fileType]
  );

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      title={modalTitle}
      className="w-screen! top-0!"
      zIndex={1050}
      centered
      bodyStyle={{
        padding: 0,
        height: "calc(100vh - 73px)",
      }}
    >
      {fileType === "docx" ? (
        <div className="flex flex-col w-full">
          <div className="flex w-full justify-end px-2">
            <Tooltip title="Tải xuống">
              <Button
                type="text"
                onClick={() => {
                  downloadFile(fileUrl);
                }}
              >
                {iconDownload}
              </Button>
            </Tooltip>
          </div>
          <div
            ref={docxContainerRef}
            className="overflow-auto h-[calc(100vh-120px)] px-0 py-6 lg:px-6 bg-gray-50 docx-preview rounded-md"
          />
        </div>
      ) : fileType === "pdf" ? (
        <iframe
          src={fileUrl!}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="PDF Viewer"
        />
      ) : fileUrl ? (
        <iframe
          src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
            fileUrl
          )}`}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="File Viewer"
        />
      ) : null}
    </Modal>
  );
});

export default DocumentViewer;
