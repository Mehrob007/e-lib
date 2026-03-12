import IconMenuAdmin from "@/../public/icons/icon-menu-admin.svg";
// import IconMenuAdminActive from "@/../public/icons/icon-menu-admin-active.svg";
import IconMenuFiles from "@/../public/icons/icon-menu-files.svg";
import LogoutIcon from "@/../public/icons/logout-icon.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LeftMenu({ open }: { open: boolean }) {
  const pathName = usePathname();
  const menuList = [
    {
      title: "Администраторы",
      icon: <IconMenuAdmin />,
      href: "/admin/super-admin",
    },
    {
      title: "Категории",
      icon: <IconMenuFiles />,
      href: "/admin/catalog",
    },
  ];

  return (
    <main className={`left__menu ${open ? "open__left_menu" : ""}`}>
      <nav>
        {menuList.map((e, i) => (
          <div key={i} className={pathName === e.href ? "active" : ""}>
            <Link href={e.href}>{e.icon}</Link>
          </div>
        ))}
      </nav>
      <LogoutIcon />
    </main>
  );
}
