"use client";

import { useState } from "react";
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
  type: "video" | "audio" | "text";
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
  const lang = useI18nStore(s => s.lang);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [nestedData, setNestedData] = useState<Record<string, SubCategory[]>>(
    {},
  );
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <LuCirclePlay size={24} />;
      case "audio":
        return <LuHeadphones size={24} />;
      case "text":
        return <LuFileText size={24} />;
      default:
        return <LuFileText size={24} />;
    }
  };

  const toggleExpand = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const newExpandedIds = new Set(expandedIds);
    if (newExpandedIds.has(id)) {
      newExpandedIds.delete(id);
      setExpandedIds(newExpandedIds);
    } else {
      newExpandedIds.add(id);
      setExpandedIds(newExpandedIds);

      // Fetch if not already fetched
      if (!nestedData[id] && !loadingIds.has(id)) {
        setLoadingIds((prev) => new Set(prev).add(id));
        try {
          const res = await getCategorysREQ({
            lang,
            _parent_id: id,
          });

          if (res && Array.isArray(res)) {
            const mapped: SubCategory[] = res.map(
              (cat: { id: string; name: string }) => ({
                id: cat.id,
                name: cat.name,
                type: cat.name.toLowerCase().includes("видео")
                  ? "video"
                  : cat.name.toLowerCase().includes("аудио")
                    ? "audio"
                    : "text",
              }),
            );
            setNestedData((prev) => ({ ...prev, [id]: mapped }));
          }
        } catch (error) {
          console.error("Failed to fetch sub-subcategories:", error);
        } finally {
          setLoadingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    }
  };

  const renderItem = (sub: SubCategory, isNested = false) => {
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
            {getIcon(sub.type)}
            <span>{sub.name}</span>
            <div
              className={`catalog-side-nav__arrow-wrapper ${isExpanded ? "expanded" : ""}`}
              onClick={(e) => toggleExpand(e, sub.id)}
            >
              {isLoading ? (
                <div className="catalog-side-nav__loader" />
              ) : (
                <LuChevronDown size={20} className="catalog-side-nav__arrow" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && nestedData[sub.id] && (
          <div className="catalog-side-nav__children">
            {nestedData[sub.id].map((child) => renderItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="catalog-side-nav">
      {subCategories.map((sub) => renderItem(sub))}
    </aside>
  );
}
