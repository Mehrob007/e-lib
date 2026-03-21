"use client"
import { useState } from "react";

interface Props {
  onSearch: (v: string) => void;
}

export default function SearchInput({ onSearch }: Props) {
  const [v, setV] = useState("");
  return (
    <div>
      <input type="text" value={v} onChange={(e) => setV(e.target.value)} />
      <button onClick={() => onSearch(v)}>Ҷустуҷӯ</button>
    </div>
  );
}
