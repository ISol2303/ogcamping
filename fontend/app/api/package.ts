import axios from 'axios';
import { ItineraryItem } from '../admin/services/new/components/package-confirmation';

export interface User {
  _id: string;
  role: string;
}

export interface Gear {
  _id: string;
  name: string;
  category: string;
  area: string;
  imageUrl?: string;
  price?: number; // Keep price optional
}

export interface Category {
  _id: string;
  name: string;
}

export interface AreaData {
  _id: string;
  name: string;
}

export interface GearSelection {
  gear_id: string;
  gear_quantity: number;
  area: string;
}
export interface Equipment {
  _id: string;
  name: string;
  category: string; // Matches Category.CategoryName (enum value as string)
  area: string; // Matches Area.AreaName (enum value as string)
  description: string;
  quantityInStock: number;
  available: number;
  pricePerDay: number;
  total: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK'; // Matches Gear.GearStatus
  image?: string; // URL of the uploaded image
  createdAt?: string; // ISO string for LocalDateTime
}
export interface PackageFormData {
  name: string;
  location: string;
  days: string;
  food_type: string;
  tent_type: string;
  activities: string;
  max_people: number;
  available_slots: number;
  price: number;
  description: string;

  tag: ServiceTag;  // chỉ cho phép giá trị trong union
  duration: string;
  capacity: string;
  isExperience: boolean;
  minDays: number;
  maxDays: number;
  peoplePerSession: number;

  minCapacity: number;
  maxCapacity: number;
  defaultSlotsPerDay: number;

  allowExtraPeople: boolean;
  extraFeePerPerson: number;
  maxExtraPeople: number;

  highlights: [];
  included: [];
  itinerary: ItineraryItem[];
}

type ServiceTag = "NEW" | "DISCOUNT" | "POPULAR" | "";

export const fetchUser = async (): Promise<User> => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const userResponse = await axios.get('http://localhost:8080/apis/v1/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return userResponse.data;
  } catch (err: any) {
    console.error('Lỗi khi lấy thông tin người dùng:', err);
    throw err;
  }
};

export const fetchGears = async (): Promise<Gear[]> => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const gearResponse = await axios.get('http://localhost:8080/apis/v1/gears', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!Array.isArray(gearResponse.data)) {
      console.error('Dữ liệu thiết bị không đúng định dạng:', gearResponse.data);
      throw new Error('Dữ liệu thiết bị không đúng định dạng');
    }
    // Validate gear fields and map price_per_day to price
    const gears = gearResponse.data.map((gear: any) => {
      if (!gear._id || !gear.name || !gear.category || !gear.area) {
        console.warn('Thiết bị không hợp lệ:', gear);
        throw new Error('Thiết bị thiếu các trường bắt buộc (_id, name, category, area)');
      }
      return {
        _id: gear._id,
        name: gear.name,
        category: gear.category,
        area: gear.area,
        imageUrl: gear.imageUrl,
        price: gear.price_per_day != null ? Number(gear.price_per_day) : undefined, // Map price_per_day to price
      };
    });
    console.log('Danh sách thiết bị:', gears); // Debug log
    return gears;
  } catch (err: any) {
    console.error('Lỗi khi lấy danh sách thiết bị:', err);
    throw new Error(`Không thể tải danh sách thiết bị: ${err.response?.data?.error || err.message}`);
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('No token found');
  }


  try {
    const categoryResponse = await axios.get('http://localhost:8080/apis/v1/category', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!Array.isArray(categoryResponse.data)) {
      console.error('Dữ liệu danh mục không đúng định dạng:', categoryResponse.data);
      throw new Error('Dữ liệu danh mục không đúng định dạng');
    }
    console.log('Danh sách danh mục:', categoryResponse.data); // Debug log
    return categoryResponse.data;
  } catch (err: any) {
    console.error('Lỗi khi lấy danh sách danh mục:', err);
    throw new Error(`Không thể tải danh sách danh mục: ${err.response?.data?.error || err.message}`);
  }
};

export const fetchAreas = async (): Promise<AreaData[]> => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const areaResponse = await axios.get('http://localhost:8080/apis/v1/areas', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!Array.isArray(areaResponse.data)) {
      console.error('Dữ liệu khu vực không đúng định dạng:', areaResponse.data);
      throw new Error('Dữ liệu khu vực không đúng định dạng');
    }
    console.log('Danh sách khu vực:', areaResponse.data); // Debug log
    return areaResponse.data;
  } catch (err: any) {
    console.error('Lỗi khi lấy danh sách khu vực:', err);
    throw new Error(`Không thể tải danh sách khu vực: ${err.response?.data?.error || err.message}`);
  }
};

export const submitPackage = async (
  formData: PackageFormData,
  image: File | null,
  gearSelections: GearSelection[]
): Promise<any> => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const packageFormData = new FormData();
    packageFormData.append('name', formData.name);
    packageFormData.append('location', formData.location);
    packageFormData.append('days', formData.days);
    if (formData.food_type) packageFormData.append('food_type', formData.food_type);
    if (formData.tent_type) packageFormData.append('tent_type', formData.tent_type);
    if (formData.activities) packageFormData.append('activities', formData.activities);
    packageFormData.append('max_people', String(formData.max_people));
    packageFormData.append('available_slots', String(formData.available_slots));
    packageFormData.append('price', String(formData.price));
    if (formData.description) packageFormData.append('description', formData.description);
    if (image) packageFormData.append('image', image);

    const packageResponse = await axios.post('http://localhost:8080/apis/v1/packages', packageFormData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const packageId = packageResponse.data._id;

    for (const selection of gearSelections) {
      await axios.post(
        'http://localhost:8080/apis/v1/package-gears',
        {
          package_id: packageId,
          gear_id: selection.gear_id,
          gear_quantity: selection.gear_quantity,
          area: selection.area,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    }

    return packageResponse.data;
  } catch (err: any) {
    console.error('Lỗi khi gửi gói dịch vụ:', err);
    throw new Error(err.response?.data?.error || 'Lỗi khi tạo dịch vụ');
  }
};