import axios from "axios";

// Use the injected global constant from vite.config.js
// (falls back to "/" for safety if not defined)

// const API_URL = typeof __API_BASE__ !== "undefined" ? __API_BASE__ : "/";

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

const api = axios.create({
  baseURL: typeof __API_BASE__ !== "undefined" ? __API_BASE__ : "",
});

// Function to set the JWT token in headers for all subsequent requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
