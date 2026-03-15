import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getUsersREQ = async () => {
  try {
    const res = await apiClient("user");
    return res?.data;
  } catch (e) {
    console.error(e);
  }
};

export const postUserREQ = async (data: dataT) => {
  try {
    const res = await apiClient.post("user", data);
    return res?.data;
  } catch (e) {
    console.error(e);
  }
};
