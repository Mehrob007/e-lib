"use client";

import { useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Loading from "@/components/ui/loading/Loading";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfData: ArrayBuffer;
  pageNumber: number;
  scale: number;
  onDocumentLoadSuccess: (data: { numPages: number }) => void;
}

export default function ReaderContent({
  pdfData,
  pageNumber,
  scale,
  onDocumentLoadSuccess,
}: Props) {
  const file = useMemo(() => ({ data: pdfData }), [pdfData]);

  return (
    <div className="pdf-container">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Loading />}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderAnnotationLayer={false}
          renderTextLayer={true}
        />
      </Document>
    </div>
  );
}
