//src/api/client.ts
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// ===== REQUEST INTERCEPTOR =====
// Tự động gắn JWT vào mọi request
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
// Xử lý lỗi 401 → tự động logout
client.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === "/login";
      if (!isLoginPage) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default client;
