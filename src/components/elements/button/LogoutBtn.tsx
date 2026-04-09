"use client";
import { TbLogout } from "react-icons/tb";

export default function LogoutBtn() {
  const Logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user-role");
    document.location.href = "/"
  };
  return <TbLogout onClick={Logout} size={26} strokeWidth={1.5} />;
}
