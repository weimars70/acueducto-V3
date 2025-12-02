import { apiClient } from './client';
import type { User, CreateUserDto, UpdateUserDto } from '../../types/user';
import type { PaginatedResponse } from '../../types/api';

export const userService = {
  async getUsers(params: {
    user_name?: string;
    email?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    try {
      const { page, limit, ...filters } = params;
      const queryParams = new URLSearchParams();

      if (page !== undefined) {
        queryParams.append('page', page.toString());
      }

      if (limit !== undefined) {
        queryParams.append('limit', limit.toString());
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const { data } = await apiClient.get<PaginatedResponse<User>>('/users/view', {
        params: queryParams
      });

      return data;
    } catch (error) {
      throw error;
    }
  },

  async getById(id: number): Promise<User> {
    try {
      const { data } = await apiClient.get<User>(`/users/${id}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async create(user: CreateUserDto): Promise<User> {
    try {
      const { data } = await apiClient.post<User>('/users', user);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async update(id: number, user: UpdateUserDto): Promise<User> {
    try {
      const { data } = await apiClient.put<User>(`/users/${id}`, user);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      throw error;
    }
  }
};
