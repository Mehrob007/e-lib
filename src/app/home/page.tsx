"use client";
import HeaderHome from "../../components/ui/header/HeaderHome";
import HeroBanner from "../../components/ui/banner/HeroBanner";
import SectionHeader from "../../components/ui/section/SectionHeader";
import BookCard from "../../components/ui/cards/BookCard";
import { useCallback, useEffect, useState } from "react";
import { getCategorysREQ } from "@/api/category";
import { getElementsMainREQ } from "@/api/element";
import { LANG_GET_ADMIN } from "@/const/def";
import { ItemT } from "@/types/table";
import Loading from "@/components/ui/loading/Loading";

interface BookItem {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  type: "text" | "video" | "audio";
  typeLabel: string;
}

const TYPE_LABELS: Record<string, string> = {
  book: "Матн",
  video: "Видео",
  audio: "Аудио",
};

export default function Page() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<string | null>("");

  const fetchContent = useCallback(async () => {
    setLoading("content");
    try {
      // Get root categories
      const categories = (await getCategorysREQ({
        lang: LANG_GET_ADMIN,
      })) as unknown as ItemT[];

      if (!categories?.length) return;

      // Fetch content from all root categories
      const allContent: BookItem[] = [];
      for (const cat of categories) {
        try {
          const content = (await getElementsMainREQ()) as unknown as ItemT[];
          if (content?.length) {
            const mapped = content.map((item) => {
              const details = (item.details as { [key: string]: string }) || {};
              const contentType = (details.type || "book") as string;
              return {
                id: item.id as string,
                title: (item.name as string) || "—",
                author: details.author || "—",
                date: (item.created as string)?.split("T")?.[0] || "—",
                image: details.preview_url || "",
                type: (contentType === "book"
                  ? "text"
                  : contentType) as BookItem["type"],
                typeLabel: TYPE_LABELS[contentType] || "Матн",
              };
            });
            allContent.push(...mapped);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setBooks(allContent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }, []);

  const getCategory = useCallback(async () => {
    try {
      const res = await getCategorysREQ({
        lang: LANG_GET_ADMIN,
      });
      console.log(res);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    getCategory();
  }, [fetchContent, getCategory]);

  return (
    <div className="home-page">
      <HeaderHome />
      <div className="home-page__content" style={{ padding: "0 40px" }}>
        <HeroBanner />
        <SectionHeader title="ХОНАНДАГОН" onViewAll={() => {}} />
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <Loading
              styles={{ width: "40px", height: "40px", borderWidth: "5px" }}
            />
          </div>
        ) : books.length > 0 ? (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                title={book.title}
                author={book.author}
                date={book.date}
                image={book.image}
                type={book.type}
                typeLabel={book.typeLabel}
              />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>
            Контент пока не добавлен
          </p>
        )}
      </div>
    </div>
  );
}
