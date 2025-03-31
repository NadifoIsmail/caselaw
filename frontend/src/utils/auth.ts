import axios from "axios";
import { LoginFormData, SignupFormData, ForgotPasswordFormData } from "./validation";

// Create axios instance with default config
export const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  withCredentials: true,
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, 
(error) => Promise.reject(error));

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const response = await axios.post("/api/auth/refresh", {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        const { access_token } = response.data;
        localStorage.setItem("accessToken", access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

interface AuthResponse {
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
    }
  }
}

// API endpoints for authentication
export const authApi = {
  login: (data: LoginFormData): Promise<AuthResponse> => {
    return api.post("/auth/login", data);
  },
  signup: (data: Omit<SignupFormData, "confirmPassword">): Promise<AuthResponse> => {
    // const { confirmPassword, ...signupData } = data;
    return api.post("/auth/signup", data);
  },
  forgotPassword: (data: ForgotPasswordFormData) => {
    return api.post("/auth/forgot-password", data);
  },
  logout: () => {
    return api.post("/auth/logout");
  },
  // Google OAuth endpoints
  googleAuth: (type: "login" | "signup") => {
    const backendUrl = "http://127.0.0.1:5000";
    return `${backendUrl}/auth/google?auth_type=${type}`;
  },
};