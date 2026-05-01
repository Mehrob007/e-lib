import apiClient from "@/utils/apiClient";

export interface MediaStatistic {
  media_id: string;
  media_name: string;
  content_count: number;
}

export const getMediaStatisticsREQ = async (categoryId?: string): Promise<MediaStatistic[]> => {
  try {
    const res = await apiClient.get("/admin/get_media_amount", {
      params: { category_id: categoryId }
    });
    return res.data;
  } catch (e) {
    console.error("Error fetching media statistics:", e);
    return [];
  }
};
