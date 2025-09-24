import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

// Import interfaces from package.ts
import { Category, AreaData, Equipment } from './package';
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
// Define interfaces for request and response data
interface Stat {
  title: string;
  value: string;
  icon: string; // Expected to match Lucide icons (e.g., 'dollar-sign', 'calendar')
  color: string; // Expected to be Tailwind classes (e.g., 'text-green-600')
  change: string;
}

interface Booking {
  _id: string;
  customer: string;
  service: string;
  date: string;
  amount: number;
  status: 'confirmed' | 'completed' | 'pending' | 'cancelled';
}

interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'staff';
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

interface ServiceTag {
  id: number;
  name: string;
}

interface ItineraryDTO {
  day: number;
  description: string;
}

interface ServiceResponse {
  _id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  minDays: number;
  maxDays: number;
  minCapacity: number;
  maxCapacity: number;
  availableSlots: number;
  duration: string;
  capacity: string;
  tag: ServiceTag | null;
  averageRating: number;
  totalReviews: number;
  imageUrl: string;
  highlights: string[];
  included: string[];
  itinerary: ItineraryDTO[];
}

interface ServiceRequest {
  name: string;
  description: string;
  price: number;
  location: string;
  minDays: number;
  maxDays: number;
  minCapacity: number;
  maxCapacity: number;
  availableSlots: number;
  duration: string;
  capacity: string;
  tag: ServiceTag | null;
  highlights: string[];
  included: string[];
  itinerary: ItineraryDTO[];
}


interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bookings: number;
  spent: number;
  created_at: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  joinDate?: string;
  status?: string;
  agreeMarketing?: boolean;
  address?: string;
  createdAt?: string;
  token?: string;
}

interface CreateStaffRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'staff' | 'manager' | 'guide';
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

interface CreateGearRequest {
  name: string;
  category: string;
  area: string;
  description: string;
  quantityInStock: number;
  available: number;
  pricePerDay: number;
  total: number;
  status: 'available' | 'out_of_stock';
}

interface Location {
  _id: string;
  name: string;
  address: string;
  capacity: number;
  status: 'active' | 'inactive';
}

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  threshold: number;
  status: 'sufficient' | 'low' | 'out_of_stock';
}

interface Promotion {
  _id: string;
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
}

interface ErrorResponse {
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface ApiError {
  status: number;
  data: ErrorResponse;
  message: string;
}

/**
 * Fetch the current authenticated user
 */
export const fetchUser = async (token: string, id: number): Promise<User> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch user';

    console.error('Error fetching user:', { status, message, data });

