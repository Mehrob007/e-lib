"use client";
import React, { useEffect, useState } from "react";
import { getMediaStatisticsREQ, MediaStatistic } from "@/api/statistics";
import { motion } from "framer-motion";
import { 
  TbVideo, 
  TbBook, 
  TbMusic, 
  TbFileText, 
  TbChartBar,
  TbArrowUpRight
} from "react-icons/tb";

export default function StatisticsPage() {
  const [stats, setStats] = useState<MediaStatistic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await getMediaStatisticsREQ();
      if (data) {
        setStats(data);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

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

  if (loading) {
    return (
      <div className="loading">
        <span></span>
      </div>
    );
  }

  const totalCount = stats.reduce((acc, curr) => acc + curr.content_count, 0);

  return (
    <div className="statistics-page">
      <div className="statistics-page__header">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-title-wrapper"
        >
          <TbChartBar size={32} className="header-icon" />
          <h1>Статистика контента</h1>
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
    </div>
  );
}
