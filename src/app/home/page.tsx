"use client";
import HeaderHome from "../../components/ui/header/HeaderHome";
import HeroBanner from "../../components/ui/banner/HeroBanner";
import SectionHeader from "../../components/ui/section/SectionHeader";
import BookCard from "../../components/ui/cards/BookCard";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getElementsMainREQ } from "@/api/element";
import Loading from "@/components/ui/loading/Loading";
import { useBranding } from "@/hooks/useBranding";

interface BookItem {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  type: "text" | "video" | "audio";
  typeLabel: string;
  category_name: string;
  category_id: string;
}

const TYPE_LABELS: Record<string, string> = {
  book: "Матн",
  video: "Видео",
  audio: "Аудио",
};

export default function Page() {
  const router = useRouter();
  const [groupedBooks, setGroupedBooks] = useState<Record<string, BookItem[]>>(
    {},
  );
  const [loading, setLoading] = useState<boolean>(false);
  const branding = useBranding();

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const content = (await getElementsMainREQ()) as unknown as Record<
        string,
        unknown
      >[];
      if (content?.length) {
        const groups: Record<string, BookItem[]> = {};

        content.forEach((item) => {
          const contentType = (item.type || "book") as string;
          const book: BookItem = {
            id: (item.content_id as string) || (item.id as string) || "",
            title: (item.title as string) || (item.name as string) || "—",
            author: (item.author as string) || "—",
            date: (item.created as string) || "—",
            image: (item.preview_url as string) || "",
            category_name: (item.category_name as string) || "Другое",
            category_id: (item.category_id as string) || "",
            type: (contentType === "book"
              ? "text"
              : contentType) as BookItem["type"],
            typeLabel: TYPE_LABELS[contentType] || "Матн",
          };

          if (!groups[book.category_name]) {
            groups[book.category_name] = [];
          }
          groups[book.category_name].push(book);
        });

        setGroupedBooks(groups);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="home-page">
      <HeaderHome logo={branding?.logo as string} />
      <div className="home-page__content" style={{ padding: "0 40px" }}>
        <HeroBanner />
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
        ) : Object.keys(groupedBooks).length > 0 ? (
          Object.entries(groupedBooks).map(([categoryName, books]) => (
            <div
              key={categoryName}
              className="content-home"
              style={{ marginBottom: "40px" }}
            >
              <SectionHeader
                title={categoryName}
                onViewAll={() =>
                  router.push(
                    `/home/catalog?category_id=${books[0].category_id}`,
                  )
                }
              />
              <div className="book-grid">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    date={book.date}
                    image={book.image}
                    type={book.type}
                    typeLabel={book.typeLabel}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>
            Контент пока не добавлен
          </p>
        )}
      </div>
    </div>
  );
}
