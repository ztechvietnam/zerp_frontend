import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import { Modal } from "antd";
import { renderAsync } from "docx-preview";
import "./DocumentViewer.css";

export interface DocumentViewerRef {
  show: (
    files: (string | Blob | File)[],
    options?: { titles?: string[] }
  ) => void;
}

const DocumentViewer = forwardRef<DocumentViewerRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Xem văn bản");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
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

      // 🎯 Xác định loại file
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

      // 🟡 Nếu là Excel hoặc PowerPoint → tải xuống
      if (isExcel || isPowerpoint) {
        const blobUrl =
          typeof firstFile === "string"
            ? firstFile
            : URL.createObjectURL(firstFile);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        a.click();
        if (blobUrl.startsWith("blob:")) URL.revokeObjectURL(blobUrl);
        return;
      }

      // 🟢 Nếu là DOCX
      if (isDocx && typeof firstFile !== "string") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML = "";
            await renderAsync(buffer, docxContainerRef.current);
          }
          setVisible(true);
          setModalTitle(fileName);
          setFileType("docx");
          setFileUrl(null);
        };
        reader.readAsArrayBuffer(firstFile);
        return;
      }

      // 🔵 Nếu là PDF hoặc link
      const url =
        typeof firstFile === "string"
          ? firstFile
          : URL.createObjectURL(firstFile);
      setFileUrl(url);
      setModalTitle(fileName);
      setFileType(isPdf ? "pdf" : "other");
      setVisible(true);
    },
  }));

  const handleClose = () => {
    if (fileUrl?.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    setVisible(false);
    setFileUrl(null);
    setFileType(null);
    if (docxContainerRef.current) docxContainerRef.current.innerHTML = "";
  };

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
        <div
          ref={docxContainerRef}
          className="overflow-auto h-[78vh] p-6 bg-gray-50 docx-preview rounded-md"
        />
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
