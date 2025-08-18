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
export async function submitEquipment(token: string, formData: FormData) {
  try {
    const normalizedFormData = new FormData();

    // Ép các field enum sang uppercase
    formData.forEach((value, key) => {
      if (['status', 'category', 'area'].includes(key) && typeof value === 'string') {
        normalizedFormData.append(key, value.toUpperCase());
      } else {
        normalizedFormData.append(key, value);
      }
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apis/v1/gears`, {
      method: 'POST',
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
      body: normalizedFormData,
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      let errorData: any = null;

      if (contentType && contentType.includes("application/json")) {
        errorData = await res.json();
      } else {
        errorData = await res.text();
      }

      console.error("❌ Backend trả lỗi:", {
        status: res.status,
        errorData,
      });

      throw {
        status: res.status,
        message:
          typeof errorData === "string"
            ? errorData
            : errorData?.message || `Lỗi ${res.status} khi thêm thiết bị`,
        errorData,
      };
    }

    return await res.json();
  } catch (err: any) {
    console.error("❌ Error submitting equipment:", err);
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
/**
 * Fetch staff members (only users with role "staff")
 */
export const fetchStaff = async (token: string): Promise<Staff[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Gọi API kèm query role=staff nếu backend hỗ trợ
    const response = await axios.get(`${API_URL}/apis/v1/users?role=staff`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Nếu backend không filter được thì lọc tại frontend
    const staffList = Array.isArray(response.data)
      ? response.data.filter((user: any) =>
          Array.isArray(user.role)
            ? user.role.includes('staff')
            : user.role === 'staff'
        )
      : [];

    // Chuẩn hóa dữ liệu
    return staffList.map((s: any) => ({
      _id: s.id || s._id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: 'staff',
      department: s.department || '',
      joinDate: s.joinDate || '',
      status: s.status?.toLowerCase() === 'active' ? 'active' : 'inactive',
    }));
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

    // Chuẩn hoá dữ liệu
    return response.data.map((gear: any) => ({
      _id: gear.id || gear._id, // đảm bảo có _id
      name: gear.name,
      category: gear.category,
      price_per_day: gear.pricePerDay ?? gear.price_per_day,
      available: gear.available,
      total: gear.quantityInStock ?? gear.total,
      status: gear.status.toLowerCase() as 'available' | 'out_of_stock' | 'maintenance',
    }));
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
/**
 * Fetch customers (only users with role "customer")
 */
export const fetchCustomers = async (token: string): Promise<Customer[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Gọi API với query filter role=customer (nếu backend hỗ trợ)
    const response = await axios.get(`${API_URL}/apis/v1/users?role=customer`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Nếu backend chưa filter, thì filter ở frontend
    const customers = Array.isArray(response.data)
      ? response.data.filter((user: any) =>
          Array.isArray(user.role)
            ? user.role.includes('customer')
            : user.role === 'customer'
        )
      : [];

    // Chuẩn hóa dữ liệu
    return customers.map((c: any) => ({
      _id: c.id || c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      bookings: c.bookings ?? 0,
      spent: c.spent ?? 0,
      created_at: c.created_at || c.createdAt || '',
    }));
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