    throw { status, data, message };
  }
};
export const fetchCurrentUser = async (token: string, p0: number): Promise<User> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    if (!token) {
      throw new Error('No authentication token provided');
    }

    let userId: string;
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.sub || decoded.id || decoded._id;
      if (!userId) {
        throw new Error('No user ID found in token');
      }
    } catch (decodeError: any) {
      console.error('JWT decode error:', {
        message: decodeError.message || 'Failed to decode JWT',
        stack: decodeError.stack || 'No stack trace',
      });
      throw new Error('Invalid token format');
    }

    const response = await axios.get(`${API_URL}/apis/v1/admin/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const userData = response.data;
    if (!userData || userData.error) {
      throw new Error(userData?.error || 'Invalid user data received from server');
    }
    if (!userData.id) {
      throw new Error('User data missing ID');
    }

    return {
      _id: userData.id,
      name: userData.name || 'Unknown User',
      email: userData.email || '',
      role: userData.role ? userData.role.replace('ROLE_', '').toUpperCase() : 'CUSTOMER',
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: userData.avatar,
      phone: userData.phone,
      department: userData.department,
      joinDate: userData.joinDate,
      status: userData.status,
      agreeMarketing: userData.agreeMarketing,
      address: userData.address,
      createdAt: userData.createdAt,
      token: userData.token,
    };
  } catch (error: any) {
    const isAxiosError = axios.isAxiosError(error);
    const status = isAxiosError ? error.response?.status || 500 : 500;
    const data = isAxiosError ? error.response?.data || {} : {};
    let message = data.error || data.message || error.message || 'Failed to fetch current user';

    if (isAxiosError) {
      if (status === 401) {
        message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
      } else if (status === 403) {
        message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
      } else if (status === 404) {
        message = 'Người dùng không tồn tại.';
      } else if (error.code === 'ERR_NETWORK') {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else if (status === 500) {
        message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
      }
    }

    console.error('fetchCurrentUser error:', {
      status,
      message,
      data,
      errorMessage: error.message || 'No error message',
      errorCode: error.code || 'No error code',
      stack: error.stack || 'No stack trace',
      response: isAxiosError && error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
      token: token ? 'Provided' : 'Missing',
    });

    throw { status, data, message } as ApiError;
  }
};
/**
 * Fetch stats
 */

export const fetchStats = async (token: string, period: string): Promise<Stat[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn('NEXT_PUBLIC_API_URL is not set. Falling back to default: http://localhost:8080');
    }

    const validPeriods: Record<string, string> = {
      daily: 'daily',
      weekly: 'weekly',
      monthly: 'monthly',
      yearly: 'yearly',
    };

    const mappedPeriod = validPeriods[period.toLowerCase()];
    if (!mappedPeriod) {
      throw new Error('Invalid period parameter. Must be one of: daily, weekly, monthly, yearly.');
    }

    console.debug('Fetching stats with URL:', `${API_URL}/apis/v1/admin/stats?period=${encodeURIComponent(mappedPeriod)}`);
    console.debug('Token:', token ? 'Provided' : 'Missing');

    const response = await axios.get(`${API_URL}/apis/v1/admin/stats?period=${encodeURIComponent(mappedPeriod)}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    console.debug('Stats response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });

    const stats = response.data;
    if (!Array.isArray(stats)) {
      throw new Error('Invalid stats data: Expected an array');
    }

    return stats;
  } catch (error: any) {
    const isAxiosError = axios.isAxiosError(error);
    const status = isAxiosError ? error.response?.status || 500 : 500;
    const data = isAxiosError ? error.response?.data || {} : {};
    let message = 'Failed to fetch stats';

    if (isAxiosError && error.response) {
      message = data.message || data.error || error.message || 'Failed to fetch stats';
    } else if (error.message) {
      message = error.message;
    } else {
      message = 'An unexpected error occurred while fetching stats';
    }

    console.error('Error fetching stats:', {
      status,
      message,
      data,
      period,
      errorMessage: error.message || 'No error message',
      errorCode: error.code || 'No error code',
      stack: error.stack || 'No stack trace',
      response: isAxiosError && error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });

    throw { status, data, message } as ApiError;
  }
};
/**
 * Fetch bookings
 */
export const fetchBookings = async (token: string): Promise<Booking[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to fetch bookings';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách đặt chỗ.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

 
    throw { status, data, message } as ApiError;
  }
};

/**
 * Check-in or check-out a booking
 */
