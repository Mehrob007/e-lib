import axios from "axios";
import { globalState } from "@/store/globalState";
import { getNewToken } from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Добавляем Authorization перед каждым запросом
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик для обновления токена
let isRefreshing = false;
interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    const { method, url } = response.config;
    const isMutation = ["post", "patch", "delete"].includes(
      method?.toLowerCase() || "",
    );
    const isSearch = url?.toLowerCase().includes("search");

    if (isMutation && !isSearch) {
      globalState.getState().setToast({ active: true, type: "success" });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { method, url } = originalRequest || {};
    const isMutation = ["post", "patch", "delete"].includes(
      method?.toLowerCase() || "",
    );
    const isSearch = url?.toLowerCase().includes("search");

    if (isMutation && !isSearch && error.response?.status !== 401) {
      globalState.getState().setToast({ active: true, type: "error" });
    }

    console.log("error.response.status", error.response?.status);
    if (!error.response?.status && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve: (t) => resolve(t), reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        const response = await getNewToken(refreshToken);

        const newAccessToken = response.data.data.accessToken;
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
        }

        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        // document.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
