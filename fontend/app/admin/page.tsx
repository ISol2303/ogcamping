'use client';
import { AxiosError } from 'axios';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Tent,
  Users,
  ShoppingCart,
  Star,
  Package,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  MessageCircle,
  AlertTriangle,
  UserPlus,
  Calendar,
  MapPin,
  Percent,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { LucideIcon, Banknote } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  fetchStats,
  fetchBookings,
  fetchStaff,
  fetchServices,
  fetchEquipment,
  fetchCustomers,
  createStaff,
  fetchLocations,
  fetchInventory,
  fetchPromotions,
  checkBooking,
  createService,
  deleteService,
  fetchCurrentUser,
  ApiError,
} from '../api/admin';
import { jwtDecode } from 'jwt-decode';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Định nghĩa interface
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
  role: 'staff' | 'manager' | 'guide';
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

interface Equipment {
  _id: string;
  name: string;
  category: string;
  area: string;
  description: string;
  quantityInStock: number;
  available: number;
  pricePerDay: number;
  total: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK'; // Updated to match package.ts
  image?: string;
  createdAt?: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bookings: number;
  spent?: number;
  created_at: string;
}

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  role: string;
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

interface Report {
  _id: string;
  staffId: string;
  staffName: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

interface Notification {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  recipient: 'all' | 'staff' | 'managers';
}

// Ánh xạ trạng thái sang tiếng Việt
const statusMap: { [key: string]: string } = {
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  pending: 'Chờ xử lý',
  cancelled: 'Đã hủy',
  active: 'Hoạt động',
  inactive: 'Không hoạt động',
  AVAILABLE: 'Có sẵn', // Updated
  OUT_OF_STOCK: 'Hết hàng', // Updated
  sufficient: 'Đủ',
  low: 'Số lượng thấp',
  expired: 'Hết hạn',
  reviewed: 'Đã xem xét',
  resolved: 'Đã giải quyết',
};

// Ánh xạ vai trò sang tiếng Việt
const roleMap: { [key: string]: string } = {
  staff: 'Nhân viên',
  manager: 'Quản lý',
  guide: 'Hướng dẫn viên',
};

// Ánh xạ tiêu đề thống kê sang tiếng Việt
const statTitleMap: { [key: string]: string } = {
  revenue: 'Doanh thu',
  bookings: 'Số lượng đặt chỗ',
  customers: 'Khách hàng',
  ratings: 'Đánh giá',
};

const iconMap: { [key: string]: LucideIcon } = {
  vnd: Banknote,
  calendar: Calendar,
  users: Users,
  shoppingCart: ShoppingCart,
  star: Star,
};

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
const VALID_PERIODS: Period[] = ['daily', 'weekly', 'monthly', 'yearly'];

// Hàm ánh xạ trạng thái
const getStatusBadge = (status: string) => {
  const translatedStatus = statusMap[status] || status;
  switch (status) {
    case 'confirmed':
    case 'active':
    case 'AVAILABLE': // Updated
    case 'sufficient':
      return <Badge className="bg-green-100 text-green-800">{translatedStatus}</Badge>;
    case 'completed':
    case 'reviewed':
      return <Badge className="bg-blue-100 text-blue-800">{translatedStatus}</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">{translatedStatus}</Badge>;
    case 'cancelled':
    case 'inactive':
    case 'OUT_OF_STOCK': // Updated
      return <Badge className="bg-red-100 text-red-800">{translatedStatus}</Badge>;
    case 'low':
      return <Badge className="bg-orange-100 text-orange-800">{translatedStatus}</Badge>;
    case 'expired':
    case 'resolved':
      return <Badge className="bg-gray-100 text-gray-800">{translatedStatus}</Badge>;
    default:
      return <Badge variant="secondary">{translatedStatus}</Badge>;
  }
};

const createNotification = async (token: string, notification: { title: string; content: string; recipient: string }) => {
  // Giả lập API call
  console.log('Tạo thông báo:', notification);
};

// Hàm xử lý dữ liệu biểu đồ
const processChartData = (bookings: Booking[], period: Period) => {
  const labels: string[] = [];
  const revenueData: number[] = [];
  const bookingCountData: number[] = [];

  const now = new Date();
  let startDate: Date;
  let formatLabel: (date: Date) => string;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      formatLabel = (date: Date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        labels.push(formatLabel(date));
        const dailyBookings = bookings.filter(
          (b) => new Date(b.date).toDateString() === date.toDateString() && b.status === 'completed'
        );
        revenueData.push(dailyBookings.reduce((sum, b) => sum + b.amount, 0));
        bookingCountData.push(dailyBookings.length);
      }
      break;
    case 'weekly':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28);
      formatLabel = (date: Date) => `Tuần ${Math.ceil(date.getDate() / 7)}/${date.getMonth() + 1}`;
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        labels.push(formatLabel(weekStart));
        const weeklyBookings = bookings.filter(
          (b) => {
            const bookingDate = new Date(b.date);
            return bookingDate >= weekStart && bookingDate <= weekEnd && b.status === 'completed';
          }
        );
        revenueData.push(weeklyBookings.reduce((sum, b) => sum + b.amount, 0));
        bookingCountData.push(weeklyBookings.length);
      }
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      formatLabel = (date: Date) => `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      for (let i = 0; i < 6; i++) {
        const monthStart = new Date(startDate);
        monthStart.setMonth(startDate.getMonth() + i);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        labels.push(formatLabel(monthStart));
        const monthlyBookings = bookings.filter(
          (b) => {
            const bookingDate = new Date(b.date);
            return bookingDate >= monthStart && bookingDate <= monthEnd && b.status === 'completed';
          }
        );
        revenueData.push(monthlyBookings.reduce((sum, b) => sum + b.amount, 0));
        bookingCountData.push(monthlyBookings.length);
      }
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear() - 4, 0, 1);
      formatLabel = (date: Date) => `Năm ${date.getFullYear()}`;
      for (let i = 0; i < 5; i++) {
        const yearStart = new Date(startDate.getFullYear() + i, 0, 1);
        const yearEnd = new Date(yearStart.getFullYear(), 11, 31);
        labels.push(formatLabel(yearStart));
        const yearlyBookings = bookings.filter(
          (b) => {
            const bookingDate = new Date(b.date);
            return bookingDate >= yearStart && bookingDate <= yearEnd && b.status === 'completed';
          }
        );
        revenueData.push(yearlyBookings.reduce((sum, b) => sum + b.amount, 0));
        bookingCountData.push(yearlyBookings.length);
      }
      break;
  }

  return {
    labels,
    revenueData,
    bookingCountData,
  };
};

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isCreateEquipmentOpen, setIsCreateEquipmentOpen] = useState(false);
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff' as 'staff' | 'manager' | 'guide',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
  });
  const [serviceFormData, setServiceFormData] = useState<ServiceRequest>({
    name: '',
    description: '',
    price: 0,
    location: '',
    minDays: 1,
    maxDays: 1,
    minCapacity: 1,
    maxCapacity: 1,
    availableSlots: 1,
    duration: '',
    capacity: '',
    tag: null,
    highlights: [],
    included: [],
    itinerary: [],
  });
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    category: '',
    area: '',
    description: '',
    quantityInStock: 0,
    available: 0,
    pricePerDay: 0,
    status: 'AVAILABLE' as 'AVAILABLE' | 'OUT_OF_STOCK', // Updated
  });
  const [equipmentImageFile, setEquipmentImageFile] = useState<File | null>(null);
  const [notificationFormData, setNotificationFormData] = useState({
    title: '',
    content: '',
    recipient: 'all' as 'all' | 'staff' | 'customers',
  });
  const [stats, setStats] = useState<Stat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasRedirected, setHasRedirected] = useState(false);

  const handlePeriodChange = (newPeriod: string) => {
    const validPeriod = VALID_PERIODS.includes(newPeriod as Period)
      ? (newPeriod as Period)
      : 'monthly';
    setSelectedPeriod(validPeriod);
    if (newPeriod !== validPeriod) {
      console.warn('Thử chọn khoảng thời gian không hợp lệ:', newPeriod);
      setError('Khoảng thời gian không hợp lệ. Mặc định chọn hàng tháng.');
    }
  };

  useEffect(() => {
    if (hasRedirected) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (window.location.pathname.includes('/login')) return;

        let token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          setHasRedirected(true);
          router.push('/login?error=khong-co-token');
          return;
        }

        let decoded: any;
        try {
          decoded = jwtDecode(token);
        } catch (e) {
          setHasRedirected(true);
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=token-khong-hop-le');
          return;
        }

        const userData = await fetchCurrentUser(token, 1);
        setUser(userData);

        if (userData.token) {
          if (localStorage.getItem('authToken')) {
            localStorage.setItem('authToken', userData.token);
          }
          sessionStorage.setItem('authToken', userData.token);
        }

        if (userData.role !== 'ADMIN') {
          setHasRedirected(true);
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=khong-co-quyen');
          return;
        }

        if (!VALID_PERIODS.includes(selectedPeriod)) {
          console.warn('Khoảng thời gian không hợp lệ:', selectedPeriod);
          setError('Khoảng thời gian không hợp lệ. Mặc định chọn hàng tháng.');
          setSelectedPeriod('monthly');
          return;
        }

        const [
          statsData,
          bookingsData,
          staffData,
          servicesData,
          equipmentData,
          customersData,
          locationsData,
          inventoryData,
          promotionsData,
        ] = await Promise.all([
          fetchStats(token, selectedPeriod).catch((err: ApiError) => {
            console.error('Lỗi lấy thống kê:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
              period: selectedPeriod,
            });
            setError(err.message || 'Không thể lấy dữ liệu thống kê');
            return [];
          }),
          fetchBookings(token).catch((err: ApiError) => {
            console.error('Lỗi lấy đặt chỗ:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
            });
            setError(err.message || 'Không thể lấy dữ liệu đặt chỗ');
            return [];
          }),
          fetchStaff(token).catch((err: ApiError) => {
            console.error('Lỗi lấy nhân viên:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
            });
            setError(err.message || 'Không thể lấy dữ liệu nhân viên');
            return [];
          }),
          fetchServices(token).catch((err: ApiError) => {
            console.error('Lỗi lấy dịch vụ:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
            });
            setError(err.message || 'Không thể lấy dữ liệu dịch vụ');
            return [];
          }),
          fetchEquipment(token).catch((err: ApiError) => {
            console.error('Lỗi lấy thiết bị:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
            });
            setError(err.message || 'Không thể lấy dữ liệu thiết bị');
            return [];
          }),
          fetchCustomers(token).catch((err: ApiError) => {
            console.error('Lỗi lấy khách hàng:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
            });
            setError(err.message || 'Không thể lấy dữ liệu khách hàng');
            return [];
          }),
          fetchLocations(token).catch((err: ApiError) => {
            console.error('Lỗi lấy địa điểm:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
            });
            setError(err.message || 'Không thể lấy dữ liệu địa điểm');
            return [];
          }),
          fetchInventory(token).catch((err: ApiError) => {
            console.error('Lỗi lấy kho:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
            });
            setError(err.message || 'Không thể lấy dữ liệu kho');
            return [];
          }),
          fetchPromotions(token).catch((err: ApiError) => {
            console.error('Lỗi lấy khuyến mãi:', {
              message: err.message || 'Không có thông báo lỗi',
              status: err.status || 'Không có trạng thái',
              data: err.data || 'Không có dữ liệu',
            });
            setError(err.message || 'Không thể lấy dữ liệu khuyến mãi');
            return [];
          }),
        ]);

        // Validate và lọc dữ liệu để đảm bảo _id duy nhất
        const validateArray = <T extends { _id: string }>(data: T[], type: string): T[] => {
          if (!Array.isArray(data)) {
            console.warn(`Dữ liệu ${type} không hợp lệ: Cần một mảng, nhận được:`, data);
            return [];
          }
          const seenIds = new Set<string>();
          const filtered = data.filter((item, index) => {
            if (!item._id || typeof item._id !== 'string') {
              console.warn(`_id không hợp lệ trong ${type} tại vị trí ${index}:`, item);
              return false;
            }
            if (seenIds.has(item._id)) {
              console.warn(`_id trùng lặp trong ${type}: ${item._id}`);
              return false;
            }
            seenIds.add(item._id);
            return true;
          });
          return filtered;
        };

        // Xử lý đặc biệt cho thống kê (sử dụng title làm khóa)
        const validStats = Array.isArray(statsData)
          ? statsData.filter((stat, index) => {
            if (!stat.title || typeof stat.title !== 'string') {
              console.warn(`Tiêu đề không hợp lệ trong thống kê tại vị trí ${index}:`, stat);
              return false;
            }
            return true;
          })
          : [];

        setStats(validStats);
        setBookings(validateArray(bookingsData, 'đặt chỗ'));
        setStaff(validateArray(staffData, 'nhân viên'));
        setServices(validateArray(servicesData, 'dịch vụ'));
        setEquipment(validateArray(equipmentData, 'thiết bị')); // Line 677
        setCustomers(validateArray(customersData, 'khách hàng'));
        setLocations(validateArray(locationsData, 'địa điểm'));
        setInventory(validateArray(inventoryData, 'kho'));
        setPromotions(validateArray(promotionsData, 'khuyến mãi'));
      } catch (error: any) {
        const apiError: ApiError = {
          status: error.response?.status || error.status || 500,
          data: error.response?.data || error.data || {},
          message: error.response?.data?.message || error.message || 'Không thể tải dữ liệu bảng điều khiển',
        };

        console.error('Lỗi trong fetchData:', {
          status: apiError.status,
          message: apiError.message,
          data: apiError.data,
          errorMessage: error.message || 'Không có thông báo lỗi',
          errorCode: error.code || 'Không có mã lỗi',
          stack: error.stack || 'Không có dấu vết ngăn xếp',
        });

        setError(apiError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hasRedirected, router, searchParams, selectedPeriod]);

  const handleCheckInOut = async (bookingId: string, action: 'checkin' | 'checkout') => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      await checkBooking(token, bookingId, action);
      const bookingsData = await fetchBookings(token);
      setBookings(bookingsData.filter((item) => item._id && typeof item._id === 'string'));
    } catch (error: any) {
      const apiError = error as ApiError;
      setError(apiError.message || `Không thể ${action === 'checkin' ? 'nhận phòng' : 'trả phòng'}`);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      await deleteService(token, serviceId);
      const servicesData = await fetchServices(token);
      setServices(servicesData.filter((item) => item._id && typeof item._id === 'string'));
    } catch (error: any) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Không thể xóa dịch vụ');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const handleUpdateReportStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      // Giả lập API call để cập nhật trạng thái báo cáo
      console.log(`Cập nhật trạng thái báo cáo ${reportId} thành ${status}`);
      const updatedReports = reports.map((report) =>
        report._id === reportId ? { ...report, status } : report
      );
      setReports(updatedReports);
    } catch (error: any) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Không thể cập nhật trạng thái báo cáo');
    }
  };

  const handleCreateNotification = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      await createNotification(token, notificationFormData);
      setIsCreateNotificationOpen(false);
      setNotificationFormData({
        title: '',
        content: '',
        recipient: 'all',
      });
    } catch (error: any) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Không thể tạo thông báo');
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || booking.status === filterStatus)
  );

  // Dữ liệu biểu đồ
  const { labels, revenueData, bookingCountData } = processChartData(bookings, selectedPeriod);

  const revenueChartData = {
    labels,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: revenueData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const bookingCountChartData = {
    labels,
    datasets: [
      {
        label: 'Số lượng đặt chỗ',
        data: bookingCountData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Biểu đồ ${selectedPeriod === 'daily' ? 'Hàng ngày' : selectedPeriod === 'weekly' ? 'Hàng tuần' : selectedPeriod === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        {/* <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">Quản lý OG Camping</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header> */}

        <div className="container mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
              <AlertTriangle className="inline-block w-5 h-5 mr-2" />
              Lỗi: {error}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng Điều Khiển Quản Trị</h1>
            <p className="text-gray-600">Quản lý toàn bộ hoạt động cắm trại</p>
            <div className="mt-4">
              <Label htmlFor="period-select" className="mr-2">Chọn khoảng thời gian:</Label>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger id="period-select" className="w-48">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hàng ngày</SelectItem>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                  <SelectItem value="yearly">Hàng năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.length > 0 ? (
              stats.map((stat, index) => {
                const Icon = iconMap[stat.icon] || Tent;
                return (
                  <Card key={stat.title || `stat-${index}`} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{statTitleMap[stat.title.toLowerCase()] || stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <Icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-4 text-center text-gray-500">
                Không có dữ liệu thống kê
              </div>
            )}
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1 bg-gray-100 rounded-lg">
                  <TabsTrigger value="overview" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300">Tổng quan</TabsTrigger>
                  <TabsTrigger value="bookings" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300">Đặt chỗ</TabsTrigger>
                  <TabsTrigger value="staff" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300" asChild>
                    <Link href="/admin/staff/" className="whitespace-nowrap px-3 py-1">
                      Nhân viên
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger value="services" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300">Dịch vụ</TabsTrigger>
                  <TabsTrigger value="equipment" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300">Thiết bị</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-1 h-auto p-1 bg-gray-100 rounded-lg">
                  <TabsTrigger value="customers" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300">Khách hàng</TabsTrigger>
                  <TabsTrigger value="locations" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300">Địa điểm</TabsTrigger>
                  <TabsTrigger value="inventory" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300">Kho</TabsTrigger>
                  <TabsTrigger value="pricing-promotions" className="whitespace-nowrap px-3 py-2 text-sm hover:bg-green-300">Giá & KM</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tổng quan hoạt động</CardTitle>
                      <CardDescription>Thông tin tổng quan về doanh thu, đặt chỗ</CardDescription>
                    </div>
                    <Dialog open={isCreateNotificationOpen} onOpenChange={setIsCreateNotificationOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Tạo thông báo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tạo thông báo hệ thống</DialogTitle>
                          <DialogDescription>Điền thông tin để gửi thông báo đến nhân viên hoặc quản lý</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notification-title" className="text-right">Tiêu đề</Label>
                            <Input
                              id="notification-title"
                              value={notificationFormData.title}
                              onChange={(e) => setNotificationFormData({ ...notificationFormData, title: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notification-content" className="text-right">Nội dung</Label>
                            <Input
                              id="notification-content"
                              value={notificationFormData.content}
                              onChange={(e) => setNotificationFormData({ ...notificationFormData, content: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="recipient" className="text-right">Người nhận</Label>
                            <Select
                              value={notificationFormData.recipient}
                              onValueChange={(value) =>
                                setNotificationFormData({ ...notificationFormData, recipient: value as 'all' | 'staff' | 'customers' })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn người nhận" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="staff">Nhân viên</SelectItem>
                                <SelectItem value="managers">Khách Hàng</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button onClick={handleCreateNotification}>Gửi thông báo</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Doanh thu theo {selectedPeriod === 'daily' ? 'ngày' : selectedPeriod === 'weekly' ? 'tuần' : selectedPeriod === 'monthly' ? 'tháng' : 'năm'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Bar data={revenueChartData} options={chartOptions} />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Số lượng đặt chỗ theo {selectedPeriod === 'daily' ? 'ngày' : selectedPeriod === 'weekly' ? 'tuần' : selectedPeriod === 'monthly' ? 'tháng' : 'năm'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Bar data={bookingCountChartData} options={chartOptions} />
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Đặt chỗ</CardTitle>
                      <CardDescription>Xem và quản lý các đặt chỗ của khách hàng</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Lọc
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm đặt chỗ..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Dịch vụ</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                          <TableRow key={booking._id || `booking-${index}`}>
                            <TableCell className="font-medium">{booking.customer}</TableCell>
                            <TableCell>{booking.service}</TableCell>
                            <TableCell>{new Date(booking.date).toLocaleDateString('vi-VN')}</TableCell>
                            <TableCell>{booking.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCheckInOut(booking._id, 'checkin')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCheckInOut(booking._id, 'checkout')}
                                >
                                  <LogOut className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Không có dữ liệu đặt chỗ
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Nhân viên</CardTitle>
                      <CardDescription>Quản lý đội ngũ nhân viên</CardDescription>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                      <Link href="/admin/staff/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm thiết bị
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Ngày tham gia</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.length > 0 ? (
                        staff.map((member, index) => (
                          <TableRow key={member._id || `staff-${index}`}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.phone}</TableCell>
                            <TableCell>{roleMap[member.role] || member.role}</TableCell>
                            <TableCell>{new Date(member.joinDate).toLocaleDateString('vi-VN')}</TableCell>
                            <TableCell>{getStatusBadge(member.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Không có dữ liệu nhân viên
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Dịch vụ</CardTitle>
                      <CardDescription>Quản lý các dịch vụ cắm trại</CardDescription>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                      <Link href="/admin/services/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm dịch vụ
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên dịch vụ</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Địa điểm</TableHead>
                        <TableHead>Đánh giá</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.length > 0 ? (
                        services.map((service, index) => (
                          <TableRow key={service._id || `service-${index}`}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>{service.price.toLocaleString('vi-VN')} VNĐ</TableCell>
                            <TableCell>{service.location}</TableCell>
                            <TableCell>{service.averageRating} ({service.totalReviews} đánh giá)</TableCell>
                            <TableCell>{getStatusBadge('available')}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteService(service._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Không có dữ liệu dịch vụ
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Thiết bị</CardTitle>
                      <CardDescription>Quản lý thiết bị cắm trại</CardDescription>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                      <Link href="/admin/equipment/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm thiết bị
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên thiết bị</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Khu vực</TableHead>
                        <TableHead>Giá/Ngày</TableHead>
                        <TableHead>Còn lại/Tổng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipment.length > 0 ? (
                        equipment.map((item, index) => (
                          <TableRow key={item._id || `equipment-${index}`}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.area}</TableCell>
                            <TableCell>{item.pricePerDay.toLocaleString('vi-VN')} VNĐ</TableCell>
                            <TableCell>{item.available}/{item.total}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Không có dữ liệu thiết bị
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Khách hàng</CardTitle>
                      <CardDescription>Quản lý thông tin khách hàng và lịch sử đặt chỗ</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Lọc
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm khách hàng..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>Số đặt chỗ</TableHead>
                        <TableHead>Chi tiêu</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.length > 0 ? (
                        customers
                          .filter((customer) =>
                          (
                            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          )
                          .map((customer, index) => (
                            <TableRow key={customer._id || `customer-${index}`}>
                              <TableCell className="font-medium">{customer.name || 'Không có dữ liệu'}</TableCell>
                              <TableCell>{customer.email || 'Không có dữ liệu'}</TableCell>
                              <TableCell>{customer.phone || 'Không có dữ liệu'}</TableCell>
                              <TableCell>{customer.bookings || 0}</TableCell>
                              <TableCell>{(customer.spent != null ? customer.spent : 0).toLocaleString('vi-VN')} VNĐ</TableCell>
                              <TableCell>
                                {customer.created_at
                                  ? new Date(customer.created_at).toLocaleDateString('vi-VN')
                                  : 'Không có dữ liệu'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Không có dữ liệu khách hàng
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Địa điểm</CardTitle>
                      <CardDescription>Quản lý các địa điểm cắm trại</CardDescription>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                      <Link href="/admin/locations/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm địa điểm
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên địa điểm</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Sức chứa</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.length > 0 ? (
                        locations.map((location, index) => (
                          <TableRow key={location._id || `location-${index}`}>
                            <TableCell className="font-medium">{location.name}</TableCell>
                            <TableCell>{location.address}</TableCell>
                            <TableCell>{location.capacity}</TableCell>
                            <TableCell>{getStatusBadge(location.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Không có dữ liệu địa điểm
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Kho</CardTitle>
                      <CardDescription>Quản lý số lượng thiết bị và vật dụng trong kho</CardDescription>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                      <Link href="/admin/inventory/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm vật dụng
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên vật dụng</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Ngưỡng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.length > 0 ? (
                        inventory.map((item, index) => (
                          <TableRow key={item._id || `inventory-${index}`}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.threshold}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Không có dữ liệu kho
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing-promotions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Giá & Khuyến mãi</CardTitle>
                      <CardDescription>Điều chỉnh giá dịch vụ/thiết bị, tạo khuyến mãi</CardDescription>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                      <Link href="/admin/promotions/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm khuyến mãi
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pricing" className="space-y-6">
                    <TabsList className="grid w-full lg:w-auto grid-cols-2">
                      <TabsTrigger value="pricing">Quản lý giá</TabsTrigger>
                      <TabsTrigger value="promotions">Khuyến mãi</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pricing">
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Chọn dịch vụ/thiết bị từ tab tương ứng để chỉnh giá.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="promotions">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã khuyến mãi</TableHead>
                            <TableHead>Giảm giá (%)</TableHead>
                            <TableHead>Ngày bắt đầu</TableHead>
                            <TableHead>Ngày kết thúc</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {promotions.length > 0 ? (
                            promotions.map((promo, index) => (
                              <TableRow key={promo._id || `promotion-${index}`}>
                                <TableCell className="font-medium">{promo.code}</TableCell>
                                <TableCell>{promo.discount}%</TableCell>
                                <TableCell>{new Date(promo.startDate).toLocaleDateString('vi-VN')}</TableCell>
                                <TableCell>{new Date(promo.endDate).toLocaleDateString('vi-VN')}</TableCell>
                                <TableCell>{getStatusBadge(promo.status)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center">
                                Không có dữ liệu khuyến mãi
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
