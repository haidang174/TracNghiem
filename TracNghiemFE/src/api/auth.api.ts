//src/api/auth.api.ts
import client from "./client";

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: number;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Đăng nhập
export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return client.post("/auth/login", data) as unknown as Promise<LoginResponse>;
};

// Đăng xuất
export const logout = (): Promise<void> => {
  return client.post("/auth/logout") as unknown as Promise<void>;
};

// Lấy thông tin user hiện tại
export const getMe = (): Promise<LoginResponse["data"]["user"]> => {
  return client.get("/auth/me") as unknown as Promise<LoginResponse["data"]["user"]>;
};

// Đổi mật khẩu
export const changePassword = (data: ChangePasswordRequest): Promise<void> => {
  return client.post("/auth/change-password", data) as unknown as Promise<void>;
};
