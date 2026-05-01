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
import { ItemT } from "@/types/table";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useTranslation } from "@/hooks/useI18nStore";
// import "./catalog.scss";

interface ContentItem {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  type: "text" | "video" | "audio";
}

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
    { id: string; name: string; mime: "audio" | "video" | "text" | "book" }[]
  >([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>("");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("category_id");
  const limit = 10;
  const { lang, t } = useTranslation();

  const fetchRootCategories = useCallback(async () => {
    try {
      const res = (await getCategorysREQ({
        lang,
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
  }, [categoryIdParam, lang]);

  const fetchSubCategories = useCallback(
    async (parentId: string) => {
      try {
        const res = (await getCategorysREQ({
          lang,
          _parent_id: parentId,
        })) as unknown as ItemT[];

        const mapped = res?.map((cat) => ({
          id: cat.id as string,
          name: cat.name as string,
          // mapping logic based on name or metadata, for now defaulting
          mime: cat.mime,
        }));
        setSubCategories(
          (mapped || []) as {
            id: string;
            name: string;
            mime: "audio" | "video" | "text" | "book";
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
    },
    [lang],
  );

  const fetchContent = useCallback(
    async (catId: string) => {
      if (!catId) return;
      setLoading(true);
      try {
        const res = await getCategoryContentREQ(catId, {
          _limit: limit,
          _offset: (page - 1) * limit,
          lang,
        });

        if (res && res.data) {
          const rawData = res.data as Record<string, unknown>[];
          const mapped: ContentItem[] = rawData.map((item) => {
            const details = (item.details as Record<string, string>) || {};
            const contentType = (details.type || "book") as string;
            return {
              id: item.id as string,
              title: (item.title as string) || "—",
              author: details.author || "—",
              date: (item.created as string)?.split("T")?.[0] || "—",
              image: details.preview_url || "",
              type: (contentType === "book"
                ? "text"
                : contentType) as ContentItem["type"],
            };
          });
          setContent(mapped);
          setHasNextPage(mapped.length === limit);
          if (res.total) setTotalItems(res.total);
        }
      } catch (e) {
        console.error(e);
        setContent([]);
      } finally {
        setLoading(false);
      }
    },
    [page, limit, lang],
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
            <select className="sort-select" title="sort-select">
              <option>{t("sorting")}</option>
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
                  <BookCard showType={false} key={book.id} {...book} />
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
                  disabled={!hasNextPage}
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
