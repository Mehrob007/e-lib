"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Loading from "@/components/ui/loading/Loading";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfData: string;
  pageNumber: number;
  numPages: number;
  scale: number;
  onDocumentLoadSuccess: (data: { numPages: number }) => void;
  onPageChange: (offset: number) => void;
  onPageNumberChange?: (page: number) => void;
}

export default function ReaderContent({
  pdfData,
  pageNumber,
  scale,
  onDocumentLoadSuccess,
}: Props) {
  const file = useMemo(() => ({ url: pdfData }), [pdfData]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="pdf-container" ref={containerRef}>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Loading />}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          width={containerWidth || undefined}
          renderAnnotationLayer={false}
          renderTextLayer={true}
        />
      </Document>
    </div>
  );
}
