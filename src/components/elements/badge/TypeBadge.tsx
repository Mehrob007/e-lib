"use client";
import { useTranslation } from "@/hooks/useI18nStore";
import {
  IoDocumentTextOutline,
  IoPlayCircleOutline,
  IoHeadsetOutline,
} from "react-icons/io5";

export type ContentType = "text" | "video" | "audio";

interface Props {
  type: ContentType;
}

export default function TypeBadge({ type }: Props) {
  const { t } = useTranslation();
  const getIcon = () => {
    switch (type) {
      case "text":
        return <IoDocumentTextOutline />;
      case "video":
        return <IoPlayCircleOutline />;
      case "audio":
        return <IoHeadsetOutline />;
      default:
        return null;
    }
  };

  return (
    <div className={`type-badge type-badge--${type}`}>
      {getIcon()}
      <span>{t(type)}</span>
    </div>
  );
}
