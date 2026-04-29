import { categoryT } from "@/const/api";
import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getCategorysREQ = async ({
  lang,
  _parent_id,
  _limit,
  _offset,
}: categoryT) => {
  try {
    const res = await apiClient("/library/category", {
      params: {
        lang: lang,
        ...(_parent_id ? { _parent_id: _parent_id } : {}),
        _limit: _limit,
        _offset: _offset,
      },
    });
    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const postCategoryREQ = async (data: dataT) => {
  try {
    const res = await apiClient.post("/admin/save_category", data);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const deleteBranchREQ = async (branch_id: string) => {
  try {
    const res = await apiClient.delete("/admin/delete_branch/" + branch_id);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
