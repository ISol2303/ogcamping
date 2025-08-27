"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Kiểu dữ liệu User
type User = {
  name: string;
  email: string;
  role: string;
};

// Kiểu dữ liệu cho context
type AuthContextType = {
  user: User | null;                  // Thông tin user đang đăng nhập
  isLoggedIn: boolean;                // Trạng thái đăng nhập
  login: (token: string, user: User, remember?: boolean) => void; // Hàm login
  logout: () => void;                 // Hàm logout
};

// Tạo context, mặc định undefined để bắt lỗi khi chưa có provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider để bọc toàn bộ app (thường đặt trong layout.tsx)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Khi app load lại → check localStorage/sessionStorage xem có token + user không
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken");
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

  // Hàm login → lưu token + user vào storage (chọn localStorage hoặc sessionStorage tùy "remember")
  const login = (token: string, userData: User, remember = true) => {
    if (remember) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Hàm logout → clear token + user trong cả localStorage & sessionStorage
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để gọi context nhanh gọn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider"); 
  return context;
};
