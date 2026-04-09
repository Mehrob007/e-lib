"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import HeaderHome from "@/components/ui/header/HeaderHome";
// import CatalogTopBar from "@/components/ui/nav/CatalogTopBar";
import Loading from "@/components/ui/loading/Loading";
import { getContentById, getCategoryContentREQ, getContentByIdView } from "@/api/element";
import { getCategorysREQ } from "@/api/category";
import { ItemT } from "@/types/table";
import { useBranding } from "@/hooks/useBranding";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import AudioPlayer from "@/components/ui/player/AudioPlayer";
import { useTranslation } from "@/hooks/useI18nStore";
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
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const { t, lang } = useTranslation();

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch book details
      const [res, viewRes] = await Promise.all([
        getContentById(id as string),
        getContentByIdView(id as string).catch(() => null)
      ]);

      if (res) {
        const details = (res.details as Record<string, unknown>) || {};
        const pathArr = (res.path as { id: string; name: string }[]) || [];
        
        const fileUrlRaw = (viewRes?.file_url as string) || (details.file_url as string) || "";
        const previewUrlRaw = (viewRes?.preview_url as string) || (details.preview_url as string) || "";

        const fileUrlFull = fileUrlRaw
          ? fileUrlRaw.startsWith("http")
            ? fileUrlRaw
            : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/$/, "")}${fileUrlRaw.startsWith("/") ? "" : "/"}${fileUrlRaw}`
          : "";

        let fileUrlProxied = fileUrlFull;
        if (fileUrlFull.includes("ngrok-free.dev")) {
          fileUrlProxied = `/api/mediaProxy?url=${encodeURIComponent(fileUrlFull)}`;
        }

        const bookData: BookDetails = {
          id: res.id as string,
          title: (res.name as string) || "—",
          author: (details.author as string) || "—",
          language: (details.lang_id as string) === "1" ? "Тоҷикӣ" : "Тоҷикӣ",
          pages: (details.pages as string | number) || "—",
          year: (details.created as string) || "—",
          description:
            (details.annotation as string) || "Тавсиф ҳоло илова нашудааст.",
          image: previewUrlRaw,
          fileUrl: fileUrlRaw,
          fileUrlFull: fileUrlProxied,
          path: pathArr,
          categoryId: pathArr.length > 0 ? pathArr[0].id : "",
          mediaType: getMediaType(fileUrlRaw),
        };
        setBook(bookData);

        // Fetch related books from the same category
        if (bookData.categoryId) {
          const res = await getCategoryContentREQ(bookData.categoryId, {
            _limit: 4,
          });
          const relatedRes =
            (res?.data as unknown as Record<string, unknown>[]) || [];
          if (relatedRes) {
            setRelatedBooks(relatedRes.filter((b) => b.id !== id));
          }
        }
      }

      // Fetch root categories for TopBar
      const catRes = (await getCategorysREQ({
        lang,
      })) as unknown as ItemT[];
      if (catRes) setCategories(catRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, lang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            <div className={`book-cover ${book.mediaType === 'video' ? 'video-mode' : ''}`}>
              {book.mediaType === "video" ? (
                <video
                  src={book.fileUrlFull}
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#000",
                    borderRadius: "12px",
                  }}
                  poster={
                    book.image
                      ? book.image.startsWith("http")
                        ? book.image
                        : `/${book.image}`
                      : undefined
                  }
                />
              ) : book.image ? (
                <Image
                  src={
                    book.image.startsWith("http")
                      ? book.image
                      : `/${book.image}`
                  }
                  alt={book.title}
                  fill
                  style={{ objectFit: "cover", borderRadius: "12px" }}
                />
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
                  }}
                >
                  {book.title}
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
              <div className="metadata-item">
                <span className="label">
                  {book.mediaType === "audio"
                    ? t("author_audio")
                    : book.mediaType === "video"
                      ? t("author_video")
                      : t("author")}
                </span>
                <span className="value">{book.author}</span>
              </div>
              <div className="metadata-item">
                <span className="label">{t("language")}</span>
                <span className="value">{book.language}</span>
              </div>
              <div className="metadata-item">
                <span className="label">
                  {book.mediaType === "audio" || book.mediaType === "video"
                    ? t("duration")
                    : t("pages")}
                </span>
                <span className="value">{book.pages}</span>
              </div>
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
                  onClick={() => setShowAudioPlayer(true)}
                >
                  {t("listen")}
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
                <HiOutlineArrowDownTray /> 
                <span style={{ fontSize: "14px", marginLeft: "8px", fontWeight: "normal"}}> {t("download")} </span>
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
                          src={img.startsWith("http") ? img : `/${img}`}
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
                      <h4>{item.name as string}</h4>
                      <p>{(details.author as string) || "—"}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#aaa", fontSize: "14px" }}>{t("not_found")}</p>
            )}
          </div>
        </aside>
      </main>

      {showAudioPlayer && book.mediaType === "audio" && (
        <AudioPlayer
          src={book.fileUrlFull}
          title={book.title}
          author={book.author}
          image={book.image}
          onClose={() => setShowAudioPlayer(false)}
        />
      )}
    </div>
  );
}
