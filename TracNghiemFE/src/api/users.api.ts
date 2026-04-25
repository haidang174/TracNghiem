//src/api/users.api.ts
import client from "./client";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isActive: boolean;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
}

export interface UserListResponse {
  data: {
    data: User[];
    total: number;
    page: number;
    limit: number;
  };
}

export const getUsers = (params?: { page?: number; limit?: number; search?: string }): Promise<UserListResponse> => {
  return client.get("/users", { params });
};

export const createUser = (data: CreateUserRequest): Promise<User> => {
  return client.post("/users", data);
};

export const updateUser = (id: number, data: UpdateUserRequest): Promise<User> => {
  return client.put(`/users/${id}`, data);
};

export const deleteUser = (id: number): Promise<void> => {
  return client.delete(`/users/${id}`);
};

export const toggleUserStatus = (id: number, isActive: boolean): Promise<User> => {
  return client.patch(`/users/${id}/status`, { isActive: Boolean(isActive) });
};
