import axios from "axios";

export const api = axios.create({
  // ✅ USA LA VARIABLE DE ENTORNO, con fallback a localhost para desarrollo
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// ... el resto de tus interceptores se quedan igual ...

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
