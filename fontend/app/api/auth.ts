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
  user: {
    email: string;
    name: string;
    role: string;
  };
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
    const email = payload?.user?.email || payload?.email;
    const name = payload?.user?.name || payload?.fullname;
    const role = payload?.user?.role || payload?.role || 'CUSTOMER';

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


    // Store token and user data
    localStorage.setItem('authToken', token);
    
    localStorage.setItem('user', JSON.stringify({ email, name, role }));

    return {
      token,
      user: {
        email,
        name,
        role,
      },
    };
  } catch (error: any) {
    console.error('Lỗi khi đăng nhập:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
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
    console.error('Lỗi khi đăng ký:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
  }

};