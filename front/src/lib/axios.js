// import axios from "axios";

// export const axiosInstance = axios.create({
//   baseURL:
//     import.meta.env.MODE === "development"
//       ? "http://localhost:3000/api"
//       : "/api",
//   withCredentials: true,
// });

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : "http://localhost:3000/api",
  withCredentials: true,
});