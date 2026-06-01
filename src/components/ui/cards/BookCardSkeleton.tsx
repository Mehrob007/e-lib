import React from "react";
import "./BookCardSkeleton.css";

interface Props {
  type?: "video" | "book" | "audio";
}

export default function BookCardSkeleton({ type = "book" }: Props) {
  return (
    <div className={`book-card-skeleton ${type === "video" ? "book-card-skeleton--video" : ""}`}>
      <div className="book-card-skeleton__image skeleton-shimmer"></div>
      <div className="book-card-skeleton__content">
        <div className="book-card-skeleton__title skeleton-shimmer"></div>
        <div className="book-card-skeleton__author skeleton-shimmer"></div>
        {type === "video" && <div className="book-card-skeleton__date skeleton-shimmer"></div>}
      </div>
    </div>
  );
}
