import axios from "axios";

export const getNewToken = async (refreshToken: string | null) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

  if (!refreshToken) return;
  const res = await axios.post(
    BASE_URL + "/admin/refresh/token",
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );

  return res.data;
};
