import axios from 'axios';
import jwtDecode from 'jwt-decode';

interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  agreeMarketing: boolean;
}

interface DecodedToken {
  sub: string;
  roles?: string; // Single string as per JwtUtils.java
  [key: string]: any;
}

interface AuthResponse {
  token: string;
  tokenType: string;
  email: string;
  name: string;
  role: string;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log('Sending login request to:', `${API_URL}/apis/v1/login`);
    console.log('Login payload:', { email: data.email, remember: data.remember });

    const response = await axios.post(`${API_URL}/apis/v1/login`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    console.log('Login response:', response.data);
    const payload = response.data;

    const token = payload?.token;
    const tokenType = payload?.tokenType || 'Bearer';
    const email = payload?.email;
    const name = payload?.name || 'Unknown User';
    const role = payload?.role || 'CUSTOMER';

    if (!token || !email) {
      throw new Error('Dữ liệu phản hồi không hợp lệ từ máy chủ: Thiếu token hoặc email.');
    }

    // Decode token to verify contents
    let decoded: DecodedToken;
    try {
      decoded = jwtDecode(token);
      console.log('Decoded JWT:', decoded);
    } catch (e) {
      console.error('Failed to decode token:', {
        error: e,
        stack: (e as Error).stack,
      });
      throw new Error('Token không hợp lệ từ máy chủ.');
    }

    const userId = decoded.sub;
    const userRole = decoded.roles ? decoded.roles.replace('ROLE_', '') : role;

    // Store token and user data
    if (data.remember) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('user', JSON.stringify({ email, name, role: userRole }));
    }
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('user', JSON.stringify({ email, name, role: userRole }));

    console.log('Stored token:', token);
    console.log('Stored userId:', userId);
    console.log('Stored user:', { email, name, role: userRole });

    return {
      token,
      tokenType,
      email,
      name,
      role: userRole,
    };
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      responseBody: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response body',
      axiosError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      stack: error.stack,
    });
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.'
    );
  }
};

export const register = async (data: RegisterRequest): Promise<void> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    await axios.post(`${API_URL}/apis/v1/register`, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      agreeMarketing: data.agreeMarketing,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
  } catch (error: any) {
    console.error('Register error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      responseBody: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response body',
      axiosError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      stack: error.stack,
    });
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
    );
  }
};

export const socialLogin = (provider: 'google' | 'facebook') => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  window.location.href = `${API_URL}/oauth2/authorization/${provider}`;
};