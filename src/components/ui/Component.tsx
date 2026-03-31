"use client";
import React, { useState } from "react";
import LeftMenu from "./leftMenu/LeftMenu";
import Header from "./header/Header";
import { usePathname } from "next/navigation";
import GetTopkenGuest from "../elements/trigger/GetTopkenGuest";

export default function Component({ children }: { children: React.ReactNode }) {
  const [openMenu, setOpenMenu] = useState(false);
  const pathName = usePathname();

  const isAdmin = pathName?.includes("admin");
  return (
    <main className="component__main">
      {!isAdmin && <GetTopkenGuest />}
      {isAdmin && <Header />}
      <div style={{ paddingRight: !isAdmin ? "0" : "" }}>
        {isAdmin && <LeftMenu open={openMenu} />}
        {children}
      </div>
    </main>
  );
}
