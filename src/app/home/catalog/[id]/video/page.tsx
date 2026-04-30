"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import { getContentById, getContentByIdView } from "@/api/element";
import { IoArrowBack } from "react-icons/io5";
import Loading from "@/components/ui/loading/Loading";
import { useTranslation } from "@/hooks/useI18nStore";
import "./video.scss";

export default function VideoPlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchVideo = useCallback(async () => {
    if (!id) return;
    try {
      const [res, viewRes] = await Promise.all([
        getContentById(id as string, { lang }),
        getContentByIdView(id as string, { lang }).catch(() => null),
      ]);

      if (res) {
        setTitle(res.name as string);
        const details = (res.details as Record<string, unknown>) || {};
        const createdDate = (details.created as string) || "";
        setDate(createdDate.split(" ")[0]);

        const fileUrlRaw =
          (viewRes?.file_url as string) || (details.file_url as string) || "";
        const previewUrlRaw =
          (viewRes?.preview_url as string) ||
          (details.preview_url as string) ||
          "";

        if (fileUrlRaw) {
          const fullUrl = fileUrlRaw.startsWith("http")
            ? fileUrlRaw
            : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/api$/, "").replace(/\/$/, "")}${fileUrlRaw.startsWith("/") ? "" : "/"}${fileUrlRaw}`;

          let finalUrl = fullUrl;
          if (fullUrl.includes("ngrok-free.dev")) {
            finalUrl = `/api/mediaProxy?url=${encodeURIComponent(fullUrl)}`;
          }
          setVideoUrl(finalUrl);
        }

        if (previewUrlRaw) {
          const fullPreviewUrl = previewUrlRaw.startsWith("http")
            ? previewUrlRaw
            : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/api$/, "").replace(/\/$/, "")}${previewUrlRaw.startsWith("/") ? "" : "/"}${previewUrlRaw}`;
          setPosterUrl(fullPreviewUrl);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, lang]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  if (loading) {
    return (
      <div className="video-player-page">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#fff",
          }}
        >
          <Loading
            styles={{ width: "60px", height: "60px", borderWidth: "8px" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-page">
      <header className="video-player-header">
        <div className="back-btn-wrapper">
          <button className="back-btn" onClick={() => router.back()}>
            <IoArrowBack /> <span>{t("back")}</span>
          </button>
        </div>
        <h1 className="video-title">{title}</h1>
        <div className="video-speed-control">
          <span>{t("speed")}:</span>
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>
        </div>
      </header>

      <main className="video-main-container">
        <div className="video-frame">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              className="main-video"
              controlsList="nodownload"
              poster={posterUrl}
              onPlay={() => {
                if (videoRef.current) {
                  videoRef.current.playbackRate = playbackRate;
                }
              }}
            >
              {t("video_not_supported")}
            </video>
          ) : (
            <div
              style={{
                padding: "100px",
                color: "#888",
                textAlign: "center",
                width: "100%",
              }}
            >
              {t("video_not_found")}
            </div>
          )}
        </div>

        <div className="video-description-area">
          <h2>{title}</h2>
          <div className="video-meta">
            <span>{date}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
