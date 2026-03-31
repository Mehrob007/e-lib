import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getElementsREQ = async (id: string) => {
  try {
    const res = await apiClient(` /library/category/${id}/content`);
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

export const getPresignedUrlREQ = async (
  branch_id: string,
  filename: string,
) => {
  try {
    const res = await apiClient(`/admin/content/${branch_id}/presigned`, {
      params: { filename },
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const putFileREQ = async (url: string, file: File) => {
  try {
    const res = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    if (!res.ok) throw new Error("Upload failed");
    return res;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const postSaveContentREQ = async (data: Record<string, unknown>) => {
  try {
    const res = await apiClient.post("/admin/save_content", data);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getContentDetailsREQ = async (content_id: string) => {
  try {
    const res = await apiClient(`//admin/content/${content_id}`);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getDownloadUrlREQ = async (
  content_id: string,
  expires: number = 600,
) => {
  try {
    const res = await apiClient(`/ /library/download_content/${content_id}`, {
      params: { expires },
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const confirmUploadREQ = async (object_key: string) => {
  try {
    const res = await apiClient.post("/admin/confirm_upload", null, {
      params: { object_key },
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
