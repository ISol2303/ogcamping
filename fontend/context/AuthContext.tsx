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
  
  console.log('AuthProvider render - user:', user, 'isLoggedIn:', !!user);

  // Load từ storage khi app start
  useEffect(() => {
    const storedToken =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken");

    console.log('Stored token found:', !!storedToken);

    if (storedToken) {
      try {
        const decoded: JwtPayload = jwtDecode(storedToken);
        console.log('JWT decoded on load:', decoded);
        console.log('Token expires at:', new Date(decoded.exp * 1000));
        console.log('Current time:', new Date());
        console.log('Token valid:', decoded.exp * 1000 > Date.now());
        
        if (decoded.exp * 1000 > Date.now()) {
//          const userData = {
//            id: decoded.id.toString(), // Sử dụng id thực sự từ JWT
//            email: decoded.sub, // JWT sub thường là email
          setUser({
            id: decoded.id,
            email: decoded.sub,
            role: decoded.role,
            name: decoded.name,
            avatar: decoded.avatar,
          };
          console.log('Setting user from JWT token:', userData);
          setUser(userData);
          setToken(storedToken);
          console.log(decoded)
        } else {
          console.log('Token expired, logging out');
          // Token expired → clear
          logout();
        }
      } catch (e) {
        console.error("Invalid token in storage", e);
        logout();
      }
    } else {
      // Nếu không có token, xóa dữ liệu user cũ
      console.log('No token found, clearing old user data');
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userId");
    }
  }, []);

  // Login chỉ cần token, tự decode
  const login = (token: string, remember = true) => {
    try {
      // Xóa dữ liệu cũ trước khi lưu mới
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userId");
      
      const decoded: JwtPayload = jwtDecode(token);
      console.log('JWT decoded in AuthContext:', decoded);
      
      const userData: User = {
        id: decoded.id.toString(), // Sử dụng id thực sự từ JWT
        email: decoded.sub,
        role: decoded.role,
        name: decoded.name,
        avatar: decoded.avatar,
      };
      
      console.log('User data created:', userData);

      if (remember) {
        localStorage.setItem("authToken", token);
       // localStorage.setItem("user", JSON.stringify(userData));
        // localStorage.setItem("user", userData);
      } else {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("user", JSON.stringify(userData));
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
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userId");
    localStorage.removeItem("userId");
    setUser(null);
    setToken(null);
  };

  const contextValue = {
    user,
    token,
    isLoggedIn: !!user,
    login,
    logout,
  };
  
  console.log('AuthContext providing value:', contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
