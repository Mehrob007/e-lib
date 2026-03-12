import IconMenuAdmin from "@/../public/icons/icon-menu-admin.svg";
import Link from "next/link";

export default function LeftMenu({ open }: { open: boolean }) {
  const menuList = [{ title: "Админы", icon: <IconMenuAdmin />, href: "/admin/super-admin" }];

  return (
    <main className={`left__menu ${open ? "open__left_menu" : ""}`}>
      {menuList.map((e, i) => (
        <span key={i}>
          <Link href={e.href}>{e.icon}</Link>
        </span>
      ))}
    </main>
  );
}
