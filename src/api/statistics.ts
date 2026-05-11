import apiClient from "@/utils/apiClient";

export interface MediaStatistic {
  book_count: number;
  audio_count: number;
  video_count: number;
  content_count: number;
}

export const getMediaStatisticsREQ = async (categoryId?: string): Promise<MediaStatistic | null> => {
  try {
    const res = await apiClient.get("/admin/get_media_amount", {
      params: { category_id: categoryId }
    });
    return res.data;
  } catch (e) {
    console.error("Error fetching media statistics:", e);
    return null;
  }
};
