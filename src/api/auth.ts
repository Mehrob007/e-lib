import apiClient from "@/utils/apiClient";

export const postAuthREQ = async (data: {
  phone_snumber: string;
  password: string;
}) => {
  try {
    const res = await apiClient.post("/auth", data);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
