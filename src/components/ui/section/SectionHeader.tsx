"use client";
import { useTranslation } from "@/hooks/useI18nStore";
import { IoEyeOutline } from "react-icons/io5";

interface Props {
  title: string;
  onViewAll?: () => void;
}

export default function SectionHeader({ title, onViewAll }: Props) {
  const { t } = useTranslation();
  return (
    <div className="section-header">
      <h2 className="section-header__title">{title}</h2>
      {onViewAll && (
        <button className="section-header__all" onClick={onViewAll}>
          <IoEyeOutline /> {t("all")}
        </button>
      )}
    </div>
  );
}
