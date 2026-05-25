"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import HeaderHome from "@/components/ui/header/HeaderHome";
// import CatalogTopBar from "@/components/ui/nav/CatalogTopBar";
import Loading from "@/components/ui/loading/Loading";
import {
  getContentById,
  getCategoryContentREQ,
  getContentByIdView,
  getContentDownloadUrlREQ,
} from "@/api/element";
import { getCategorysREQ } from "@/api/category";
import { ItemT } from "@/types/table";
import { useBranding } from "@/hooks/useBranding";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import { useTranslation } from "@/hooks/useI18nStore";
import { useAudioStore } from "@/store/useAudioStore";
import VideoPlayer from "@/components/ui/player/VideoPlayer";
import "./details.scss";

type MediaType = "audio" | "video" | "book";

interface BookDetails {
  id: string;
  title: string;
  author: string;
  language: string;
  pages: string | number;
  year: string | number;
  description: string;
  image: string;
  fileUrl: string;
  fileUrlFull: string;
  path: { id: string; name: string }[];
  categoryId: string;
  mediaType: MediaType;
  parentId: string;
  fileSize?: string;
  format?: string;
}

const getMediaType = (url: string = ""): MediaType => {
  const urlWithoutParams = url.split("?")[0];
  const ext = urlWithoutParams.split(".").pop()?.toLowerCase() || "";
  if (["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext)) {
    return "video";
  }
  if (["mp3", "wav", "m4a", "aac"].includes(ext)) {
    return "audio";
  }
  return "book";
};

export default function BookDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const branding = useBranding();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Record<string, unknown>[]>(
    [],
  );
  const [_, setCategories] = useState<ItemT[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const setGlobalAudio = useAudioStore((s) => s.setAudio);
  const stopAudio = useAudioStore((s) => s.stop);
  const { t, lang, getLocalized } = useTranslation();

  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number | null>(
    null,
  );

  const handleDownload = useCallback(async () => {
    const url = downloadUrl || book?.fileUrlFull;
    if (!url) return;
    try {
      const res = await fetch(url, {
        headers: { "ngrok-skip-browser-warning": "1" },
      });
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = book?.title || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {
      window.open(url, "_blank");
    }
  }, [downloadUrl, book]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCaptchaModal) {
      timer = setTimeout(() => {
        const grecaptcha = (window as any).grecaptcha;
        if (grecaptcha) {
          try {
            const widget = grecaptcha.render("recaptcha-container", {
              sitekey: "6LcyavEsAAAAAF6MnfY8iPTkXYAiykbrGUK7toYQ",
              callback: () => {
                handleDownload();
                setShowCaptchaModal(false);
              },
            });
            setRecaptchaWidgetId(widget);
          } catch (err) {
            console.error("Error rendering reCAPTCHA:", err);
          }
        }
      }, 200);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showCaptchaModal, handleDownload]);

  useEffect(() => {
    if (book?.mediaType === "video") {
      stopAudio();
    }
  }, [book, stopAudio]);

  useEffect(() => {
    setIsExpanded(false);
  }, [id]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [res, viewRes] = await Promise.all([
        getContentById(id as string, { lang }),
        getContentByIdView(id as string, { lang }).catch(() => null),
      ]);

      if (res) {
        const details = (res.details as Record<string, unknown>) || {};
        const pathArr = (res.path as { id: string; name: string }[]) || [];

        const fileUrlRaw =
          (viewRes?.file_url as string) || (details.file_url as string) || "";
        const previewUrlRaw =
          (viewRes?.preview_url as string) ||
          (details.preview_url as string) ||
          "";

        const previewUrlFull = previewUrlRaw
          ? previewUrlRaw.startsWith("http")
            ? previewUrlRaw
            : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/api$/, "").replace(/\/$/, "")}${previewUrlRaw.startsWith("/") ? "" : "/"}${previewUrlRaw}`
          : "";

        let fileUrlProxied = fileUrlRaw;
        if (fileUrlRaw.includes("ngrok-free.dev")) {
          fileUrlProxied = `/api/mediaProxy?url=${encodeURIComponent(fileUrlRaw)}`;
        }

        const langId = (details.lang_id as string | number)?.toString();
        const langLabel =
          langId === "1"
            ? t("lang_tj")
            : langId === "2"
              ? t("lang_ru")
              : langId === "3"
                ? t("lang_en")
                : t("lang_tj");

        const bookData: BookDetails = {
          id: res.id as string,
          title: (res.name as string) || "—",
          author: (details.author as string) || "—",
          language: langLabel,
          pages: (details.pages as string | number) || "—",
          year:
            (details.created as string) ||
            (res.added as string)
              .split("T")[0]
              .split("-")
              .reverse()
              .join(".") ||
            "—",
          description: (details.annotation as string) || t("no_description"),
          image: previewUrlFull,
          fileUrl: fileUrlRaw,
          fileUrlFull: fileUrlProxied,
          parentId: res.parent_id,
          path: pathArr,
          categoryId: pathArr.length > 0 ? pathArr[0].id : "",
          mediaType: getMediaType(fileUrlRaw),
          fileSize: (details.file_size as string) || "—",
          format:
            fileUrlRaw.split("?")[0].split(".").pop()?.toUpperCase() || "—",
        };
        setBook(bookData);

        if (bookData.categoryId) {
          const res = await getCategoryContentREQ(bookData.parentId, {
            _limit: 7,
            lang,
          });
          const relatedRes =
            (res?.data?.items as unknown as Record<string, unknown>[]) || [];
          if (relatedRes) {
            setRelatedBooks(
              relatedRes
                .filter((b) => b.id !== id)
                .map((item) => ({
                  ...item,
                  added: (item.added as string)
                    .split("T")[0]
                    .split("-")
                    // .reverse()
                    .join("."),
                  localizedName: getLocalized(item.title || item.name) || "—",
                })),
            );
          }
        }
      }

      const catRes = (await getCategorysREQ({
        lang,
      })) as unknown as ItemT[];
      if (catRes) setCategories(catRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, lang, t]);

  const fetchDow = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getContentDownloadUrlREQ(id as string);
      if (res?.download_url) {
        setDownloadUrl(res.download_url);
      }
    } catch (e) {
      console.error("fetchDow error:", e);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchDow();
  }, [fetchDow]);

  useEffect(() => {
    if (book?.fileUrlFull) {
      localStorage.setItem("fileUrlFullPDF", book.fileUrlFull);
    }
  }, [book?.fileUrlFull]);

  if (loading) {
    return (
      <div className="book-details-page">
        <HeaderHome logo={branding?.logo as string} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "100px",
          }}
        >
          <Loading
            styles={{ width: "60px", height: "60px", borderWidth: "8px" }}
          />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-page">
        <HeaderHome logo={branding?.logo as string} />
        <p style={{ textAlign: "center", padding: "100px" }}>
          {t("content_not_found")}
        </p>
      </div>
    );
  }

  return (
    <div className="book-details-page">
      <HeaderHome logo={branding?.logo as string} />

      <div className="breadcrumbs-container">
        <button className="back-button" onClick={() => router.back()}>
          <IoArrowBack /> {t("back")}
        </button>
        <div className="breadcrumbs">
          {book.path.map((p, index) => (
            <span key={p.id}>
              {getLocalized(p.name)}
              {index < book.path.length - 1 ? " / " : ""}
            </span>
          ))}
        </div>
      </div>

      <main className="details-content">
        <div
          className={`main-column ${book.mediaType === "video" ? "video-layout" : ""}`}
        >
          <section
            className={`cover-section ${book.mediaType === "video" ? "video-layout" : ""}`}
          >
            <div
              className={`book-cover ${book.mediaType === "video" ? "video-mode" : ""}`}
            >
              {book.mediaType === "video" ? (
                <VideoPlayer
                  src={book.fileUrlFull}
                  title={book.title}
                  poster={book.image}
                  autoPlay
                />
              ) : book.image ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image
                    src={book.image}
                    alt={book.title}
                    fill
                    style={{ objectFit: "cover", borderRadius: "12px" }}
                  />
                </div>
              ) : (
                <div className="book-cover-placeholder">{book.title}</div>
              )}
            </div>
          </section>

          <section className="info-section">
            <div className="metadata-list">
              <div className="metadata-item">
                {book.mediaType !== "video" && (
                  <span className="label">{t("name")}</span>
                )}
                <span className="value">{book.title}</span>
              </div>
              {book.mediaType !== "video" && (
                <>
                  <div className="metadata-item">
                    <span className="label">{t("author")}</span>
                    <span className="value">{book.author}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">{t("language")}</span>
                    <span className="value">{book.language}</span>
                  </div>
                  {book.mediaType === "book" && (
                    <div className="metadata-item">
                      <span className="label">{t("pages")}</span>
                      <span className="value">{book.pages}</span>
                    </div>
                  )}
                </>
              )}
              <div className="metadata-item">
                {" "}
                {book.mediaType === "video" ? (
                  ""
                ) : (
                  <>
                    <span className="label">{t("year_publish")}</span>
                  </>
                )}
                <span className="value">{book.year}</span>
              </div>
              {book.mediaType === "audio" ? (
                <div className="metadata-item">
                  <span className="label">{t("duration")}</span>
                  <span className="value">{book?.pages}</span>
                </div>
              ) : (
                ""
              )}

              <div className="metadata-item">
                <span className="label">{t("format")}</span>
                <span className="value">{book.format}</span>
              </div>

              <div className="metadata-item">
                <span className="label">{t("file_size")}</span>
                <span className="value">{book.fileSize}</span>
              </div>
            </div>

            <div className="actions-block">
              {book.mediaType === "book" && (
                <button
                  className="read-button"
                  onClick={() => {
                    router.push(`/home/catalog/${id}/book`);
                  }}
                >
                  {t("read")}
                </button>
              )}

              {book.mediaType === "audio" && (
                <button
                  className="read-button"
                  style={{ color: "#2962ff", borderColor: "#2962ff" }}
                  onClick={() => {
                    if (book) {
                      setGlobalAudio({
                        id: book.id,
                        src: book.fileUrlFull,
                        title: book.title,
                        author: book.author,
                        image: book.image,
                      });
                    }
                  }}
                >
                  {t("listen")}
                </button>
              )}

              {book.mediaType !== "video" && (
                <button
                  className="download-btn"
                  title="Download"
                  onClick={() => {
                    setShowCaptchaModal(true);
                  }}
                >
                  <HiOutlineArrowDownTray fontSize={35} />
                </button>
              )}
            </div>
          </section>

          {book.mediaType !== "video" && (
            <section className="description-section">
              <h3 className="description-title">{t("description")}</h3>
              <p className="description-text">
                {isExpanded || book.description.length <= 300
                  ? book.description
                  : `${book.description.slice(0, 300)}...`}
              </p>
              {book.description.length > 300 && (
                <button
                  className="read-more-btn"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded
                    ? lang === "tj"
                      ? "Камтар нишон додан"
                      : lang === "en"
                        ? "Show less"
                        : "Показать меньше"
                    : lang === "tj"
                      ? "Пурра хондан"
                      : lang === "en"
                        ? "Read more"
                        : "Читать полностью"}
                </button>
              )}
            </section>
          )}
        </div>

        <aside className="sidebar">
          <div
            className="sidebar-title clickable"
            onClick={() =>
              router.push(`/home/catalog?category_id=${book.categoryId}`)
            }
          >
            {book.mediaType === "audio"
              ? t("other_audios")
              : book.mediaType === "video"
                ? t("other_videos")
                : t("other_books")}
          </div>
          <div className="related-list">
            {relatedBooks.length > 0 ? (
              relatedBooks.map((item) => {
                const details = (item.details as Record<string, unknown>) || {};
                const img = (details.preview_url as string) || "";
                return (
                  <div
                    key={item.id as string}
                    className="side-book-card"
                    onClick={() =>
                      router.push(`/home/catalog/${item.id as string}`)
                    }
                  >
                    <div className="side-cover">
                      {img ? (
                        <Image
                          src={
                            img.startsWith("http")
                              ? img
                              : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/api$/, "").replace(/\/$/, "")}${img.startsWith("/") ? "" : "/"}${img}`
                          }
                          alt={(item.name as string) || "side-cover"}
                          fill
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#eee",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                    </div>
                    <div className="side-info">
                      <h4>{item.localizedName as string}</h4>
                      <p>
                        {getLocalized(details.author) ||
                          getLocalized(details.created) ||
                          getLocalized(item.added) ||
                          "—"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#aaa", fontSize: "14px" }}>
                {t("not_found")}
              </p>
            )}
          </div>
        </aside>
      </main>

      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
      />

      {showCaptchaModal && (
        <div className="captcha-modal-overlay">
          <div className="captcha-modal">
            <div className="captcha-modal-header">
              <h3>
                {lang === "tj"
                  ? "Тасдиқи зеркашӣ"
                  : lang === "en"
                    ? "Download Confirmation"
                    : "Подтверждение скачивания"}
              </h3>
              <button
                className="captcha-close-btn"
                onClick={() => setShowCaptchaModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="captcha-modal-body">
              <p>
                {lang === "tj"
                  ? "Лутфан, барои оғози зеркашии файл капчаро гузаред."
                  : lang === "en"
                    ? "Please complete the captcha to start downloading the file."
                    : "Пожалуйста, пройдите проверку капчи, чтобы начать скачивание файла."}
              </p>
              <div id="recaptcha-container" className="recaptcha-container">
                {!(
                  typeof window !== "undefined" && (window as any).grecaptcha
                ) && (
                  <div className="captcha-loading">
                    {lang === "tj"
                      ? "Капча боргирӣ шуда истодааст..."
                      : lang === "en"
                        ? "Loading captcha..."
                        : "Загрузка капчи..."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
