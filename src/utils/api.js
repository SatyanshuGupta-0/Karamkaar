import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Plain instance, NO interceptors attached.
// Used only for the refresh-token call so its response never
// re-triggers the 401 handler below (that's what caused the loop).
const rawApi = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Concurrency control -----------------------------------------
// If several requests 401 at the same time (e.g. 3 API calls fire
// together right when the token expires), we don't want 3 separate
// refresh-token calls racing each other. All but the first just wait
// for the in-flight refresh to finish and reuse its result.
let isRefreshing = false;
let refreshWaiters = [];

const resolveWaiters = (token) => {
  refreshWaiters.forEach((resolve) => resolve(token));
  refreshWaiters = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Never try to "refresh" the refresh-token endpoint itself —
    // that was the direct cause of the infinite loop.
    const isRefreshCall = originalRequest?.url?.includes("/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for the in-flight refresh instead of starting a new one.
        const newToken = await new Promise((resolve) => {
          refreshWaiters.push(resolve);
        });
        if (!newToken) return Promise.reject(error);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      isRefreshing = true;

      try {
        // IMPORTANT: rawApi, not api — no interceptors, so a 401
        // here just rejects normally instead of looping.
        const refreshRes = await rawApi.post("/user/refresh-token");

        const newAccessToken = refreshRes.data?.data?.accessToken;
        if (!newAccessToken) throw new Error("No accessToken in refresh response");

        localStorage.setItem("accessToken", newAccessToken);
        resolveWaiters(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("🔁 Token refresh failed:", err);
        localStorage.removeItem("accessToken");
        resolveWaiters(null);

        // Uncomment if you want a hard redirect on refresh failure:
        // window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// GET
export const get = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response.data;
};

// POST
export const post = async (url, data = {}, config = {}) => {
  const response = await api.post(url, data, config);
  return response.data;
};

// PUT
export const put = async (url, data = {}) => {
  const response = await api.put(url, data);
  return response.data;
};

// PATCH
export const patch = async (url, data = {}) => {
  const response = await api.patch(url, data);
  return response.data;
};

// DELETE
export const remove = async (url) => {
  const response = await api.delete(url);
  return response.data;
};

// FILE UPLOAD (multipart/form-data)
export const uploadFile = async (url, formData, onProgress) => {
  const response = await api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      : undefined,
  });
  return response.data;
};

export const updateProviderLocation = async (bookingId, latitude, longitude) => {
  const response = await api.patch(`/booking/${bookingId}/location`, {
    latitude,
    longitude,
  });
  return response.data;
};

export default api;