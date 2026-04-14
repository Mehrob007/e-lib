import {
  TbChartLine,
  TbPlayerPlay,
  TbSitemap,
  TbUser,
  TbCarouselHorizontal,
} from "react-icons/tb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutBtn from "@/components/elements/button/LogoutBtn";

export default function LeftMenu({ open }: { open: boolean }) {
  const pathName = usePathname();
  const userRole = localStorage.getItem("user-role");

  const superAdmin = [
    {
      title: "Категории",
      icon: <TbSitemap size={26} strokeWidth={1.5} />,
      href: "/admin/category",
    },
    {
      title: "Администраторы",
      icon: <TbUser size={26} strokeWidth={1.5} />,
      href: "/admin/super-admin",
    },
  ];
  
  const menuList = [
    {
      title: "Статистика",
      icon: <TbChartLine size={26} strokeWidth={1.5} />,
      href: "/admin/statistics",
    },
    {
      title: "Контент",
      icon: <TbPlayerPlay size={26} strokeWidth={1.5} />,
      href: "/admin/elements",
    },
    {
      title: "Слайдер",
      icon: <TbCarouselHorizontal size={26} strokeWidth={1.5} />,
      href: "/admin/swiper",
    },
    ...(userRole === "Superadmin" ? superAdmin : []),
  ];

  return (
    <main className={`left__menu ${open ? "open__left_menu" : ""}`}>
      <nav>
        {menuList.map((e, i) => (
          <div
            key={i}
            className={`menu-icon-wrapper ${pathName === e.href ? "active" : ""}`}
          >
            <Link href={e.href}>
              <span className="menu-icon-circle">{e.icon}</span>
            </Link>
          </div>
        ))}
      </nav>
      <span className="menu-icon-circle">
        <LogoutBtn />
      </span>
    </main>
  );
}
