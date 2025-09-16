import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

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
  role?: string;
  name?: string;
  email?: string;
  exp?: number;
  [key: string]: any;
}

interface AuthResponse {
  token: string;
  id: string;
  tokenType: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface UserProfile {
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    console.log('Sending login request to:', `${API_URL}/apis/v1/login`);
    console.log('Login payload:', { email: data.email, remember: data.remember });

    const response = await axios.post(`${API_URL}/apis/v1/login`, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });

    console.log('Login response:', response.data);
    const payload = response.data;

    let token: string = payload?.token;
    const tokenType: string = payload?.tokenType || 'Bearer';
    const id: string= payload?.id;     //thêm id
    const email: string = payload?.email;
    const name: string = payload?.fullname || payload?.name || 'Unknown User';
    const role: string = payload?.role || 'CUSTOMER';

    if (!token || !email) {
      throw new Error('Dữ liệu phản hồi không hợp lệ: Thiếu token hoặc email.');
    }

    // Nếu token lỡ kèm "Bearer ", cắt ra
    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    // Decode token để kiểm tra
    let decoded: DecodedToken;
    try {
      decoded = jwtDecode<DecodedToken>(token);
      console.log('Decoded JWT:', decoded);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Token đã hết hạn.');
      }
    } catch (e) {
      console.error('Failed to decode token:', e);
      throw new Error('Token không hợp lệ từ máy chủ.');
    }

    const userId = decoded.sub;
    const userRole = decoded.role?.replace('ROLE_', '') || role;

    // ✅ SỬA 1: Lưu token và user cơ bản ngay lập tức (trước khi gọi API profile)
    if (data.remember) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('user', JSON.stringify({ email, name, role: userRole }));
    }
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('user', JSON.stringify({ email, name, role: userRole }));

    // ✅ SỬA 2: Bây giờ mới gọi API lấy profile (có token rồi nên không bị lỗi lần đầu login)

    let userProfile: UserProfile = { email, name, role: userRole };
    try {
      const profile = await getUserProfile(token);
      userProfile = { ...userProfile, ...profile };

      // cập nhật lại storage với profile đầy đủ
      if (data.remember) {
        localStorage.setItem('user', JSON.stringify(userProfile));
      }
      sessionStorage.setItem('user', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Failed to fetch user profile, using basic data:', e);
    }

    console.log('Stored token:', token);
    console.log('Stored userId:', userId);
    console.log('Stored user:', userProfile);

    return {
      token,
      tokenType,
      id: userId,
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role,
      avatar: userProfile.avatar,
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
    console.error('Register error:', error);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
    );
  }
};

export const socialLogin = (provider: 'google' | 'facebook') => {
  const authUrl = `${API_URL}/oauth2/authorization/${provider}`;
  console.log(`Redirecting to ${provider} OAuth2:`, authUrl);
  window.location.href = authUrl;
};

export const getUserProfile = async (token: string): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${API_URL}/apis/user`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });
    const { email, name, role, avatar } = response.data;
    console.log('Fetched user profile:', { email, name, role, avatar });
    return {
      email: email || '',
      name: name || 'Unknown User',
      role: role ? role.replace('ROLE_', '') : 'CUSTOMER',
      avatar: avatar || undefined,
    };
  } catch (error: any) {
    console.error('Get user profile error:', error);
    throw new Error('Không thể lấy thông tin hồ sơ người dùng.');
  }
};

// Quên mật khẩu (khách) → gửi mã về email
export const forgotPasswordApiGuest = async (email: string): Promise<string> => {
  const res = await axios.post(`${API_URL}/apis/v1/users/forgot-password`, null, {
    params: { email },
  });
  return res.data;
};

// Quên mật khẩu (người dùng đã đăng nhập) → gửi mã về email
export const forgotPasswordApiAuth = async (token: string): Promise<string> => {
  const res = await axios.post(`${API_URL}/apis/v1/users/forgot-password/authenticated`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Đặt lại mật khẩu bằng mã xác thực
export const resetPasswordApi = async (code: string, newPassword: string): Promise<string> => {
  const res = await axios.post(`${API_URL}/apis/v1/users/reset-password`, {
    code,
    newPassword,
  });
  return res.data; // server trả về message
};
