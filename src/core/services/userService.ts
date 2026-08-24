import axiosInstance from '../api/axios';
import type { ApiResponse } from '../types/api';
import type { UserResponse, UserCreateRequest, UserUpdateRequest, PaginationResponse } from '../types/api';

/**
 * Service User — aligné 1:1 avec com.oseor.daba.user.controller.UserController.
 */
export const userService = {
  async getAll(page = 0, size = 50, sortBy = 'id', sortDir = 'asc') {
    const r = await axiosInstance.get<ApiResponse<PaginationResponse<UserResponse>>>(
      '/users',
      { params: { page, size, sortBy, sortDir } }
    );
    return r.data.data;
  },

  async getById(id: number): Promise<UserResponse> {
    const r = await axiosInstance.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return r.data.data;
  },

  async create(payload: UserCreateRequest): Promise<UserResponse> {
    const r = await axiosInstance.post<ApiResponse<UserResponse>>('/users', payload);
    return r.data.data;
  },

  async update(id: number, payload: UserUpdateRequest): Promise<UserResponse> {
    const r = await axiosInstance.put<ApiResponse<UserResponse>>(`/users/${id}`, payload);
    return r.data.data;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/users/${id}`);
  },
};
