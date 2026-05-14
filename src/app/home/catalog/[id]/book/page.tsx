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
import { useTranslation } from "@/hooks/useI18nStore";
import "./reader.scss";

const ReaderContent = dynamic(() => import("./ReaderContent"), {
  ssr: false,
  loading: () => <Loading />,
});

const EpubReaderContent = dynamic(() => import("./EpubReaderContent"), {
  ssr: false,
  loading: () => <Loading />,
});

const Fb2ReaderContent = dynamic(() => import("./Fb2ReaderContent"), {
  ssr: false,
  loading: () => <Loading />,
});

type ReaderType = "pdf" | "epub" | "text" | "fb2" | null;

export default function BookReaderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useTranslation();
  
  const [readerType, setReaderType] = useState<ReaderType>(null);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string>("");
  
  // PDF & Text specific
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [epubData, setEpubData] = useState<ArrayBuffer | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [fb2Content, setFb2Content] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fontSize, setFontSize] = useState<number>(18);
  
  // EPUB specific
  const [epubLocation, setEpubLocation] = useState<string | null>(null);
  const [epubNextTrigger, setEpubNextTrigger] = useState(0);
  const [epubPrevTrigger, setEpubPrevTrigger] = useState(0);

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

          setFileUrl(fullUrl);
          const urlPath = fullUrl.split("?")[0].toLowerCase();

          if (urlPath.endsWith(".txt") || urlPath.endsWith(".fb2")) {
            const res = await axios.get(fullUrl, {
              headers: { "ngrok-skip-browser-warning": "1" },
              responseType: "arraybuffer",
            });

            let text = "";
            try {
              const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
              text = utf8Decoder.decode(res.data);
            } catch (e) {
              const win1251Decoder = new TextDecoder("windows-1251");
              text = win1251Decoder.decode(res.data);
            }

            if (urlPath.endsWith(".txt")) {
              setTextContent(text);
              setReaderType("text");
            } else {
              setFb2Content(text);
              setReaderType("fb2");
            }
          } else if (urlPath.endsWith(".epub")) {
            const epubRes = await axios.get(fullUrl, {
              headers: { "ngrok-skip-browser-warning": "1" },
              responseType: "arraybuffer",
            });
            setEpubData(epubRes.data);
            setReaderType("epub");
            const savedLoc = localStorage.getItem(`epub_loc_${id}`);
            if (savedLoc) setEpubLocation(savedLoc);
          } else {
            // Default to PDF
            const pdfRes = await axios.get(fullUrl, {
              headers: { "ngrok-skip-browser-warning": "1" },
              responseType: "arraybuffer",
            });
            setPdfData(pdfRes.data);
            setReaderType("pdf");
          }
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
    if (readerType === "pdf") {
      setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages || 1));
    } else if (readerType === "epub") {
      if (offset > 0) setEpubNextTrigger((t) => t + 1);
      else setEpubPrevTrigger((t) => t + 1);
    }
  }, [numPages, readerType]);

  // Persistence
  useEffect(() => {
    if (id && readerType === "pdf" && pageNumber > 1) {
      localStorage.setItem(`reader_page_${id}`, pageNumber.toString());
    }
  }, [id, pageNumber, readerType]);

  useEffect(() => {
    if (id && readerType === "pdf") {
      const saved = localStorage.getItem(`reader_page_${id}`);
      if (saved) setPageNumber(parseInt(saved));
    }
  }, [id, readerType]);

  // EPUB Handlers
  const onEpubLocationChange = (loc: string) => {
    setEpubLocation(loc);
    if (id) {
      localStorage.setItem(`epub_loc_${id}`, loc);
    }
  };

  // Shared Key Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readerType === "pdf" || readerType === "epub") {
        if (e.key === "ArrowRight") changePage(1);
        if (e.key === "ArrowLeft") changePage(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changePage, readerType]);

  const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumber(parseInt(e.target.value));
  };

  if (loading) {
    return (
      <div className="reader-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className={`reader-page ${readerType}-mode`}>
      <header className="reader-header">
        <button className="back-btn" onClick={() => router.back()}>
          <IoArrowBack /> <span>{t("back")}</span>
        </button>
        <h1>{title}</h1>
        
        <div className="reader-controls">
          <div className="control-group">
            <button
              onClick={() => {
                if (readerType === "pdf") setScale((s) => Math.max(0.1, s - 0.1));
                else setFontSize((s) => Math.max(1, s - 2));
              }}
              title="Zoom Out / Decrease Font"
            >
              <HiOutlineMinus />
            </button>
            <span className="control-label">
              {readerType === "pdf" ? `${Math.round(scale * 100)}%` : `${fontSize}px`}
            </span>
            <button
              onClick={() => {
                if (readerType === "pdf") setScale((s) => s + 0.1);
                else setFontSize((s) => s + 2);
              }}
              title="Zoom In / Increase Font"
            >
              <HiOutlinePlus />
            </button>
          </div>
        </div>
      </header>

      <main className="reader-viewport" ref={viewportRef}>
        <div 
          className="reader-content-wrapper" 
          style={{ 
            fontSize: (readerType === "text" || readerType === "fb2") ? `${fontSize}px` : undefined,
            margin: "0 auto",
            height: readerType === "pdf" ? "calc(100vh)" : readerType === "epub" ? "100vh" : "auto",
            maxWidth: readerType === "pdf" ? "100%" : "900px",
            minHeight: (readerType === "epub" || readerType === "pdf") ? "auto" : "100%",
            display: "flex",
            flexDirection: "column",
            overflowX: "auto",
            boxSizing: "border-box",
            minWidth: "100%"
          }}
        >
          {readerType === "text" ? (
            <div className="text-container">
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {textContent}
              </pre>
            </div>
          ) : readerType === "fb2" ? (
            <Fb2ReaderContent content={fb2Content} />
          ) : readerType === "epub" && epubData ? (
            <EpubReaderContent
              data={epubData}
              title={title}
              location={epubLocation || undefined}
              onLocationChange={onEpubLocationChange}
              fontSize={fontSize}
              nextTrigger={epubNextTrigger}
              prevTrigger={epubPrevTrigger}
            />
          ) : pdfData ? (
            <ReaderContent
              pdfData={pdfData}
              pageNumber={pageNumber}
              scale={scale}
              onDocumentLoadSuccess={onDocumentLoadSuccess}
              onPageChange={changePage}
            />
          ) : (
            <div className="empty-container">
              <div style={{ padding: "100px" }}>{t("file_not_found")}</div>
            </div>
          )}
        </div>
      </main>

      {readerType === "pdf" && (
        <footer className="reader-footer">
          <div className="footer-nav">
            <button
              className="nav-btn"
              onClick={() => changePage(-1)}
              disabled={readerType === "pdf" ? pageNumber <= 1 : false}
            >
              <HiOutlineArrowLeft /> <span>{t("prev")}</span>
            </button>
            <div className="page-badge">{readerType === "pdf" ? pageNumber : "—"}</div>
            <button
              className="nav-btn next-btn"
              onClick={() => changePage(1)}
              disabled={readerType === "pdf" ? pageNumber >= numPages : false}
            >
              <span>{t("next")}</span> <HiOutlineArrowRight />
            </button>
          </div>
          {readerType === "pdf" && (
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
          )}
        </footer>
      )}
    </div>
  );
}
