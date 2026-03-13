import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getElementsREQ = async (id?: string) => {
  try {
    const res = await apiClient("categorys" + (id ? "/" + id : ""));
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const postElementREQ = async (data: dataT) => {
  try {
    const res = await apiClient.post("categorys", data);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
