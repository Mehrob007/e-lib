"use client";

import { getTokenGuestREQ } from "@/api/auth";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { decodeJwt } from "jose";

export default function GetTopkenGuest() {
  const pathname = usePathname();

  const getGuestToken = async () => {
    try {
      const res = await getTokenGuestREQ();
      if (res?.access_token) {
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("refresh_token", res.refresh_token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isTokenValid = (token: string | null) => {
    if (!token) return false;
    try {
      const payload = decodeJwt(token);
      if (payload.exp) {
        // Add a 1 minute buffer before it actually expires
        return payload.exp * 1000 > Date.now() + 60000;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!isTokenValid(accessToken) && !isTokenValid(refreshToken)) {
      getGuestToken();
    }
  }, [pathname]);

  return null;
}
