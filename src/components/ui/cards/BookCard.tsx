"use client";
import Image from "next/image";
import TypeBadge, { ContentType } from "@/components/elements/badge/TypeBadge";

interface Props {
  title: string;
  author: string;
  date: string;
  image: string;
  type: ContentType;
  typeLabel: string;
}

export default function BookCard({
  title,
  author,
  date,
  image,
  type,
  typeLabel,
}: Props) {
  return (
    <div className="book-card">
      <div className="book-card__image">
        <Image src={image} alt={title} fill style={{ objectFit: "cover" }} />
      </div>
      <div className="book-card__content">
        <h3 className="book-card__title">{title}</h3>
        <p className="book-card__author">{author}</p>
        <p className="book-card__date">{date}</p>
        <TypeBadge type={type} label={typeLabel} />
      </div>
    </div>
  );
}
