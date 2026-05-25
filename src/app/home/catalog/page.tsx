"use client";

import { useCallback, useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, t, getLocalized } = useTranslation();

  const categoryIdParam = searchParams.get("category_id");
  const subCategoryIdParam = searchParams.get("sub_category_id");
  const searchQuery = searchParams.get("search");

  const [categories, setCategories] = useState<ItemT[]>([]);
  const [subCategories, setSubCategories] = useState<
    {
      id: string;
      name: string;
      mime: "audio" | "video" | "text" | "book";
      hasChildren?: boolean;
    }[]
  >([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [sortField, setSortField] = useState<string>(
    searchParams.get("sort_field") || "title",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sort_order") as "asc" | "desc") || "asc",
  );

  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>("");
  const [subHistory, setSubHistory] = useState<Record<string, string>>({});

  const limit = 12;
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const savedHistory = localStorage.getItem("catalog_sub_history");
    let history: Record<string, string> = {};
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
        setSubHistory(history);
      } catch (e) {}
    }

    if (searchQuery) {
      setActiveCategoryId("");
      setActiveSubCategoryId("");
    } else {
      const initialCatId =
        categoryIdParam ||
        localStorage.getItem("catalog_active_category_id") ||
        "";
      const initialSubId = subCategoryIdParam || history[initialCatId] || "";

      if (initialCatId) setActiveCategoryId(initialCatId);
      if (initialSubId) setActiveSubCategoryId(initialSubId);
    }
  }, []);

  useEffect(() => {
    const sField = searchParams.get("sort_field");
    const sOrder = searchParams.get("sort_order");
    if (sField) setSortField(sField);
    if (sOrder) setSortOrder(sOrder as "asc" | "desc");

    if (searchQuery) {
      setActiveCategoryId("");
      setActiveSubCategoryId("");
    } else {
      if (categoryIdParam) setActiveCategoryId(categoryIdParam);
      if (subCategoryIdParam !== null)
        setActiveSubCategoryId(subCategoryIdParam);
    }
  }, [categoryIdParam, subCategoryIdParam, searchQuery, searchParams]);

  const fetchRootCategories = useCallback(async () => {
    try {
      const res = (await getCategorysREQ({ lang })) as unknown as ItemT[];
      if (res?.length) {
        setCategories(res);
        if (!activeCategoryId && !searchQuery && !categoryIdParam) {
          const firstId = res[0].id as string;
          setActiveCategoryId(firstId);
          localStorage.setItem("catalog_active_category_id", firstId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [lang, activeCategoryId, searchQuery, categoryIdParam]);

  useEffect(() => {
    fetchRootCategories();
  }, [fetchRootCategories]);

  const fetchSubCategories = useCallback(
    async (parentId: string) => {
      if (!parentId) {
        setSubCategories([]);
        return;
      }
      try {
        const res = (await getCategorysREQ({
          lang,
          _parent_id: parentId,
        })) as unknown as ItemT[];
        const mapped = (res || []).map((cat) => ({
          id: cat.id as string,
          name: getLocalized(cat.name),
          mime: cat.mime,
          hasChildren: cat.has_children as boolean,
        }));
        setSubCategories(mapped as any[]);
        if (mapped.length > 0 && !activeSubCategoryId && !subCategoryIdParam) {
          const histSubId = subHistory[parentId];
          if (histSubId && mapped.some((s) => s.id === histSubId)) {
            setActiveSubCategoryId(histSubId);
          } else if (!histSubId) {
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    [lang, getLocalized, activeSubCategoryId, subHistory, subCategoryIdParam],
  );
  useEffect(() => {
    if (activeCategoryId) {
      fetchSubCategories(activeCategoryId);
    }
  }, [activeCategoryId, fetchSubCategories]);

  const fetchContent = useCallback(
    async (catId: string) => {
      if (!catId && !searchQuery) return;
      setLoading(true);
      try {
        let res;
        if (searchQuery) {
          const searchRes = await searchElementsREQ(searchQuery, {
            sort_field: sortField,
            sort_order: sortOrder,
            lang,
          });
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
          const rawData =
            res?.data?.items || (res?.data as Record<string, unknown>[]);
          const mapped: ContentItem[] = (rawData as any[]).map((item: any) => {
            const details = (item.details as Record<string, string>) || {};
            const contentType = (details.type || "book") as string;
            return {
              id: item.id as string,
              title: getLocalized(item.title || item.name) || "—",
              author: getLocalized(details.author) || "—",
              date:
                (item.created as string)?.split("T")?.[0] ||
                (item.added as string).split("T")[0].split("-").join(".") ||
                // (details.added as string)?.split("T")?.[0].slice("-").join(".") ||
                (details.created as string)?.split("T")?.[0] ||
                "—",
              image: details.preview_url || "",
              type: (contentType === "book"
                ? "text"
                : contentType) as ContentItem["type"],
            };
          });
          setContent(mapped);
          setHasNextPage(mapped.length === limit);
          setTotalItems(res.data.total_items || 0);
        }
      } catch (e) {
        console.error(e);
        setContent([]);
      } finally {
        setLoading(false);
      }
    },
    [page, limit, lang, sortField, sortOrder, searchQuery, getLocalized],
  );

  useEffect(() => {
    const targetId = activeSubCategoryId || activeCategoryId;
    if (searchQuery || targetId) {
      fetchContent(targetId);
    } else {
      setContent([]);
    }
  }, [activeCategoryId, activeSubCategoryId, fetchContent, searchQuery]);

  const updateUrl = useCallback(
    (
      catId: string,
      subId: string,
      search: string | null,
      sField: string,
      sOrder: string,
    ) => {
      const params = new URLSearchParams();
      if (search) {
        params.set("search", search);
      } else {
        if (catId) params.set("category_id", catId);
        if (subId) params.set("sub_category_id", subId);
      }

      if (sField && sField !== "title") params.set("sort_field", sField);
      if (sOrder && sOrder !== "asc") params.set("sort_order", sOrder);

      const newUrl = `/home/catalog?${params.toString()}`;
      if (window.location.search !== `?${params.toString()}`) {
        window.history.replaceState(null, "", newUrl);
      }
    },
    [],
  );

  useEffect(() => {
    if (searchQuery || activeCategoryId) {
      updateUrl(
        activeCategoryId,
        activeSubCategoryId,
        searchQuery,
        sortField,
        sortOrder,
      );
    }
  }, [
    activeCategoryId,
    activeSubCategoryId,
    searchQuery,
    sortField,
    sortOrder,
    updateUrl,
  ]);

  const handleCategorySelect = (id: string) => {
    setActiveCategoryId(id);
    const histSubId = subHistory[id] || "";
    setActiveSubCategoryId(histSubId);
    setPage(1);
    localStorage.setItem("catalog_active_category_id", id);
    if (searchQuery) router.push("/home/catalog");
  };

  const handleSubCategorySelect = (id: string) => {
    setActiveSubCategoryId(id);
    setPage(1);
    setSubHistory((prev) => {
      const next = { ...prev, [activeCategoryId]: id };
      localStorage.setItem("catalog_sub_history", JSON.stringify(next));
      return next;
    });
    if (searchQuery) router.push("/home/catalog");
  };

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

  return (
    <div className="home-page catalog-page">
      <HeaderHome />
      <CatalogTopBar
        categories={categories}
        activeId={activeCategoryId}
        onSelect={handleCategorySelect}
      />

      <div className="catalog-page__content">
        <CatalogSideNav
          subCategories={subCategories}
          activeId={activeSubCategoryId as string}
          onSelect={handleSubCategorySelect}
        />

        <main className="catalog-page__main">
          <div className="catalog-header-area">
            <h1 className="catalog-title">{displayTitle}</h1>
            <div className="catalog-controls">
              <label htmlFor="sort-select" className="sort-select">
                <select
                  title="sort-select"
                  id="sort-select"
                  value={`${sortField}:${sortOrder}`}
                  onChange={handleSortChange}
                >
                  <option value="title:asc">{t("by_title")}</option>
                  {currentMime === "video" || searchQuery ? (
                    <>
                      <option value="created:asc">{t("by_date")}</option>
                      {/* <option value="added:desc">{t("by_added")}</option> */}
                    </>
                  ) : null}
                  {currentMime !== "video" || searchQuery ? (
                    <option value="author:asc">{t("by_author")}</option>
                  ) : null}
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
