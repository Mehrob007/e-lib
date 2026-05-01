"use client";
import Image from "next/image";
import Link from "next/link";
import { IoPlayCircleOutline } from "react-icons/io5";
import TypeBadge, { ContentType } from "@/components/elements/badge/TypeBadge";

interface Props {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  type: ContentType;
  showType?: boolean;
}

export default function BookCard({
  id,
  title,
  author,
  date,
  image,
  type,
  showType = true,
}: Props) {

  console.log("type", type);
  
  return (
    <Link href={`/home/catalog/${id}`} className={`book-card ${type === "video" ? "book-card--video" : ""}`}>
      <div className="book-card__image">
        {type === "video" && (
          <div className="video-hover-overlay">
            <IoPlayCircleOutline size={48} color="#fff" />
          </div>
        )}
        {image ? (
          <Image
            src={image.startsWith("http") ? image : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/api$/, "").replace(/\/$/, "")}${image.startsWith("/") ? "" : "/"}${image}`}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              textAlign: "center",
              padding: "8px",
            }}
          >
            {title}
          </div>
        )}
      </div>
      <div className="book-card__content">
        <h3 className="book-card__title">{title}</h3>
        {type !== "video" && <p className="book-card__author">{author}</p>}
        {showType && type === "video" ? <p className="book-card__date">{date}</p> : ""}
        {showType ? <TypeBadge type={type} /> : ""}
      </div>
    </Link>
  );
}
