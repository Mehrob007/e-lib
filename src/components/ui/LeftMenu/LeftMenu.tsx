import IconMenuAdmin from "@/../public/icons/icon-menu-admin.svg";
import Link from "next/link";

export default function LeftMenu({ open }: { open: boolean }) {
  const menuList = [{ title: "", icon: <IconMenuAdmin />, href: "/admin" }];

  return (
    <main className="left__menu">
      {menuList.map((e, i) => (
        <span key={i}>
          <Link href={e.href}>{e.icon}</Link>
        </span>
      ))}
    </main>
  );
}
