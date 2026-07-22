import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
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

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // No need to get refresh token manually from cookies
        // Just send request with credentials
        const refreshRes = await api.post(`${apiUrl}/user/refresh-token`, {
          withCredentials: true, // ✅ Must include cookies
        });

        const newAccessToken = refreshRes.data.data.accessToken;


        // Save new access token
        localStorage.setItem("accessToken", newAccessToken);

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (err) {
        
        console.error("🔁 Token refresh failed:", err);

        localStorage.removeItem("accessToken");

        // Optional redirect to login
        // window.location.href = "/login";

        return Promise.reject(err);
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

// FILE UPLOAD (multipart/form-data) — for avatar, provider documents, etc.
// formData must already be a FormData instance.
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