"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeaderHome from "@/components/ui/header/HeaderHome";
import CatalogTopBar from "@/components/ui/nav/CatalogTopBar";
import CatalogSideNav from "@/components/ui/nav/CatalogSideNav";
import BookCard from "@/components/ui/cards/BookCard";
import Loading from "@/components/ui/loading/Loading";
import { getCategorysREQ } from "@/api/category";
import { getCategoryContentREQ, searchElementsREQ } from "@/api/element";
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
    {
      id: string;
      name: string;
      mime: "audio" | "video" | "text" | "book";
      hasChildren?: boolean;
    }[]
  >([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("catalog_active_category_id") || "";
    }
    return "";
  });
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("catalog_active_sub_category_id") || "";
    }
    return "";
  });
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [sortField, setSortField] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("category_id");
  const searchQuery = searchParams.get("search");
  const limit = 10;
  const { lang, t, getLocalized } = useTranslation();

  // Save selection to localStorage
  useEffect(() => {
    if (activeCategoryId) {
      localStorage.setItem("catalog_active_category_id", activeCategoryId);
    }
  }, [activeCategoryId]);

  useEffect(() => {
    if (activeSubCategoryId) {
      localStorage.setItem(
        "catalog_active_sub_category_id",
        activeSubCategoryId,
      );
    } else {
      localStorage.removeItem("catalog_active_sub_category_id");
    }
  }, [activeSubCategoryId]);

  const fetchRootCategories = useCallback(async () => {
    try {
      const res = (await getCategorysREQ({
        lang,
      })) as unknown as ItemT[];
      if (res?.length) {
        setCategories(res);
        if (typeof window !== "undefined") {
          if (!localStorage.getItem("catalog_active_category_id")) {
            if (categoryIdParam) {
              setActiveCategoryId(categoryIdParam);
            } else {
              setActiveCategoryId((prev) => prev || (res[0].id as string));
            }
          }
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
          name: getLocalized(cat.name),
          // mapping logic based on name or metadata, for now defaulting
          mime: cat.mime,
          hasChildren: cat.has_children as boolean,
        }));
        setSubCategories(
          (mapped || []) as {
            id: string;
            name: string;
            mime: "audio" | "video" | "text" | "book";
            hasChildren?: boolean;
          }[],
        );

        // Only set default if no subcategory is currently active or if the active one isn't in the new list
        if (mapped?.length) {
          const isCurrentValid = mapped.some(
            (m) => m.id === activeSubCategoryId,
          );
          if (!activeSubCategoryId || !isCurrentValid) {
            // If we have a saved ID but it's not in this branch, we don't reset to [0]
            // unless we specifically want to auto-select the first one of the NEW branch.
            // But if it's just a lang change, isCurrentValid will be true.
            if (!activeSubCategoryId) {
              setActiveSubCategoryId(mapped[0].id);
            }
          }
        } else {
          setActiveSubCategoryId("");
        }
      } catch (e) {
        console.error(e);
      }
    },
    [lang, getLocalized, activeSubCategoryId],
  );
  const fetchContent = useCallback(
    async (catId: string) => {
      if (!catId && !searchQuery) return;
      setLoading(true);
      try {
        let res;
        if (searchQuery) {
          const searchRes = await searchElementsREQ(searchQuery);
          res = { data: searchRes, total: searchRes?.length || 0 };
        } else {
          res = await getCategoryContentREQ(catId, {
            _limit: limit,
            _offset: (page - 1) * limit,
            lang,
            sort_field: sortField,
            sort_order: sortOrder,
          });
        }

        if (res && res.data) {
          const rawData = res.data as Record<string, unknown>[];
          const mapped: ContentItem[] = rawData.map((item) => {
            const details = (item.details as Record<string, string>) || {};
            const contentType = (details.type || "book") as string;
            return {
              id: item.id as string,
              title: getLocalized(item.title || item.name) || "—",
              author: getLocalized(details.author) || "—",
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
    [page, limit, lang, sortField, sortOrder, searchQuery],
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
    if (searchQuery || targetId) {
      setContent([]);
      fetchContent(targetId);
    } else {
      setContent([]);
    }
  }, [activeCategoryId, activeSubCategoryId, fetchContent, searchQuery]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [field, order] = val.split(":");
    setSortField(field);
    setSortOrder(order as "asc" | "desc");
    setPage(1);
  };

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const activeSubCategory = subCategories.find(
    (s) => s.id === activeSubCategoryId,
  );

  const displayTitle = searchQuery
    ? `${t("search_results")}: ${searchQuery}`
    : activeSubCategory
      ? activeSubCategory.name
      : activeCategory
        ? getLocalized(activeCategory.name)
        : "";

  const currentMime = activeSubCategory?.mime || "book";

  console.log("activeCategoryId", activeCategoryId);

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
          <div className="catalog-header-area">
            <h1 className="catalog-title">{displayTitle}</h1>
            <div className="catalog-controls">
              <label htmlFor="sort-select" className="sort-select">
                <select
                  className=""
                  title="sort-select"
                  id="sort-select"
                  value={`${sortField}:${sortOrder}`}
                  onChange={handleSortChange}
                >
                  <option value="title:asc">{t("by_title")}</option>
                  {currentMime === "video" ? (
                    <>
                      <option value="created:asc">{t("by_date")}</option>
                      <option value="added:desc">{t("by_added")}</option>
                    </>
                  ) : (
                    <option value="author:asc">{t("by_author")}</option>
                  )}
                </select>
              </label>
            </div>
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
              {content.length > 0 ? (
                <div className="book-grid">
                  {content.map((book) => (
                    <BookCard showType={false} key={book.id} {...book} />
                  ))}
                </div>
              ) : (
                <div className="no-content-message">
                  {t("no_elements_available")}
                </div>
              )}

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
