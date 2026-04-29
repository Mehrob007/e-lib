"use client";
import Image from "next/image";
import Link from "next/link";
import TypeBadge, { ContentType } from "@/components/elements/badge/TypeBadge";

interface Props {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  type: ContentType;
  typeLabel: string;
  showType?: boolean;
}

export default function BookCard({
  id,
  title,
  author,
  date,
  image,
  type,
  typeLabel,
  showType = true,
}: Props) {
  return (
    <Link href={`/home/catalog/${id}`} className="book-card">
      <div className="book-card__image">
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
        <p className="book-card__author">{author}</p>
        {showType ? <p className="book-card__date">{date}</p> : ""}
        {showType ? <TypeBadge type={type} label={typeLabel} /> : ""}
      </div>
    </Link>
  );
}
