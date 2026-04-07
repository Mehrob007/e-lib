import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getElementsREQ = async (id: string) => {
  try {
    const res = await apiClient(`library/category/${id}/content`);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getCategoryContentREQ = async (
  id: string,
  params?: {
    sort_field?: string;
    sort_order?: "asc" | "desc";
    _limit?: number;
    _offset?: number;
  },
) => {
  try {
    const res = await apiClient(`library/category/${id}/content`, { params });
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
    const res = await apiClient(`admin/content/${branch_id}/presigned`, {
      params: { filename },
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getElementsMainREQ = async () => {
  try {
    const res = await apiClient("library/main");
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
        // "Content-Type": file.type,  "application/octet-stream",
        "ngrok-skip-browser-warning": "1",
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
    const res = await apiClient.post("/admin/save_content", data, {
      // params: {
      //   name: data?.name as string,
      //   branch_id: data?.branch_id as string,
      // },
    });
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getContentDetailsREQ = async (content_id: string) => {
  try {
    const res = await apiClient(`/admin/content/${content_id}`);
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
    const res = await apiClient(`/library/download_content/${content_id}`, {
      params: { expires },
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const confirmUploadREQ = async (file_url: string) => {
  try {
    const res = await apiClient.post("/admin/confirm_upload", null, {
      params: { file_url },
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const deleteElementById = async (id: string) => {
  try {
    const res = await apiClient.delete("admin/delete_content/" + id);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const editElementById = async (
  id: string,
  data: Record<string, unknown>,
) => {
  try {
    const res = await apiClient.patch("admin/update_content/" + id, data);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getContentById = async (id: string) => {
  try {
    const res = await apiClient("/library/content/" + id);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
