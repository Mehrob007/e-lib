import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getCategorysREQ = async (id?: string) => {
  try {
    const res = await apiClient("categorys" + (id ? "/" + id : ""));
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const postCatalogREQ = async (data: dataT) => {
  try {
    const res = await apiClient.post("categorys", data);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
