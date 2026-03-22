"use client";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-banner__content">
        <div className="hero-banner__text">
          <h1>Китобхона</h1>
          <p>Хуш омадед ба Китобхонаи eDonish!</p>
        </div>
        <div className="hero-banner__image">
          {/* Using a placeholder image for now, user can replace it */}
          <div className="book-image-placeholder">
            <div className="open-book"></div>
          </div>
        </div>
      </div>

      <button className="hero-banner__nav hero-banner__nav--prev">
        <IoChevronBackOutline />
      </button>
      <button className="hero-banner__nav hero-banner__nav--next">
        <IoChevronForwardOutline />
      </button>

      <div className="hero-banner__pagination">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  );
}
