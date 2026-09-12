import axios from "axios";
import { API_BASE_URL } from "config/constant";


const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔥 AUTO LOGOUT SETUP
api.interceptors.response.use(
  (response) => {
    if (response.data?.code === "TOKEN_EXPIRED") {
      localStorage.clear();
      window.location.href = "/realestate/login";
      return Promise.reject(new Error("Token Expired"));
    }
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.data?.code === "TOKEN_EXPIRED"
    ) {
      localStorage.clear();
      window.location.href = "/realestate/login";
    }
    return Promise.reject(error);
  }
);

export default api;
