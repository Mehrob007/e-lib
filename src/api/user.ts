import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getUsersREQ = async () => {
  try {
    const res = await apiClient("/admin/get-admins");
    return res?.data;
  } catch (e) {
    console.error(e);
  }
};

export const postUserREQ = async (data: dataT) => {
  try {
    const res = await apiClient.post("/admin/create-admin", data);
    return res?.data;
  } catch (e) {
    console.error(e);
  }
};

export const deleteUserById = async (id: string) => {
  try {
    const res = await apiClient.delete("/admin/delete-admin?user_id=" + id);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const editUserById = async (id: string, data: dataT) => {
  try {
    const res = await apiClient.put("/admin/update-admin?user_id=" + id, data);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
