"use client";
import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

interface Props {
  onSearch: (v: string) => void;
}

export default function SearchInput({ onSearch }: Props) {
  const [v, setV] = useState("");
  return (
    <div className="search-input">
      <input
        placeholder="Ҷустуҷӯ аз рӯи ном ё муаллиф"
        type="text"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <button onClick={() => onSearch(v)}>
        <IoSearchOutline /> Ҷустуҷӯ
      </button>
    </div>
  );
}
