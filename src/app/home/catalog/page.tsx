"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeaderHome from "@/components/ui/header/HeaderHome";
import CatalogTopBar from "@/components/ui/nav/CatalogTopBar";
import CatalogSideNav from "@/components/ui/nav/CatalogSideNav";
import BookCard from "@/components/ui/cards/BookCard";
import Loading from "@/components/ui/loading/Loading";
import { getCategorysREQ } from "@/api/category";
import { getCategoryContentREQ } from "@/api/element";
import { LANG_GET_ADMIN } from "@/const/def";
import { ItemT } from "@/types/table";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
// import "./catalog.scss";

interface ContentItem {
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

export default function CatalogPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const [categories, setCategories] = useState<ItemT[]>([]);
  const [subCategories, setSubCategories] = useState<
    { id: string; name: string; type: "audio" | "video" | "text" }[]
  >([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>("");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("category_id");
  const limit = 10;

  const fetchRootCategories = useCallback(async () => {
    try {
      const res = (await getCategorysREQ({
        lang: LANG_GET_ADMIN,
      })) as unknown as ItemT[];
      if (res?.length) {
        setCategories(res);
        if (categoryIdParam) {
          setActiveCategoryId(categoryIdParam);
        } else {
          setActiveCategoryId(res[0].id as string);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [categoryIdParam]);

  const fetchSubCategories = useCallback(async (parentId: string) => {
    try {
      const res = (await getCategorysREQ({
        lang: LANG_GET_ADMIN,
        _parent_id: parentId,
      })) as unknown as ItemT[];

      const mapped = res?.map((cat) => ({
        id: cat.id as string,
        name: cat.name as string,
        // mapping logic based on name or metadata, for now defaulting
        type: (cat.name as string).toLowerCase().includes("видео")
          ? "video"
          : (cat.name as string).toLowerCase().includes("аудио")
            ? "audio"
            : "text",
      }));
      setSubCategories(
        (mapped || []) as {
          id: string;
          name: string;
          type: "audio" | "video" | "text";
        }[],
      );
      if (mapped?.length) {
        setActiveSubCategoryId(mapped[0].id);
      } else {
        setActiveSubCategoryId("");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchContent = useCallback(
    async (catId: string) => {
      if (!catId) return;
      setLoading(true);
      try {
        const res = await getCategoryContentREQ(catId, {
          _limit: limit,
          _offset: (page - 1) * limit,
        });

        if (res) {
          const mapped = (res as unknown as any[]).map((item) => {
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
                : contentType) as ContentItem["type"],
              typeLabel: TYPE_LABELS[contentType] || "Матн",
            };
          });
          setContent(mapped);
          setTotalItems(2830); // Placeholder total count based on screenshot (283 * 10)
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchRootCategories();
  }, [fetchRootCategories]);

  useEffect(() => {
    if (activeCategoryId) {
      fetchSubCategories(activeCategoryId);
    }
  }, [activeCategoryId, fetchSubCategories]);

  useEffect(() => {
    const targetId = activeSubCategoryId || activeCategoryId;
    if (targetId) {
      fetchContent(targetId);
    }
  }, [activeCategoryId, activeSubCategoryId, fetchContent]);

  return (
    <div className="home-page catalog-page">
      <HeaderHome />
      <CatalogTopBar
        categories={categories}
        activeId={activeCategoryId}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setPage(1);
        }}
      />

      <div className="catalog-page__content">
        <CatalogSideNav
          subCategories={subCategories}
          activeId={activeSubCategoryId}
          onSelect={(id) => {
            setActiveSubCategoryId(id);
            setPage(1);
          }}
        />

        <main className="catalog-page__main">
          <div className="catalog-controls">
            <select className="sort-select">
              <option>Мураттабкунӣ</option>
            </select>
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "100px",
              }}
            >
              <Loading
                styles={{ width: "60px", height: "60px", borderWidth: "8px" }}
              />
            </div>
          ) : (
            <>
              <div className="book-grid">
                {content.map((book) => (
                  <BookCard key={book.id} {...book} />
                ))}
              </div>

              <div className="pagination">
                <button
                  className="pagination__btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <LuChevronLeft size={24} />
                </button>
                <span className="pagination__info">
                  {page} / {Math.ceil(totalItems / limit)}
                </span>
                <button
                  className="pagination__btn"
                  disabled={page * limit >= totalItems}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <LuChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
