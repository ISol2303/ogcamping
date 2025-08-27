import axios from 'axios';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  agreeMarketing: boolean;
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
    const response = await axios.post('http://localhost:8080/apis/v1/login', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Phản hồi từ server:', response.data);
    const payload = response.data;

    const token = payload?.token;
    const email = payload?.user?.email || payload?.email;
    const name = payload?.user?.name || payload?.fullname;
    const role = payload?.user?.role || payload?.role || 'CUSTOMER';

    if (!token || !email) {
      throw new Error('Dữ liệu phản hồi không hợp lệ từ máy chủ.');
    }

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
    await axios.post('http://localhost:8080/apis/v1/register', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Lỗi khi đăng ký:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
  }
};