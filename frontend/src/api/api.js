import axios from "axios";

// Backend 1
export const API_ONE = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_ONE,
  headers: { "Content-Type": "application/json" },
});

// Backend 2
export const API_TWO = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_TWO,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically for API_ONE
API_ONE.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Attach token automatically for API_TWO
API_TWO.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
