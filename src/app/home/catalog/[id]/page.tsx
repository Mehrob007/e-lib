"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import HeaderHome from "@/components/ui/header/HeaderHome";
// import CatalogTopBar from "@/components/ui/nav/CatalogTopBar";
import Loading from "@/components/ui/loading/Loading";
import {
  getContentById,
  getCategoryContentREQ,
  getContentByIdView,
} from "@/api/element";
import { getCategorysREQ } from "@/api/category";
import { ItemT } from "@/types/table";
import { useBranding } from "@/hooks/useBranding";
import Image from "next/image";
import { IoArrowBack, IoPlayCircleOutline } from "react-icons/io5";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import { useTranslation } from "@/hooks/useI18nStore";
import { useAudioStore } from "@/store/useAudioStore";
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
  const [categories, setCategories] = useState<ItemT[]>([]);
  const [loading, setLoading] = useState(true);
  const setGlobalAudio = useAudioStore((s) => s.setAudio);
  const { t, lang, getLocalized } = useTranslation();

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
          year: (details.created as string) || "—",
          description: (details.annotation as string) || t("no_description"),
          image: previewUrlFull,
          fileUrl: fileUrlRaw,
          fileUrlFull: fileUrlProxied,
          path: pathArr,
          categoryId: pathArr.length > 0 ? pathArr[0].id : "",
          mediaType: getMediaType(fileUrlRaw),
        };
        setBook(bookData);

        if (bookData.categoryId) {
          const res = await getCategoryContentREQ(bookData.categoryId, {
            _limit: 4,
            lang,
          });
          const relatedRes =
            (res?.data as unknown as Record<string, unknown>[]) || [];
          if (relatedRes) {
            setRelatedBooks(
              relatedRes
                .filter((b) => b.id !== id)
                .map((item) => ({
                  ...item,
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
              {p.name}
              {index < book.path.length - 1 ? " / " : ""}
            </span>
          ))}
        </div>
      </div>

      <main className="details-content">
        <div className="main-column">
          <section className="cover-section">
            <div
              className={`book-cover ${book.mediaType === "video" ? "video-mode" : ""}`}
            >
              {book.image ? (
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
                  {book.mediaType === "video" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "12px",
                        cursor: "pointer",
                      }}
                      onClick={() => router.push(`/home/catalog/${id}/video`)}
                    >
                      <IoPlayCircleOutline
                        size={80}
                        color="#fff"
                        style={{ opacity: 0.9 }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    textAlign: "center",
                    padding: "20px",
                    borderRadius: "12px",
                    position: "relative",
                  }}
                >
                  {book.title}
                  {book.mediaType === "video" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.1)",
                        borderRadius: "12px",
                        cursor: "pointer",
                      }}
                      onClick={() => router.push(`/home/catalog/${id}/video`)}
                    >
                      <IoPlayCircleOutline size={80} color="#fff" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <h3 className="description-title">{t("description")}</h3>
            <p className="description-text">{book.description}</p>
          </section>

          <section className="info-section">
            <div className="metadata-list">
              <div className="metadata-item">
                <span className="label">{t("name")}</span>
                <span className="value">{book.title}</span>
              </div>
              {/* <div className="metadata-item">
                <span className="label">
                  {book.mediaType === "audio"
                    ? t("author_audio")
                    : book.mediaType === "video"
                      ? t("author_video")
                      : t("author")}
                </span>
                <span className="value">{book.author}</span>
              </div> */}
              <div className="metadata-item">
                <span className="label">{t("language")}</span>
                <span className="value">{book.language}</span>
              </div>
              {/* <div className="metadata-item">
                <span className="label">
                  {book.mediaType === "audio" || book.mediaType === "video"
                    ? t("duration")
                    : t("pages")}
                </span>
                <span className="value">{book.pages}</span>
              </div> */}
              <div className="metadata-item">
                <span className="label">
                  {book.mediaType === "video"
                    ? t("year_release")
                    : t("year_publish")}
                </span>
                <span className="value">{book.year}</span>
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

              {book.mediaType === "video" && (
                <button
                  className="read-button"
                  style={{ color: "#2962ff", borderColor: "#2962ff" }}
                  onClick={() => {
                    router.push(`/home/catalog/${id}/video`);
                  }}
                >
                  {t("watch")}
                </button>
              )}

              <button
                className="download-btn"
                title="Download"
                onClick={() => {
                  if (book.fileUrlFull) {
                    const link = document.createElement("a");
                    link.href = book.fileUrlFull;
                    link.download = `${book.title}.${book.fileUrl.split(".").pop() || "file"}`;
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                <HiOutlineArrowDownTray fontSize={35} />
                {/* <span style={{ fontSize: "14px", marginLeft: "8px", fontWeight: "normal"}}> {t("download")} </span> */}
              </button>
            </div>
          </section>
        </div>

        <aside className="sidebar">
          <div className="sidebar-title">
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
                      <p>{getLocalized(details.author) || "—"}</p>
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

    </div>
  );
}
