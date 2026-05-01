"use client";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";

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
  return (
    <div
      className="hero-banner"
      style={{ padding: 0, overflow: "hidden", position: "relative" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-banner__content"
          style={{
            padding: 0,
            width: "100%",
            height: "100%",
            margin: 0,
            maxWidth: "none",
            position: "relative",
          }}
        >
          <div
            className="hero-banner__image"
            style={{
              width: "100%",
              height: "100%",
              margin: 0,
              position: "relative",
            }}
          >
            <Link href={banners[current].details?.link || ""}>
              <Image
                src={
                  banners[current].details.preview_url?.startsWith("http")
                    ? banners[current].details.preview_url
                    : banners[current].details.preview_url?.startsWith("/")
                      ? banners[current].details.preview_url
                      : `/${banners[current].details.preview_url}`
                }
                alt={banners[current].name}
                fill
                style={{ objectFit: "cover" }}
                priority
                onLoadingComplete={() => {}}
                onError={() =>
                  console.error(
                    "Image load error:",
                    banners[current].details.preview_url,
                  )
                }
              />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            className="hero-banner__nav hero-banner__nav--prev"
            onClick={prevSlide}
            style={{ left: "20px", zIndex: 100 }}
          >
            <IoChevronBackOutline />
          </button>
          <button
            className="hero-banner__nav hero-banner__nav--next"
            onClick={nextSlide}
            style={{ right: "20px", zIndex: 100 }}
          >
            <IoChevronForwardOutline />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      <div
        className="hero-banner__pagination"
        style={{
          zIndex: 100,
          bottom: "20px",
          right: "20px",
          background: "rgba(0, 0, 0, 0.2)",
          padding: "6px 12px",
          borderRadius: "20px",
          display: "flex",
          gap: "8px",
          backdropFilter: "blur(4px)",
        }}
      >
        {banners.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
            style={{
              cursor: "pointer",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          ></span>
        ))}
      </div>
    </div>
  );
}
