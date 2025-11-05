import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
} from "react";
import DocViewer, {
  DocViewerRenderers,
  IDocument,
} from "@cyntler/react-doc-viewer";
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
  const [docs, setDocs] = useState<IDocument[]>([]);
  const [modalTitle, setModalTitle] = useState("Xem văn bản");
  const [isDocx, setIsDocx] = useState(false);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    show(files, options) {
      const firstFile = files[0];
      const fileName =
        options?.titles?.[0] ||
        (typeof firstFile !== "string"
          ? (firstFile as File).name
          : firstFile.split("/").pop() || "Tài liệu");

      const isDocxFile =
        fileName.toLowerCase().endsWith(".docx") ||
        (typeof firstFile !== "string" &&
          (firstFile as File).type.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ));

      setIsDocx(isDocxFile);
      setModalTitle(fileName);
      setVisible(true);

      if (isDocxFile && typeof firstFile !== "string") {
        // DOCX render bằng docx-preview
        const docFile = firstFile as File;
        const reader = new FileReader();
        reader.onload = async (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML = ""; // clear cũ
            await renderAsync(buffer, docxContainerRef.current);
          }
        };
        reader.readAsArrayBuffer(docFile);
      } else {
        // Các loại file khác (pdf, ảnh, txt...)
        const formattedDocs: IDocument[] = files.map((file, idx) => {
          if (typeof file === "string") {
            return { uri: file };
          }
          return {
            uri: URL.createObjectURL(file),
            fileName: options?.titles?.[idx] || "Tài liệu",
          };
        });
        setDocs(formattedDocs);
      }
    },
  }));

  // 🧹 Cleanup khi đóng modal
  useEffect(() => {
    if (!visible) {
      // 1️⃣ Clear docx-preview DOM
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = "";
      }

      // 2️⃣ Revoke blob URLs
      docs.forEach((d) => {
        if (d.uri?.startsWith("blob:")) URL.revokeObjectURL(d.uri);
      });

      // 3️⃣ Reset state
      setDocs([]);
      setIsDocx(false);
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      title={modalTitle}
      className="!w-[90vw] !top-0"
      centered
      bodyStyle={{
        padding: 0,
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isDocx ? (
        <div
          ref={docxContainerRef}
          className="overflow-auto h-[78vh] p-6 bg-gray-50 docx-preview rounded-md"
        />
      ) : docs.length > 0 ? (
        <div className="flex flex-col h-[80vh] overflow-hidden rounded-lg border border-gray-200">
          <div className="flex-grow overflow-auto mt-[40px]">
            <DocViewer
              documents={docs}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: true,
                },
                pdfVerticalScrollByDefault: true,
                pdfZoom: { defaultZoom: 1.0, zoomJump: 0.2 },
              }}
              style={{
                width: "100%",
                height: "80vh",
              }}
            />
          </div>
        </div>
      ) : null}
    </Modal>
  );
});

export default DocumentViewer;
