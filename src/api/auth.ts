import apiClient from "@/utils/apiClient";

export const postAuthREQ = async (data: {
  phone_number: string;
  password: string;
}) => {
  try {
    const res = await apiClient.post("/admin/login", {}, { params: data });
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getTokenGuestREQ = async () => {
  try {
    const res = await apiClient("/get-guest-token");
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
