"use client";
import BurgerItem from "@/../public/icons/burger-btn.svg";
import Image from "next/image";

export default function Header({ logo }: { logo?: string }) {
  return (
    <header>
      <BurgerItem aria-label="burger-btn" className="burger-btn" />
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {logo && (
          <Image
            src={logo.startsWith("http") ? logo : `/${logo}`}
            alt="Logo"
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
          />
        )}
        <h1>
          Library eDonish <span>|</span> Admin
        </h1>
      </div>
    </header>
  );
}
