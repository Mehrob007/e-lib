"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getContentById, getCategoryContentREQ, getContentByIdView } from "@/api/element";
import { getCategorysREQ } from "@/api/category";
import { ItemT } from "@/types/table";
import { useBranding } from "@/hooks/useBranding";
import HeaderHome from "@/components/ui/header/HeaderHome";
import CatalogTopBar from "@/components/ui/nav/CatalogTopBar";
import { IoArrowBack } from "react-icons/io5";
import Loading from "@/components/ui/loading/Loading";
import Image from "next/image";
import { useTranslation } from "@/hooks/useI18nStore";
import "./video.scss";

interface VideoDetails {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
  image: string;
  path: { id: string; name: string }[];
  categoryId: string;
}

export default function VideoPlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const branding = useBranding();
  const { t, lang } = useTranslation();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<ItemT[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch video details
      const [res, viewRes] = await Promise.all([
        getContentById(id as string),
        getContentByIdView(id as string).catch(() => null)
      ]);

      if (res) {
        const details = (res.details as Record<string, unknown>) || {};
        const pathArr = (res.path as { id: string; name: string }[]) || [];
        
        const fileUrlRaw = (viewRes?.file_url as string) || (details.file_url as string) || "";
        const previewUrlRaw = (viewRes?.preview_url as string) || (details.preview_url as string) || "";

        const fullUrl = fileUrlRaw
          ? fileUrlRaw.startsWith("http")
            ? fileUrlRaw
            : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/$/, "")}${fileUrlRaw.startsWith("/") ? "" : "/"}${fileUrlRaw}`
          : "";

        let finalUrl = fullUrl;
        if (fullUrl.includes("ngrok-free.dev")) {
          finalUrl = `/api/mediaProxy?url=${encodeURIComponent(fullUrl)}`;
        }

        const videoData: VideoDetails = {
          id: res.id as string,
          title: (res.name as string) || "—",
          date: (details.created as string) || "—",
          image: previewUrlRaw,
          fileUrl: finalUrl,
          path: pathArr,
          categoryId: pathArr.length > 0 ? pathArr[0].id : "",
        };
        setVideo(videoData);

        // Fetch related videos from the same category
        if (videoData.categoryId) {
          const res = await getCategoryContentREQ(videoData.categoryId, {
            _limit: 6,
          });
          const relatedRes = (res?.data as unknown as Record<string, unknown>[]) || [];
          if (relatedRes) {
            setRelatedVideos(relatedRes.filter((b) => b.id !== id));
          }
        }
      }

      // Fetch root categories for TopBar
      const catRes = (await getCategorysREQ({ lang })) as unknown as ItemT[];
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
      <div className="video-player-page">
        <HeaderHome logo={branding?.logo as string} />
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
          <Loading styles={{ width: "60px", height: "60px", borderWidth: "8px" }} />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-player-page">
        <HeaderHome logo={branding?.logo as string} />
        <p style={{ textAlign: "center", padding: "100px" }}>{t("content_not_found")}</p>
      </div>
    );
  }

  return (
    <div className="video-player-page">
      <HeaderHome logo={branding?.logo as string} />
      
      <CatalogTopBar 
        categories={categories} 
        activeId={video.categoryId} 
        onSelect={(catId) => router.push(`/home/catalog?category_id=${catId}`)} 
      />

      <div className="video-content-container">
        <div className="breadcrumbs-row">
          <button className="back-btn" onClick={() => router.back()}>
            <IoArrowBack /> {t("back")}
          </button>
          <div className="breadcrumbs">
            {video.path.map((p, index) => (
              <span key={p.id}>
                {p.name}
                {index < video.path.length - 1 ? " / " : ""}
              </span>
            ))}
          </div>
        </div>

        <div className="video-layout">
          <main className="main-content">
            <div className="video-wrapper">
              {video.fileUrl ? (
                <video 
                  src={video.fileUrl} 
                  controls 
                  autoPlay 
                  poster={video.image ? (video.image.startsWith("http") ? video.image : `/${video.image}`) : undefined}
                >
                  {t("browser_not_support_video") || "Ваш браузер не поддерживает видео."}
                </video>
              ) : (
                <div style={{ padding: "100px", textAlign: "center" }}>{t("not_found")}</div>
              )}
            </div>

            <div className="video-info">
              <h1>{video.title}</h1>
              <span className="date">{video.date}</span>
            </div>
          </main>

          <aside className="sidebar">
            <div className="sidebar-title">{t("other_videos")}</div>
            <div className="related-list">
              {relatedVideos.length > 0 ? (
                relatedVideos.map((item) => {
                  const details = (item.details as Record<string, unknown>) || {};
                  const img = (details.preview_url as string) || "";
                  return (
                    <div
                      key={item.id as string}
                      className="sidebar-video-card"
                      onClick={() => router.push(`/home/catalog/${item.id as string}/video`)}
                    >
                      <div className="thumb">
                        {img ? (
                          <Image
                            src={img.startsWith("http") ? img : `/${img}`}
                            alt={(item.name as string) || "thumb"}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#eee" }} />
                        )}
                      </div>
                      <div className="info">
                        <h4>{item.name as string}</h4>
                        <p>{(details.created as string) || "—"}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "#aaa", fontSize: "14px" }}>{t("not_found")}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
