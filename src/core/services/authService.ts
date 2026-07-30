
import axiosInstance from '../api/axios';

// Types for auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async login(loginRequest: LoginRequest) {
    // TODO: Replace with actual API call
    console.log('authService.login called with', loginRequest);
    // Example:
    // const response = await axiosInstance.post<LoginResponse>('/auth/login', loginRequest);
    // return response.data;
  },

  async register() {
    // TODO: Implement register
  },

  async logout() {
    // TODO: Implement logout if backend has endpoint
  },

  async refreshToken() {
    // TODO: Implement token refresh
  },
};
