"use client";
import BurgerItem from "@/../public/icons/burger-btn.svg";

export default function Header() {
  return (
    <header>
      <BurgerItem aria-label="burger-btn" className="burger-btn" />
      <h1>
        Library eDonish <span>|</span> Admin
      </h1>
    </header>
  );
}
