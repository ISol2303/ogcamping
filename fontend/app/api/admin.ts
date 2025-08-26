import axios from 'axios';
import { PackageFormData } from './package';

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

interface Service {
  _id: string;
  name: string;
  location: string;
  price: number;
  bookings: number;
  rating: number;
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
  role: string | string[];
  avatar?: string;
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


/**
 * Fetch the current user's data
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
export async function submitEquipment(token: string, data: any) {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('area', data.area);
    formData.append('description', data.description);
    formData.append('quantity_in_stock', String(data.quantity_in_stock));
    formData.append('available', String(data.available));
    formData.append('price_per_day', String(data.price_per_day));
    formData.append('status', data.status);
    if (data.image) {
      formData.append('image', data.image);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apis/v1/gears`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      let errorData = null;
      try {
        errorData = await res.json();
      } catch {
        /* ignore parse error */
      }
      throw {
        status: res.status,
        message: errorData?.message || 'Lỗi khi thêm thiết bị',
        errorData,
      };
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error submitting equipment:', {
      status: err?.status || 500,
      message: err?.message || 'Unknown error',
      errorData: err?.errorData || null,
    });
    throw err;
  }
}


/**
 * Fetch stats for the dashboard
 */
export const fetchStats = async (token: string, period: string = 'monthly'): Promise<Stat[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/stats?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Validate response data
    if (!response.data.stats || !Array.isArray(response.data.stats)) {
      throw new Error('Invalid stats data format');
    }

    return response.data.stats as Stat[];
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch stats';

    console.error('Error fetching stats:', { status, message, data });

    throw { status, data, message };
  }
};

/**
 * Fetch bookings
 */
export const fetchBookings = async (token: string): Promise<Booking[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch bookings';

    console.error('Error fetching bookings:', { status, message, data });

    throw { status, data, message };
  }
};

/**
 * Fetch staff members
 */
export const fetchStaff = async (token: string): Promise<Staff[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/users?role=staff`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch staff';

    console.error('Error fetching staff:', { status, message, data });

    throw { status, data, message };
  }
};

/**
 * Fetch services (packages)
 */
export const fetchServices = async (token: string): Promise<Service[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/packages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch services';

    console.error('Error fetching services:', { status, message, data });

    throw { status, data, message };
  }
};

/**
 * Fetch equipment (gears)
 */
export const fetchEquipment = async (token: string): Promise<Equipment[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/gears`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch equipment';

    console.error('Error fetching equipment:', { status, message, data });

    throw { status, data, message };
  }
};

/**
 * Fetch customers
 */
export const fetchCustomers = async (token: string): Promise<Customer[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch customers';

    console.error('Error fetching customers:', { status, message, data });

    throw { status, data, message };
  }
};

/**
 * Create a new staff member
 */
export const createStaff = async (token: string, data: CreateStaffRequest): Promise<Staff> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.post(`${API_URL}/apis/v1/users`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to create staff';

    console.error('Error creating staff:', { status, message, data });

    throw { status, data, message };
  }
};
/**
 * Fetch gears (equipment)
 */
export const fetchGears = async (token: string) => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/gears`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch gears';
    console.error('Error fetching gears:', { status, message, data });
    throw { status, data, message };
  }
};

/**
 * Fetch categories
 */
export const fetchCategories = async (token: string) => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch categories';
    console.error('Error fetching categories:', { status, message, data });
    throw { status, data, message };
  }
};

/**
 * Fetch areas
 */
export const fetchAreas = async (token: string) => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_URL}/apis/v1/areas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch areas';
    console.error('Error fetching areas:', { status, message, data });
    throw { status, data, message };
  }
};
export const createPackage = async (
  token: string,
  packageData: PackageFormData,
  image?: File | null,
  gearSelections?: any
) => {
  const formData = new FormData();
  Object.entries(packageData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  if (image) {
    formData.append('image', image);
  }
  if (gearSelections) {
    formData.append('gearSelections', JSON.stringify(gearSelections));
  }

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.post(`${API_URL}/apis/v1/packages`, formData, {
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
    throw { status, data, message };
  }
};
