import axios from "axios";

// Set VITE_API_URL in a .env file at the frontend root.
// Locally: http://localhost:5000
// Once deployed: your Render URL, e.g. https://herii-bloom.onrender.com
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL });

// Attach the saved token to every request automatically, once logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("heribloom_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
