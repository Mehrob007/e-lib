"use client";
import {
  IoDocumentTextOutline,
  IoPlayCircleOutline,
  IoHeadsetOutline,
} from "react-icons/io5";

export type ContentType = "text" | "video" | "audio";

interface Props {
  type: ContentType;
  label: string;
}

export default function TypeBadge({ type, label }: Props) {
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
      <span>{label}</span>
    </div>
  );
}
