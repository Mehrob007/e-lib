import { getTokenGuestREQ } from "@/api/auth";
import { useEffect } from "react";

export default function GetTopkenGuest() {
  const getGuestToken = async () => {
    try {
      const res = await getTokenGuestREQ();
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getGuestToken();
  }, []);

  return "";
}
