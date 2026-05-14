"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";
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
  onPageChange: (offset: number) => void;
}

export default function ReaderContent({
  pdfData,
  pageNumber,
  scale,
  onDocumentLoadSuccess,
  onPageChange,
}: Props) {
  const file = useMemo(() => ({ data: pdfData }), [pdfData]);
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

  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      onPageChange(1);
    } else if (info.offset.x > swipeThreshold) {
      onPageChange(-1);
    }
  };

  return (
    <div className="pdf-container" ref={containerRef}>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Loading />}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pageNumber}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ width: "100%", display: "flex", justifyContent: "center", cursor: "grab" }}
            whileTap={{ cursor: "grabbing" }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              width={containerWidth || undefined}
              renderAnnotationLayer={false}
              renderTextLayer={true}
            />
          </motion.div>
        </AnimatePresence>
      </Document>
    </div>
  );
}
