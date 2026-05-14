"use client";

import { useState, useEffect } from "react";
import {
  LuCirclePlay,
  LuHeadphones,
  LuFileText,
  LuChevronDown,
} from "react-icons/lu";
import { getCategorysREQ } from "@/api/category";
import { useI18nStore } from "@/hooks/useI18nStore";

interface SubCategory {
  id: string;
  name: string;
  mime: "video" | "audio" | "text" | "book";
  hasChildren?: boolean;
}

interface Props {
  subCategories: SubCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CatalogSideNav({
  subCategories,
  activeId,
  onSelect,
}: Props) {
  const lang = useI18nStore((s) => s.lang);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("catalog_expanded_ids");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return new Set(parsed);
        } catch (e) {
          console.error("Failed to parse expandedIds from localStorage", e);
        }
      }
    }
    return new Set();
  });
  const [nestedData, setNestedData] = useState<Record<string, SubCategory[]>>(
    {},
  );
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "catalog_expanded_ids",
      JSON.stringify(Array.from(expandedIds)),
    );
  }, [expandedIds]);

  useEffect(() => {
    const fetchAllNested = async () => {
      const ids = Array.from(expandedIds);
      for (const id of ids) {
        if (loadingIds.has(id)) continue;

        setLoadingIds((prev) => new Set(prev).add(id));
        try {
          const res = await getCategorysREQ({
            lang,
            _parent_id: id,
          });

          if (res && Array.isArray(res)) {
            const mapped: SubCategory[] = res.map(
              (cat: {
                id: string;
                name: string;
                mime: "video" | "audio" | "text" | "book";
                has_children?: boolean;
              }) => ({
                id: cat.id,
                name: cat.name,
                mime: cat.mime,
                hasChildren: cat.has_children,
              }),
            );
            setNestedData((prev) => ({ ...prev, [id]: mapped }));
          }
        } catch (error) {
          console.error(`Failed to fetch subcategories for ${id}:`, error);
        } finally {
          setLoadingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    };

    fetchAllNested();
  }, [lang, expandedIds]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <LuCirclePlay size={24} />;
      case "audio":
        return <LuHeadphones size={24} />;
      case "text":
        return <LuFileText size={24} />;
      case "book":
        return <LuFileText size={24} />;
      default:
        return <LuFileText size={24} />;
    }
  };

  const toggleExpand = async (
    e: React.MouseEvent,
    id: string,
    parentId: string | null = null,
  ) => {
    e.stopPropagation();

    const newExpandedIds = new Set(expandedIds);

    if (isMobile) {
      if (parentId === null) {
        subCategories.forEach((cat) => {
          if (cat.id !== id) newExpandedIds.delete(cat.id);
        });
      } else {
        const siblings = nestedData[parentId] || [];
        siblings.forEach((cat) => {
          if (cat.id !== id) newExpandedIds.delete(cat.id);
        });
      }
    }

    if (newExpandedIds.has(id)) {
      newExpandedIds.delete(id);
    } else {
      newExpandedIds.add(id);
    }
    setExpandedIds(newExpandedIds);
  };


 

  const renderItem = (
    sub: SubCategory,
    isNested = false,
    parentId: string | null = null,
  ) => {
    const isExpanded = expandedIds.has(sub.id);
    const isLoading = loadingIds.has(sub.id);

    return (
      <div
        key={sub.id}
        className={`catalog-side-nav__wrapper ${isNested ? "nested" : ""}`}
      >
        <div
          className={`catalog-side-nav__item ${activeId === sub.id ? "active" : ""} ${isExpanded ? "expanded" : ""}`}
          onClick={() => onSelect(sub.id)}
        >
          <div className="catalog-side-nav__link">
            {getIcon(sub.mime)}
            <span title={sub.name}>{sub.name}</span>
            {sub.hasChildren !== false && (
              <div
                className={`catalog-side-nav__arrow-wrapper ${isExpanded ? "expanded" : ""}`}
                onClick={(e) => toggleExpand(e, sub.id, parentId)}
              >
                {isLoading ? (
                  <div className="catalog-side-nav__loader" />
                ) : (
                  <LuChevronDown
                    size={20}
                    className="catalog-side-nav__arrow"
                  />
                )}
              </div>
            )}
          </div>
        </div>
        {isExpanded && nestedData[sub.id] && (
          <div className="catalog-side-nav__children">
            {nestedData[sub.id].map((child) => renderItem(child, true, sub.id))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="catalog-side-nav">
      {subCategories.map((sub) => renderItem(sub, false, null))}
    </aside>
  );
}
