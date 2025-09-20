"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// Kiểu dữ liệu User
type User = {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatar?: string;
};

type JwtPayload = {
  id: string;
  sub: string;
  role: string;
  name?: string;
  avatar?: string;
  exp: number;
};

// Context type
type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, remember?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load từ storage khi app start
  useEffect(() => {
    const storedToken =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken");

    if (storedToken) {
      try {
        const decoded: JwtPayload = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.id,
            email: decoded.sub,
            role: decoded.role,
            name: decoded.name,
            avatar: decoded.avatar,
          });
          setToken(storedToken);
          console.log(decoded)
        } else {
          // Token expired → clear
          logout();
        }
      } catch (e) {
        console.error("Invalid token in storage", e);
        logout();
      }
    }
  }, []);

  // Login chỉ cần token, tự decode
  const login = (token: string, remember = true) => {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      const userData: User = {
        id: decoded.id,
        email: decoded.sub,
        role: decoded.role,
        name: decoded.name,
        avatar: decoded.avatar,
      };

      if (remember) {
        localStorage.setItem("authToken", token);
        // localStorage.setItem("user", userData);
      } else {
        sessionStorage.setItem("authToken", token);
      }

      setUser(userData);
      setToken(token);
    } catch (e) {
      console.error("Failed to decode token on login", e);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
