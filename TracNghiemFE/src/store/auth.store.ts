//src/store/auth.store.ts
import { create } from "zustand";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: "ADMIN" | "TEACHER" | "STUDENT" | null;

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>(set => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role") as "ADMIN" | "TEACHER" | "STUDENT" | null,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, role: user.role });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    set({ user: null, token: null, role: null });
  }
}));

export default useAuthStore;
