"use client";
import React, { useState } from "react";
import LeftMenu from "./leftMenu/LeftMenu";
import Header from "./header/Header";
import { usePathname } from "next/navigation";

export default function Component({ children }: { children: React.ReactNode }) {
  const [openMenu, setOpenMenu] = useState(false);
  const pathName = usePathname();
  return (
    <main className="component__main">
      {pathName?.includes("admin") && <Header />}
      <div>
        {pathName?.includes("admin") && <LeftMenu open={openMenu} />}
        {children}
      </div>
    </main>
  );
}
