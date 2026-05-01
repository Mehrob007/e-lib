"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getMediaStatisticsREQ, MediaStatistic } from "@/api/statistics";
import { getCategorysREQ } from "@/api/category";
import { useI18nStore } from "@/hooks/useI18nStore";
import { ItemT } from "@/types/table";
import { motion } from "framer-motion";
import { 
  TbVideo, 
  TbBook, 
  TbMusic, 
  TbFileText, 
  TbChartBar,
  TbArrowUpRight,
  TbFilter
} from "react-icons/tb";

export default function StatisticsPage() {
  const [stats, setStats] = useState<MediaStatistic[]>([]);
  const [categories, setCategories] = useState<ItemT[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const lang = useI18nStore(s => s.lang);

  const fetchStats = useCallback(async (catId?: string) => {
    setLoading(true);
    const data = await getMediaStatisticsREQ(catId);
    if (data) {
      setStats(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategorysREQ({ lang });
      if (data) {
        setCategories(data as unknown as ItemT[]);
      }
    };
    fetchCategories();
    fetchStats();
  }, [fetchStats, lang]);

  useEffect(() => {
    fetchStats(selectedCategoryId || undefined);
  }, [selectedCategoryId, fetchStats]);

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("вид") || n.includes("vid")) return <TbVideo size={32} strokeWidth={1.5} />;
    if (n.includes("кит") || n.includes("book")) return <TbBook size={32} strokeWidth={1.5} />;
    if (n.includes("аудио") || n.includes("music")) return <TbMusic size={32} strokeWidth={1.5} />;
    return <TbFileText size={32} strokeWidth={1.5} />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  } as const;

  const totalCount = stats.reduce((acc, curr) => acc + curr.content_count, 0);

  return (
    <div className="statistics-page">
      <div className="statistics-page__header">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-title-wrapper"
        >
          <h1>Статистика контента</h1>
        </motion.div>
        
        <div className="header-actions">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="category-select-wrapper"
          >
            <TbFilter className="filter-icon" />
            <select 
              value={selectedCategoryId} 
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="category-select"
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id as string} value={cat.id as string}>
                  {cat.name as string}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="total-badge"
          >
            <span className="total-label">Общий объем:</span>
            <span className="total-value">{totalCount}</span>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <span></span>
        </div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="statistics-chart-container"
          >
            <h2>Визуальный обзор</h2>
            <div className="chart-wrapper">
              {stats.map((item) => {
                const maxVal = Math.max(...stats.map(s => s.content_count));
                const heightPercentage = maxVal > 0 ? (item.content_count / maxVal) * 100 : 0;
                
                return (
                  <div key={item.media_id} className="chart-bar-group">
                    <div className="bar-outer">
                      <motion.div 
                        className="bar-inner"
                        data-value={item.content_count}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="bar-label">{item.media_name}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            className="statistics-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {stats.map((item) => (
              <motion.div 
                key={item.media_id} 
                className="stat-card"
                variants={itemVariants}
              >
                <div className="stat-card__icon-wrapper">
                  {getIcon(item.media_name)}
                </div>
                
                <div className="stat-card__content">
                  <h3>{item.media_name}</h3>
                  <div className="stat-card__value-box">
                    <span className="count">{item.content_count}</span>
                    <span className="label">файлов</span>
                  </div>
                </div>

                <div className="stat-card__footer">
                  <div className="progress-bar-bg">
                    <motion.div 
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: totalCount > 0 ? `${(item.content_count / totalCount) * 100}%` : "0%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="percentage">
                    {totalCount > 0 ? Math.round((item.content_count / totalCount) * 100) : 0}%
                  </span>
                </div>
                
                <TbArrowUpRight className="card-arrow" strokeWidth={1} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
