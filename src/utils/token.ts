import apiClient from "./apiClient";

export const getNewToken = async (refreshToken: string | null) => {
  if (!refreshToken) return;
  const res = await apiClient.get("" + refreshToken);

  return res.data;
};
