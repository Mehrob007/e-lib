"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import { getContentById } from "@/api/element";
import axios from "axios";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { IoArrowBack } from "react-icons/io5";
import { HiOutlinePlus, HiOutlineMinus } from "react-icons/hi";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi2";
import Loading from "@/components/ui/loading/Loading";
import dynamic from "next/dynamic";
import "./reader.scss";

// Dynamically import the PDF content renderer without SSR
const ReaderContent = dynamic(() => import("./ReaderContent"), {
  ssr: false,
  loading: () => <Loading />,
});

export default function BookReaderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [title, setTitle] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);

  const fetchBook = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getContentById(id as string);
      if (res) {
        setTitle(res.name as string);
        const details = (res.details as Record<string, unknown>) || {};
        const url = (details.file_url as string) || "";
        if (url) {
          const fullUrl = url.startsWith("http")
            ? url
            : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;

          const pdfRes = await axios.get(fullUrl, {
            headers: { "ngrok-skip-browser-warning": "1" },
            responseType: "arraybuffer",
          });
          setPdfData(pdfRes.data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages));
  };

  const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumber(parseInt(e.target.value));
  };

  if (loading) {
    return (
      <div className="reader-page">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="reader-page">
      <header className="reader-header">
        <button className="back-btn" onClick={() => router.back()}>
          <IoArrowBack /> <span>Баргаштан</span>
        </button>
        <h1>{title}</h1>
        <div className="zoom-controls">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            title="Zoom Out"
            disabled={scale <= 0.5}
          >
            <HiOutlineMinus />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            title="Zoom In"
            disabled={scale >= 3}
          >
            <HiOutlinePlus />
          </button>
        </div>
      </header>

      <main className="reader-viewport" ref={viewportRef}>
        {pdfData ? (
          <ReaderContent
            pdfData={pdfData}
            pageNumber={pageNumber}
            scale={scale}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
          />
        ) : (
          <div className="pdf-container">
            <div style={{ padding: "100px" }}>Файл ёфт нашуд</div>
          </div>
        )}
      </main>

      <footer className="reader-footer">
        <div className="footer-nav">
          <button
            className="nav-btn"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
          >
            <HiOutlineArrowLeft /> <span>Ба қафо</span>
          </button>
          <div className="page-badge">{pageNumber}</div>
          <button
            className="nav-btn next-btn"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
          >
            <span>Ба пеш</span> <HiOutlineArrowRight />
          </button>
        </div>
        <div className="progress-section">
          <span>1</span>
          <input
            type="range"
            min="1"
            max={numPages || 1}
            value={pageNumber}
            onChange={onSliderChange}
          />
          <span>{numPages || "—"}</span>
        </div>
      </footer>
    </div>
  );
}
