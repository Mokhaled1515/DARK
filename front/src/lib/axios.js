

import axios from "axios";
import { getClerkToken } from "./clerkToken.js";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : "http://localhost:3000/api",

  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getClerkToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);