export const checkBooking = async (token: string, bookingId: string, action: 'checkin' | 'checkout'): Promise<void> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.post(
      `${API_URL}/apis/v1/admin/bookings/${bookingId}/${action}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || `Failed to ${action} booking`;

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Đặt chỗ không tồn tại.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error(`Error ${action} booking:`, {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch staff
 */
export const fetchStaff = async (token: string): Promise<Staff[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/staff`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to fetch staff';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách nhân viên.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error fetching staff:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Create staff
 */
export const createStaff = async (token: string, staffData: CreateStaffRequest): Promise<Staff> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.post(`${API_URL}/apis/v1/admin/staff`, staffData, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to create staff';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 400) {
      message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error creating staff:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch services
 */
export const fetchServices = async (token: string): Promise<ServiceResponse[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/services`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to fetch services';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách dịch vụ.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error fetching services:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Create service
 */
export const createService = async (
  token: string,
  serviceData: ServiceRequest,
  imageFile: File | null
): Promise<ServiceResponse> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const formData = new FormData();
    formData.append('service', JSON.stringify(serviceData));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await axios.post(`${API_URL}/apis/v1/admin/services`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to create service';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 400) {
      message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error creating service:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Delete service
 */
export const deleteService = async (token: string, serviceId: string): Promise<void> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    await axios.delete(`${API_URL}/apis/v1/admin/services/${serviceId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to delete service';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Dịch vụ không tồn tại.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error deleting service:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch equipment
 */
export const fetchEquipment = async (token: string): Promise<Equipment[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/gears`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    const gears = response.data;
    if (!Array.isArray(gears)) {
      throw new Error('Invalid gears data: Expected an array');
    }

    const mapped: Equipment[] = gears.map((g: any) => ({
      _id: String(g.id || g._id),
      name: g.name || '',
      category: typeof g.category === 'string' ? g.category : String(g.category || ''),
      area: typeof g.area === 'string' ? g.area : String(g.area || ''),
      description: g.description || '',
      quantityInStock: Number(g.quantityInStock || 0),
      available: Number(g.available || 0),
      pricePerDay: Number(g.pricePerDay || 0),
      total: Number(g.total || 0),
      status: (String(g.status || 'AVAILABLE').toUpperCase() === 'OUT_OF_STOCK') ? 'OUT_OF_STOCK' : 'AVAILABLE',
      image: g.image,
      createdAt: g.createdAt,
    }));

    return mapped;
  } catch (error: any) {
    const isAxiosError = axios.isAxiosError(error);
    const status = isAxiosError ? error.response?.status || 500 : 500;
    const data = isAxiosError ? error.response?.data || {} : {};
    let message = data.error || data.message || error.message || 'Failed to fetch equipment';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách thiết bị.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error fetching equipment:', {
      status,
      message,
      data,
      errorMessage: error.message || 'No error message',
      errorCode: error.code || 'No error code',
      stack: error.stack || 'No stack trace',
      response: isAxiosError && error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });

    throw { status, data, message } as ApiError;
  }
};

/**
 * Create equipment
 */
export const createEquipment = async (
  token: string,
  equipmentData: CreateGearRequest,
  imageFile: File | null
): Promise<Equipment> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const formData = new FormData();
    formData.append('gear', JSON.stringify(equipmentData));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await axios.post(`${API_URL}/apis/v1/admin/gears`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to create equipment';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 400) {
      message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error creating equipment:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Delete equipment
 */
export const deleteEquipment = async (token: string, equipmentId: string): Promise<void> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    await axios.delete(`${API_URL}/apis/v1/admin/gears/${equipmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to delete equipment';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Thiết bị không tồn tại.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error deleting equipment:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch customers
 */
export const fetchCustomers = async (token: string): Promise<Customer[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to fetch customers';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách khách hàng.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error fetching customers:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch locations
 */
export const fetchLocations = async (token: string): Promise<Location[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/locations`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to fetch locations';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách địa điểm.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error fetching locations:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch inventory
 */
export const fetchInventory = async (token: string): Promise<Equipment[]> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  try {
    const response = await axios.get(`${API_URL}/apis/v1/admin/gears`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    const gears = response.data;
    if (!Array.isArray(gears)) {
      throw new Error('Invalid gears data: Expected an array');
    }

    const mapped: Equipment[] = gears.map((g: any) => ({
      _id: String(g.id || g._id),
      name: g.name || '',
      category: typeof g.category === 'string' ? g.category : String(g.category || ''),
      area: typeof g.area === 'string' ? g.area : String(g.area || ''),
      description: g.description || '',
      quantityInStock: Number(g.quantityInStock || 0),
      available: Number(g.available || 0),
      pricePerDay: Number(g.pricePerDay || 0),
      total: Number(g.total || 0),
      status: String(g.status || 'AVAILABLE').toUpperCase() === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'AVAILABLE',
      image: g.image,
      createdAt: g.createdAt,
    }));

    return mapped;
  } catch (error: any) {
    const isAxiosError = axios.isAxiosError(error);
    const status = isAxiosError ? error.response?.status || 500 : 500;
    const data = isAxiosError ? error.response?.data || {} : {};
    let message = data.error || data.message || error.message || 'Failed to fetch inventory';

    if (isAxiosError) {
      if (status === 401) message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
      else if (status === 403) message = 'Bạn không có quyền truy cập.';
      else if (status === 404) message = 'Không tìm thấy dữ liệu kho.';
      else if (error.code === 'ERR_NETWORK') message = 'Không kết nối được server. Kiểm tra backend có chạy không.';
    }

    console.error('Detailed error fetching inventory:', {
      url: `${API_URL}/apis/v1/admin/gears`,
      status,
      message,
      data,
      errorCode: error.code,
      response: error.response ? error.response.data : null,
    });

    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch promotions
 */
export const fetchPromotions = async (token: string): Promise<Promotion[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/promotions`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to fetch promotions';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách khuyến mãi.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error fetching promotions:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Create promotion
 */
export const createPromotion = async (
  token: string,
  promotionData: { code: string; discount: number; startDate: string; endDate: string; status: 'active' | 'expired' }
): Promise<Promotion> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.post(`${API_URL}/apis/v1/admin/promotions`, promotionData, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to create promotion';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 400) {
      message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error creating promotion:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch categories
 */
export const fetchCategories = async (token: string): Promise<Category[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to fetch categories';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách danh mục.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error fetching categories:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch areas
 */
export const fetchAreas = async (token: string): Promise<AreaData[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/areas`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    let message = data.error || data.message || error.message || 'Failed to fetch areas';

    if (status === 401) {
      message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      message = 'Không tìm thấy danh sách khu vực.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (status === 500) {
      message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    }

    console.error('Error fetching areas:', {
      status,
      message,
      data,
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    });
    throw { status, data, message } as ApiError;
  }
};