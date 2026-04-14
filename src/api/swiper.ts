import { dataT } from "@/types/useFormStore";
import apiClient from "@/utils/apiClient";

export const getSwiper = async ({
  _limit,
  _offset,
}: {
  _limit: number;
  _offset: number;
}) => {
  try {
    const res = await apiClient("/library/get_swiper", {
      params: {
        _limit: _limit,
        _offset: _offset,
      },
    });
    // Ответ res
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const postSwiper = async ({ data }: { data: dataT }) => {
  try {
    // Запрос data
    // {
    //   "details": {
    //     "mime": "image/jpeg",
    //     "preview_key": "previews/17/05/1705d89637484164a3f0bd00479494ae.jpg"
    //   },
    //   "name": "Главный баннер"
    // }
    const res = await apiClient.post("/admin/save_swiper", data, {});
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const getSwiperPresigned = async ({
  filename,
}: {
  filename: string;
}) => {
  try {
    const res = await apiClient("/admin/swiper/presigned", {
      params: {
        filename: filename,
      },
    });
    // Ответ res
    // {
    //   "upload_url": "https://squalidly-nonoccult-tori.ngrok-free.dev/files/swiper/36/06/36068d3588f14ea78ade755b9259b83b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260414%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260414T052205Z&X-Amz-Expires=600&X-Amz-SignedHeaders=host&X-Amz-Signature=7a5eb671d13c50e4a2466e32f3e5c85d9e363cb77ec92ce8a7937d53b7464d24",
    //   "object_key": "swiper/36/06/36068d3588f14ea78ade755b9259b83b.png",
    //   "file_url": "/swiper/36/06/36068d3588f14ea78ade755b9259b83b.png",
    //   "mime": "image/png"
    // }
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
