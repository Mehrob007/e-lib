"use client";

import { ItemT } from "@/types/table";

interface Props {
  categories: ItemT[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CatalogTopBar({
  categories,
  activeId,
  onSelect,
}: Props) {
  return (
    <div className="catalog-top-bar">
      {categories.map((cat) => (
        <button
          key={cat.id as string}
          className={`catalog-top-bar__item ${activeId === cat.id ? "active" : ""}`}
          onClick={() => onSelect(cat.id as string)}
        >
          {cat.name as string}
        </button>
      ))}
    </div>
  );
}
