"use client";
import { TableItemT, ItemT } from "@/types/table";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { RiDeleteBin4Fill } from "react-icons/ri";
import { AiFillEdit } from "react-icons/ai";
import { dataT } from "@/types/useFormStore";

export default function TableItem({
  keys,
  data,
  styleTable,
  personIcon,
  onClick,
}: TableItemT) {
  const [showPassword, setShowPassword] = useState(false);

  const renderValue = (key: string, value: ItemT[string], index: number) => {
    if (value === null || value === undefined) return "—";

    // Handle special "Avatar" column logic for the first column if it's "name" or similar
    if (index === 0) {
      return (
        <div className="table__cell-with-icon">
          {personIcon}
          <span>
            {typeof value === "object" && "name" in value
              ? value.name
              : String(value)}
          </span>
        </div>
      );
    }

    // Handle Password visibility toggle if key matches
    if (
      key.toLowerCase().includes("password") ||
      key.toLowerCase().includes("пароль")
    ) {
      return (
        <div className="table__cell-with-icon">
          <span>{showPassword ? String(value) : "*****"}</span>
          <button onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <FaEyeSlash color="#666" />
            ) : (
              <FaEye color="#666" />
            )}
          </button>
        </div>
      );
    }

    if (typeof value === "object" && "name" in value) return value.name;
    return String(value);
  };

  return (
    <div
      className="table__row"
      style={styleTable}
      onClick={() => onClick && onClick(data as dataT)}
    >
      {keys.map((key, i) => (
        <span key={i}>{renderValue(key, data[key], i)}</span>
      ))}
      <div className="table__actions">
        <button className="action-btn edit" title="Edit">
          <AiFillEdit />
        </button>
        <button className="action-btn delete" title="Delete">
          <RiDeleteBin4Fill />
        </button>
      </div>
    </div>
  );
}
