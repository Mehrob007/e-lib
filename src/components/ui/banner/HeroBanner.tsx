"use client";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "./HeroBanner.module.css";

interface Banner {
  id: string;
  name: string;
  details: {
    preview_url: string;
    link?: string;
  };
}

export default function HeroBanner({ banners = [] }: { banners?: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners && banners.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners, current]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  const src = banners[current].details.preview_url?.startsWith("http")
    ? banners[current].details.preview_url
    : banners[current].details.preview_url?.startsWith("/")
      ? banners[current].details.preview_url
      : `/${banners[current].details.preview_url}`;

  return (
    <div className={styles.banner}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, { offset }) => {
            if (offset.x > 50) prevSlide();
            else if (offset.x < -50) nextSlide();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.slide}
        >
          <Link
            href={banners[current].details?.link || ""}
            className={styles.imageLink}
          >
            <Image
              src={src}
              alt={banners[current].name}
              fill
              sizes="100vw"
              className={styles.image}
              priority
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button className={`${styles.nav} ${styles.navPrev}`} onClick={prevSlide}>
            <IoChevronBackOutline />
          </button>
          <button className={`${styles.nav} ${styles.navNext}`} onClick={nextSlide}>
            <IoChevronForwardOutline />
          </button>
        </>
      )}

      <div className={styles.pagination}>
        {banners.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
