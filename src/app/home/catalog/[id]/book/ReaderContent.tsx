"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Loading from "@/components/ui/loading/Loading";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfData: ArrayBuffer;
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
  numPages,
  scale,
  onDocumentLoadSuccess,
  onPageNumberChange,
}: Props) {
  const file = useMemo(() => ({ data: pdfData }), [pdfData]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
      setIsMobile(window.innerWidth <= 768);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const isScrollingByCode = useRef(false);

  // Sync scroll with pageNumber (for slider or button clicks)
  useEffect(() => {
    if (isMobile && pageNumber > 0 && !isScrollingByCode.current && containerRef.current) {
      const pageEl = document.getElementById(`pdf-page-${pageNumber}`);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pageNumber, isMobile]);

  // Sync pageNumber state with scroll position using IntersectionObserver
  useEffect(() => {
    if (!isMobile || !onPageNumberChange || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(
              entry.target.getAttribute("data-page-number") || "1",
            );
            if (pageNum !== pageNumber) {
              isScrollingByCode.current = true;
              onPageNumberChange(pageNum);
              // Reset flag after state update propagation
              setTimeout(() => {
                isScrollingByCode.current = false;
              }, 500);
            }
          }
        });
      },
      { threshold: 0.5, rootMargin: "-10% 0px -10% 0px" },
    );

    const pages = document.querySelectorAll(".pdf-page-wrapper");
    pages.forEach((p) => observer.observe(p));

    return () => {
      pages.forEach((p) => observer.unobserve(p));
    };
  }, [isMobile, numPages, onPageNumberChange, pageNumber]);

  return (
    <div className="pdf-container" ref={containerRef}>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Loading />}
      >
        {isMobile ? (
          <div className="pdf-scroll-list">
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={index + 1}
                id={`pdf-page-${index + 1}`}
                data-page-number={index + 1}
                className="pdf-page-wrapper"
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  width={containerWidth || undefined}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <Page
            pageNumber={pageNumber}
            scale={scale}
            width={containerWidth || undefined}
            renderAnnotationLayer={false}
            renderTextLayer={true}
          />
        )}
      </Document>
    </div>
  );
}

