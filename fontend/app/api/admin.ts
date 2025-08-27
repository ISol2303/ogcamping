
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// Import interfaces from package.ts
import { PackageFormData, Gear, GearSelection, Category, AreaData } from './package';

// Define interfaces for request and response data
interface Stat {
  title: string;
  value: string;
  icon: string;
  color: string;
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

interface Package {
  rating: number;
  bookings: number;
  _id: string;
  name: string;
  location: string;
  days: number;
  food_type: string;
  tent_type: string;
  activities: string;
  max_people: number;
  available_slots: number;
  price: number;
  description: string;
  status: 'active' | 'inactive';
}

interface Equipment {
  _id: string;
  name: string;
  category: string;
  price_per_day: number;
  available: number;
  total: number;
  status: 'available' | 'out_of_stock';
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
  password_hash: string;
  phone: string;
  role: 'staff' | 'manager' | 'guide';
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

interface SubmitEquipmentRequest {
  name: string;
  category: string;
  area: string;
  description: string;
  quantity_in_stock: number;
  image: File | null;
  available: number;
  price_per_day: number;
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
export const fetchCurrentUser = async (token: string, p0: number): Promise<User> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log('Sending request to fetchCurrentUser with URL:', `${API_URL}/apis/v1/users/me`);
    console.log('Token:', token || 'No token provided');

    if (!token) {
      throw new Error('No token provided for fetchCurrentUser');
    }

    const decoded: any = jwtDecode(token);
    const userId = decoded.sub || decoded.id || decoded._id;
    if (!userId) {
      throw new Error('No user ID found in token');
    }

    const response = await axios.get(`${API_URL}/apis/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // Increased timeout
    });

    console.log('fetchCurrentUser response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
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
      token: response.data.token,
    };
  } catch (error: any) {
    let status = 500;
    let data: ErrorResponse = {};
    let message = 'Failed to fetch current user';

    if (axios.isAxiosError(error)) {
      status = error.response?.status || 500;
      data = error.response?.data || {};
      message = data?.error || data?.message || error.message || message;
      if (!error.response) {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      }
    } else if (error instanceof Error) {
      message = error.message || message;
    } else {
      message = String(error) || message;
    }

    console.error('fetchCurrentUser error:', {
      status,
      message,
      data,
      code: error.code,
      url: error.config?.url || 'Unknown URL',
      headers: error.config?.headers || 'No headers',
      responseHeaders: error.response?.headers || 'No response headers',
      responseBody: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response body',
      axiosError: axios.isAxiosError(error) ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2) : 'Not an Axios error',
      networkError: axios.isAxiosError(error) ? error.message : 'Not an Axios error',
      stack: error.stack,
    });

    const apiError: ApiError = {
      status,
      data,
      message,
    };

    if (status === 401) {
      apiError.message = 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      apiError.message = 'Bạn không có quyền truy cập. Vui lòng kiểm tra vai trò.';
    } else if (status === 404) {
      apiError.message = 'Người dùng không tồn tại.';
    } else if (error.code === 'ERR_NETWORK') {
      apiError.message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (!error.response) {
      apiError.message = 'Lỗi không xác định. Vui lòng thử lại sau.';
    }

    throw apiError;
  }
};

/**
 * Fetch stats
 */
export const fetchStats = async (token: string, period: string = 'monthly'): Promise<Stat[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { period },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch stats';
    console.error('Error fetching stats:', { status, message, data });
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
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch bookings';
    console.error('Error fetching bookings:', { status, message, data });
    throw { status, data, message } as ApiError;
  }
};
export const createEquipment = async (token: string, equipmentData: SubmitEquipmentRequest): Promise<Equipment> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const formData = new FormData();
    formData.append('name', equipmentData.name);
    formData.append('category', equipmentData.category);
    formData.append('area', equipmentData.area);
    formData.append('description', equipmentData.description);
    formData.append('quantity_in_stock', equipmentData.quantity_in_stock.toString());
    formData.append('available', equipmentData.available.toString());
    formData.append('price_per_day', equipmentData.price_per_day.toString());
    formData.append('status', equipmentData.status);
    if (equipmentData.image) {
      formData.append('image', equipmentData.image);
    }

    const response = await axios.post(`${API_URL}/apis/v1/admin/gears`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to create equipment';
    console.error('Error creating equipment:', { status, message, data });
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
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch staff';
    console.error('Error fetching staff:', { status, message, data });
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
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to create staff';
    console.error('Error creating staff:', { status, message, data });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch services
 */
export const fetchServices = async (token: string): Promise<Package[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/services`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch services';
    console.error('Error fetching services:', { status, message, data });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Delete service
 */
export const deleteServices = async (token: string, packageId: string): Promise<void> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.delete(`${API_URL}/apis/v1/admin/services/${packageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to delete service';
    console.error('Error deleting service:', { status, message, data });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Create package
 */
export const createPackage = async (
  token: string,
  packageData: PackageFormData,
  image: File | null,
  gearSelections: GearSelection[]
): Promise<Package> => {
  const formData = new FormData();
  formData.append('name', packageData.name);
  formData.append('location', packageData.location);
  formData.append('days', packageData.days);
  formData.append('food_type', packageData.food_type || '');
  formData.append('tent_type', packageData.tent_type || '');
  formData.append('activities', packageData.activities || '');
  formData.append('max_people', packageData.max_people);
  formData.append('available_slots', packageData.available_slots);
  formData.append('price', packageData.price);
  formData.append('description', packageData.description || '');
  formData.append('status', 'active'); // Default status

  if (image) {
    formData.append('image', image);
  }
  if (gearSelections && gearSelections.length > 0) {
    formData.append('gearSelections', JSON.stringify(gearSelections));
  }

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.post(`${API_URL}/apis/v1/admin/services`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to create package';
    console.error('Error creating package:', { status, message, data });
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
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch equipment';
    console.error('Error fetching equipment:', { status, message, data });
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
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch customers';
    console.error('Error fetching customers:', { status, message, data });
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
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch locations';
    console.error('Error fetching locations:', { status, message, data });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch inventory
 */
export const fetchInventory = async (token: string): Promise<InventoryItem[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch inventory';
    console.error('Error fetching inventory:', { status, message, data });
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
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch promotions';
    console.error('Error fetching promotions:', { status, message, data });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Create promotion
 */
export const createPromotion = async (token: string, promotionData: { code: string; discount: number; startDate: string; endDate: string; status: 'active' | 'expired' }): Promise<Promotion> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.post(`${API_URL}/apis/v1/admin/promotions`, promotionData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to create promotion';
    console.error('Error creating promotion:', { status, message, data });
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
      }
    );
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || `Failed to ${action} booking`;
    console.error(`Error ${action} booking:`, { status, message, data });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch gears
 */
export const fetchGears = async (token: string): Promise<Gear[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/gears`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch gears';
    console.error('Error fetching gears:', { status, message, data });
    throw { status, data, message } as ApiError;
  }
};

/**
 * Fetch categories (Placeholder until backend endpoint is added)
 */
export const fetchCategories = async (token: string): Promise<Category[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch categories (endpoint not implemented)';
    console.error('Error fetching categories:', { status, message, data });
    return []; // Return empty array as fallback
  }
};

/**
 * Fetch areas (Placeholder until backend endpoint is added)
 */
export const fetchAreas = async (token: string): Promise<AreaData[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/admin/areas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch areas (endpoint not implemented)';
    console.error('Error fetching areas:', { status, message, data });
    return []; // Return empty array as fallback
  }
};
