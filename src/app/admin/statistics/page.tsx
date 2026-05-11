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
  TbArrowUpRight,
  TbFilter
} from "react-icons/tb";

export default function StatisticsPage() {
  const [stats, setStats] = useState<MediaStatistic | null>(null);
  const [categories, setCategories] = useState<ItemT[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const lang = useI18nStore(s => s.lang);

  const fetchStats = useCallback(async (catId?: string) => {
    setLoading(true);
    const data = await getMediaStatisticsREQ(catId);
    setStats(data);
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

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <TbVideo size={32} strokeWidth={1.5} />;
      case "book": return <TbBook size={32} strokeWidth={1.5} />;
      case "audio": return <TbMusic size={32} strokeWidth={1.5} />;
      default: return <TbFileText size={32} strokeWidth={1.5} />;
    }
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

  const statsArray = stats ? [
    { type: 'book', name: 'Книги', content_count: stats.book_count },
    { type: 'audio', name: 'Аудио', content_count: stats.audio_count },
    { type: 'video', name: 'Видео', content_count: stats.video_count },
  ] : [];

  const totalCount = stats?.content_count || 0;

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
            <div className="chart-wrapper circular">
              <div className="donut-container">
                <svg viewBox="0 0 100 100" className="donut-svg">
                  <defs>
                    <linearGradient id="grad-book" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2962ff" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                    <linearGradient id="grad-audio" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00c853" />
                      <stop offset="100%" stopColor="#64ffda" />
                    </linearGradient>
                    <linearGradient id="grad-video" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff3d00" />
                      <stop offset="100%" stopColor="#ff9100" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f8fafc"
                    strokeWidth="12"
                  />
                  {statsArray.map((item, index) => {
                    const total = statsArray.reduce((acc, curr) => acc + curr.content_count, 0);
                    if (total === 0) return null;
                    
                    const slicePercentage = (item.content_count / total) * 100;
                    const circumference = 2 * Math.PI * 38;
                    
                    const gap = total > 1 ? 2 : 0; 
                    const dashlength = Math.max(0, (slicePercentage * circumference) / 100 - gap);
                    const strokeDasharray = `${dashlength} ${circumference}`;
                    
                    const previousPercentage = statsArray
                      .slice(0, index)
                      .reduce((acc, curr) => acc + (curr.content_count / total) * 100, 0);

                    const grads = ["url(#grad-book)", "url(#grad-audio)", "url(#grad-video)"];
                    
                    return (
                      <motion.circle
                        key={item.type}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={grads[index % grads.length]}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: dashlength }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1.5, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                        style={{
                          transform: `rotate(${-90 + (previousPercentage * 360) / 100}deg)`,
                          transformOrigin: '50% 50%',
                        }}
                      />
                    );
                  })}
                </svg>
                <div className="donut-center">
                  <motion.span 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="donut-total"
                  >
                    {totalCount}
                  </motion.span>
                  <span className="donut-label">Контента</span>
                </div>
              </div>

              <div className="chart-legend">
                {statsArray.map((item, index) => {
                  const colors = ["#2962ff", "#00c853", "#ff3d00"];
                  const total = statsArray.reduce((acc, curr) => acc + curr.content_count, 0);
                  const percent = total > 0 ? Math.round((item.content_count / total) * 100) : 0;
                  
                  return (
                    <motion.div 
                      key={item.type} 
                      className="legend-item"
                      whileHover={{ x: 10, backgroundColor: "#f1f5f9" }}
                    >
                      <div className="legend-marker-wrapper">
                        <div className="legend-marker" style={{ background: colors[index % colors.length] }} />
                        <div className="legend-icon-small">
                          {getIcon(item.type)}
                        </div>
                      </div>
                      <div className="legend-info">
                        <div className="legend-top">
                          <span className="legend-name">{item.name}</span>
                          <span className="legend-percent">{percent}%</span>
                        </div>
                        <div className="legend-bottom">
                          <span className="legend-value">{item.content_count}</span>
                          <span className="legend-unit">файлов</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="statistics-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {statsArray.map((item) => (
              <motion.div 
                key={item.type} 
                className="stat-card"
                variants={itemVariants}
              >
                <div className="stat-card__icon-wrapper">
                  {getIcon(item.type)}
                </div>
                
                <div className="stat-card__content">
                  <h3>{item.name}</h3>
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
