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
import { useTranslation, useI18nStore } from "@/hooks/useI18nStore";
import "./reader.scss";

// Dynamically import the PDF content renderer without SSR
const ReaderContent = dynamic(() => import("./ReaderContent"), {
  ssr: false,
  loading: () => <Loading />,
});

export default function BookReaderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useTranslation();
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
      const res = await getContentById(id as string, { lang });
      if (res) {
        setTitle(res.name as string);
        let url = localStorage.getItem("fileUrlFullPDF") || "";

        if (!url) {
          try {
            const { getContentByIdView } = await import("@/api/element");
            const viewRes = await getContentByIdView(id as string, { lang });
            url = (viewRes?.file_url as string) || "";
          } catch (err) {
            console.error("Error fetching view details:", err);
          }
        }

        if (url) {
          const fullUrl = url.startsWith("http")
            ? url
            : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/api$/, "").replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;

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
  }, [id, lang]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = useCallback((offset: number) => {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages || 1));
  }, [numPages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changePage(1);
      if (e.key === "ArrowLeft") changePage(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changePage]);

  useEffect(() => {
    if (id && pageNumber > 1) {
      localStorage.setItem(`reader_page_${id}`, pageNumber.toString());
    }
  }, [id, pageNumber]);

  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`reader_page_${id}`);
      if (saved) setPageNumber(parseInt(saved));
    }
  }, [id]);

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
          <IoArrowBack /> <span>{t("back")}</span>
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
            <div style={{ padding: "100px" }}>{t("file_not_found")}</div>
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
            <HiOutlineArrowLeft /> <span>{t("prev")}</span>
          </button>
          <div className="page-badge">{pageNumber}</div>
          <button
            className="nav-btn next-btn"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
          >
            <span>{t("next")}</span> <HiOutlineArrowRight />
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
