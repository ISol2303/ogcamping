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
  tokenType: string;
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
    const tokenType = payload?.tokenType || 'Bearer';
    const email = payload?.email;
    const name = payload?.fullname; // backend trả fullname
    const role = payload?.role || 'CUSTOMER';

    if (!token || !email) {
      throw new Error('Dữ liệu phản hồi không hợp lệ từ máy chủ.');
    }

    // Store token và user data
    localStorage.setItem('authToken', `${tokenType} ${token}`);
    localStorage.setItem('user', JSON.stringify({ email, name, role }));

    return {
      token,
      tokenType,
      user: {
        email,
        name,
        role,
      },
    };
  } catch (error: any) {
    console.error('Lỗi khi đăng nhập:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo máy chủ đang chạy.');
    }
    throw new Error(
      error.response?.data && typeof error.response.data === 'string'
        ? error.response.data
        : 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.'
    );
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
    throw new Error(
      typeof error.response?.data === 'string'
        ? error.response.data
        : 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
    );
  }
};
