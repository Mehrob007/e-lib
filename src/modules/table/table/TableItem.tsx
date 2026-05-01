"use client";
import { TableItemT, ItemT } from "@/types/table";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { RiDeleteBin4Fill } from "react-icons/ri";
import { AiFillEdit } from "react-icons/ai";
import { folderLine } from "@/types/category";
import Image from "next/image";

export default function TableItem({
  keys,
  data,
  styleTable,
  personIcon,
  onClick,
  deleteItem,
  editItem,
}: TableItemT) {
  const [showPassword, setShowPassword] = useState(false);

  const renderValue = (key: string, value: ItemT[string], index: number) => {
    if (value === null || value === undefined) return "—";

    // Handle special "Avatar" column logic for the first column if it's "name" or similar
    if (index === 0 && key !== "preview_url") {
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

    if (
      key.toLowerCase().includes("type")
      // key.toLowerCase().includes("пароль")
    ) {
      return (
        <div className="table__cell-with-icon">
          <span>
            {String(
              value === "book"
                ? "Книги"
                : value === "audio"
                  ? "Аудио"
                  : value === "video"
                    ? "Видео"
                    : "",
            )}
          </span>
        </div>
      );
    }

    // Handle Images if key matches
    if (key === "preview_url" && typeof value === "string") {
      const isSwiper = value.toLowerCase().includes("swiper");
      return (
        <div
          style={{
            width: isSwiper ? "120px" : "70px",
            height: isSwiper ? "65px" : "100px",
            position: "relative",
            overflow: "hidden",
            borderRadius: "4px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <Image
            src={value.startsWith("http") ? value : `/${value}`}
            alt="Preview"
            width={isSwiper ? 120 : 70}
            height={isSwiper ? 65 : 100}
            sizes="120px"
            style={{ objectFit: isSwiper ? "cover" : "contain" }}
          />
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
      onClick={() => onClick && onClick(data as folderLine)}
    >
      {keys.map((key, i) => (
        <span key={i}>{renderValue(key, data[key], i)}</span>
      ))}
      <div className="table__actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            editItem && editItem(data?.id as string);
          }}
          className="action-btn edit"
          title="Edit"
        >
          <AiFillEdit />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteItem && deleteItem(data?.id as string);
          }}
          className="action-btn delete"
          title="Delete"
        >
          <RiDeleteBin4Fill />
        </button>
      </div>
    </div>
  );
}
