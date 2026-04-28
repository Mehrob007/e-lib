"use client";
import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

import { useTranslation } from "@/hooks/useI18nStore";

interface Props {
  onSearch: (v: string) => void;
}

export default function SearchInput({ onSearch }: Props) {
  const { t } = useTranslation();
  const [v, setV] = useState("");
  return (
    <div className="search-input">
      <input
        placeholder={t("search_placeholder")}
        type="text"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <button onClick={() => onSearch(v)}>
        <IoSearchOutline /> {t("search_button")}
      </button>
    </div>
  );
}
