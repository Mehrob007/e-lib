import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getCategorysREQ = async ({
  lang,
  _parent_id,
  _limit,
  _offset,
}: {
  lang: string;
  _parent_id?: string;
  _limit?: number;
  _offset?: number;
}) => {
  try {
    const res = await apiClient("/get_routes/category", {
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
  }
};

export const postCategoryREQ = async (data: dataT) => {
  try {
    const res = await apiClient.post(
      "/save_routes/save_category",
      {},
      { params: data },
    );
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
