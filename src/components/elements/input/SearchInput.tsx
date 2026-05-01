"use client";
import { useState, useEffect, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useI18nStore";
import { searchElementsREQ } from "@/api/element";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/components/ui/loading/Loading";

interface Props {
  onSearch: (v: string) => void;
}

export default function SearchInput({ onSearch }: Props) {
  const { t, getLocalized } = useTranslation();
  const [v, setV] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (v.trim().length > 1) {
        setLoading(true);
        setShowResults(true);
        try {
          const res = await searchElementsREQ(v);
          setResults(res || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [v]);

  const handleResultClick = (id: string) => {
    router.push(`/home/catalog/${id}`);
    setShowResults(false);
    setV("");
  };

  return (
    <div className="search-input-wrapper-home" ref={wrapperRef}>
      <div className="search-input">
        <input
          placeholder={t("search_placeholder")}
          type="text"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onFocus={() => v.trim().length > 1 && setShowResults(true)}
        />
        <button onClick={() => onSearch(v)}>
          <IoSearchOutline /> {t("search_button")}
        </button>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            className="search-results-dropdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {loading ? (
              <div className="search-status">
                <Loading styles={{ width: "24px", height: "24px" }} />
                <span>{t("searching")}...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="results-list">
                {results.map((item) => {
                  const details = item.details || {};
                  return (
                    <div
                      key={item.id}
                      className="result-item"
                      onClick={() => handleResultClick(item.id)}
                    >
                      <div className="result-thumb">
                        {details.preview_url ? (
                          <img src={details.preview_url} alt={getLocalized(item.name || item.title)} />
                        ) : (
                          <div className="thumb-placeholder" />
                        )}
                      </div>
                      <div className="result-info">
                        <span className="result-name">{getLocalized(item.name || item.title)}</span>
                        <span className="result-author">{getLocalized(details.author) || "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="search-status no-results">
                {t("no_results_found")}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
