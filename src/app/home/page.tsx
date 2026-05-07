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
import { getSwiper } from "@/api/swiper";

import { useTranslation } from "@/hooks/useI18nStore";

interface BookItem {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  type: "text" | "video" | "audio";
  category_name: string;
  category_id: string;
}

export default function Page() {
  const router = useRouter();
  const { t, lang, getLocalized } = useTranslation();
  const [groupedBooks, setGroupedBooks] = useState<Record<string, BookItem[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const branding = useBranding();

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const content = (await getElementsMainREQ({ lang })) as unknown as Record<
        string,
        unknown
      >[];
      if (content?.length) {
        const groups: Record<string, BookItem[]> = {};

        content.forEach((item) => {
          const contentType = (item.type || "book") as string;
          const book: BookItem = {
            id: (item.content_id as string) || (item.id as string) || "",
            title: getLocalized(item.title || item.name) || "—",
            author: getLocalized(item.author) || "—",
            date: (item.created as string) || "—",
            image: (item.preview_url as string) || "",
            category_name: getLocalized(item.category_name) || t("other"),
            category_id: (item.category_id as string) || "",
            type: (contentType === "book"
              ? "text"
              : contentType) as BookItem["type"],
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
  }, [lang, t]);

  const fetchSwiper = useCallback(async () => {
    try {
      const res = await getSwiper({ _limit: 10, _offset: 0, lang });
      if (res) {
        setBanners(res as any[]);
      }
    } catch (e) {
      console.error("Error fetching swiper:", e);
    }
  }, [lang]);

  useEffect(() => {
    fetchContent();
    fetchSwiper();
  }, [fetchContent, fetchSwiper]);

  return (
    <div className="home-page">
      <HeaderHome logo={branding?.logo as string} />
      <div className="home-page__content" style={{ padding: "0 40px" }}>
        <HeroBanner banners={banners} />
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
              <div className="book-grid home-book-grid">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    date={book.date}
                    image={book.image}
                    type={book.type}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>
            {t("no_content")}
          </p>
        )}
      </div>
    </div>
  );
}
