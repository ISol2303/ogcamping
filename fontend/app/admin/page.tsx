'use client';
<<<<<<< HEAD

import type React from 'react';
import { useState, useEffect } from 'react';
import { fetchUser, fetchStats, fetchBookings, fetchStaff, fetchServices, fetchEquipment, fetchCustomers, createStaff } from '@/app/api/admin';
=======
import { AxiosError } from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
=======
  MapPin,
  Percent,
  FileText,
  CheckCircle,
>>>>>>> 4b112d9 (Add or update frontend & backend code)
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
<<<<<<< HEAD
import { AxiosError } from 'axios';

// Define interfaces for data structures
=======
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  ApiError,
  fetchUser,
} from '../api/admin';
import jwtDecode from 'jwt-decode';

>>>>>>> 4b112d9 (Add or update frontend & backend code)
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

<<<<<<< HEAD
interface Service {
  _id: string;
  name: string;
  location: string;
  price: number;
  bookings: number;
  rating: number;
  status: 'active' | 'inactive';
}

=======
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;

  minDays: number;
  maxDays: number;
  minCapacity: number;
  maxCapacity: number;
  isExperience: boolean;
  active: boolean | null;

  averageRating: number;
  totalReviews: number;
  duration: string;   // ví dụ "2-3 ngày"
  capacity: string;   // ví dụ "4-6 người"

  tag: 'POPULAR' | 'NEW' | 'DISCOUNT' | null;
  imageUrl: string;
  extraImageUrls: string[];

  highlights: string[];
  included: string[];

  allowExtraPeople: boolean | null;
  extraFeePerPerson: number | null;
  maxExtraPeople: number | null;

  requireAdditionalSiteIfOver: boolean | null;

  itinerary: Itinerary[];
  availability: ServiceAvailability[];
}

export interface Itinerary {
  day: number;
  title: string;
  activities: string[];
}

export interface ServiceAvailability {
  id: number;
  date: string;
  totalSlots: number;
  bookedSlots: number;
}


>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
  _id: string; // Changed from 'id' to '_id' to match app/api/admin.ts
=======
  _id: string;
  firstName?: string;
  lastName?: string;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
  name: string;
  email: string;
  role: string | string[];
  avatar?: string;
<<<<<<< HEAD
=======
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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
}

const iconMap: { [key: string]: LucideIcon } = {
  dollar: DollarSign,
  calendar: Calendar,
  users: Users,
  shoppingCart: ShoppingCart,
  star: Star,
};
<<<<<<< HEAD

=======
const getTodayAvailability = (availability: ServiceAvailability[]): string => {
  const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd
  const todayAvailability = availability.find((a) => a.date === today);

  if (!todayAvailability) return "Không có dữ liệu";

  const remaining = todayAvailability.totalSlots - todayAvailability.bookedSlots;
  return remaining > 0 ? `Còn ${remaining} chỗ` : "Hết chỗ";
};
>>>>>>> 4b112d9 (Add or update frontend & backend code)
export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff' as 'staff',
    department: '',
  });
  const [stats, setStats] = useState<Stat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
<<<<<<< HEAD
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchStaff, setSearchStaff] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchBookings, setSearchBookings] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [selectedTab, setSelectedTab] = useState(initialTab);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || '1';
      console.log('Token found:', token ? 'Yes' : 'No', token);
      console.log('UserId found:', userId);

      if (!token) {
        console.log('No token found, redirecting to /login');
        setError('Không tìm thấy token xác thực');
        router.push(`/login?error=${encodeURIComponent('Missing token')}`);
        return;
      }

      try {
        // Fetch user data
        const userData = await fetchUser(token, Number(userId));
        console.log('User response:', JSON.stringify(userData, null, 2));

        // Normalize role to string for comparison
        const userRole = Array.isArray(userData.role) ? userData.role[0] : userData.role;
        if (userRole.toUpperCase() !== 'ADMIN') {
          console.log('User is not ADMIN, redirecting to /login. Role:', userRole);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('userId');
          router.push(`/login?error=${encodeURIComponent('User is not ADMIN')}`);
          return;
        }

        // Store user data and userId
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userId);
        setUser(userData);

        // Fetch other data
        const [statsData, bookingsData, staffData, servicesData, equipmentData, customersData] = await Promise.all([
          fetchStats(token, selectedPeriod),
          fetchBookings(token),
          fetchStaff(token),
          fetchServices(token),
          fetchEquipment(token),
          fetchCustomers(token),
        ]);

        console.log('Fetched data:', {
          stats: statsData,
          bookings: bookingsData,
          staff: staffData,
          services: servicesData,
          equipment: equipmentData,
          customers: customersData,
        });

        setStats(statsData);
        setBookings(bookingsData);
        setStaff(staffData);
        setServices(servicesData);
        setEquipment(equipmentData);
        setCustomers(customersData);
      } catch (error) {
        const axiosError = error as AxiosError<{ error?: string }>;
        const status = axiosError.response?.status || 500;
        const data = axiosError.response?.data || {};
        const message = axiosError.response?.data?.error || axiosError.message || 'Failed to fetch data';

        console.error('Error fetching data:', { status, message, data });

        if (status === 401 || status === 403) {
          console.log('Unauthorized or forbidden, clearing tokens and redirecting to /login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('userId');
          router.push(`/login?error=${encodeURIComponent('Unauthorized or forbidden')}`);
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
=======
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serviceSearchTerm, setServiceSearchTerm] = useState("")
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all")
  const [serviceLocationFilter, setServiceLocationFilter] = useState("all")
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (hasRedirected) {
      console.log('Redirect already occurred, skipping fetchData');
      return;
    }

    const fetchData = async () => {
      try {
        if (window.location.pathname.includes('/login')) {
          console.log('Already on login page, skipping fetchData');
          return;
        }

        let token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        console.log('Retrieved token:', token ? token : 'No token found');

        if (!token) {
          console.log('No token found, redirecting to login');
          setHasRedirected(true);
          router.push('/login?error=no-token');
          return;
        }

        let decoded: any;
        try {
          decoded = jwtDecode(token);
          console.log('Decoded token before fetchCurrentUser:', decoded);
        } catch (e) {
          console.error('Failed to decode token:', {
            error: e,
            stack: (e as Error).stack,
          });
          setHasRedirected(true);
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=invalid-token');
          return;
        }

        console.log('Calling fetchCurrentUser with token');
        const userData = await fetchUser(token, 1);
        console.log('Received userData:', userData);
        setUser(userData);

        if (userData.token) {
          console.log('New token received:', userData.token);
          if (localStorage.getItem('authToken')) {
            localStorage.setItem('authToken', userData.token);
          }
          sessionStorage.setItem('authToken', userData.token);
        }

        if (userData.role !== 'ADMIN') {
          console.log('User is not an admin, redirecting to login');
          setHasRedirected(true);
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=unauthorized');
          return;
        }

        console.log('Fetching additional data with token');
        const [
          // statsData,
          // bookingsData,
          // staffData,
          servicesData,
          // equipmentData,
          // customersData,
          // locationsData,
          // inventoryData,
          // promotionsData,
        ] = await Promise.all([
          // fetchStats(token, selectedPeriod),
          // fetchBookings(token),
          // fetchStaff(token),
          fetchServices(token),
          // fetchEquipment(token),
          // fetchCustomers(token),
          // fetchLocations(token),
          // fetchInventory(token),
          // fetchPromotions(token),
        ]);

        // setStats(statsData);
        // setBookings(bookingsData);
        // setStaff(staffData);
        // setEquipment(equipmentData);
        // setCustomers(customersData);
        // setLocations(locationsData);
        // setInventory(inventoryData);
        // setPromotions(promotionsData);
        setServices(servicesData)
      } catch (error: any) {
        const apiError: ApiError = error.status
          ? error
          : {
            status: error.response?.status || 500,
            data: error.response?.data || {},
            message:
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              'Failed to load dashboard data',
          };

        // console.error('Error fetching data:', {
        //   message: apiError.message,
        //   status: apiError.status,
        //   data: apiError.data,
        //   responseBody: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response body',
        //   axiosError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
        //   stack: error.stack,
        // });

        setError(apiError.message);
        if (apiError.status === 401) {
          console.log('401 Unauthorized, clearing tokens and redirecting');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          setHasRedirected(true);
          router.push('/login?error=unauthenticated');
        } else if (apiError.status === 403) {
          console.log('403 Forbidden, clearing tokens and redirecting');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          setHasRedirected(true);
          router.push('/login?error=unauthorized');
        } else {
          // console.error('Unexpected error, setting error state');
          setError(apiError.message || 'Lỗi không xác định. Vui lòng thử lại.');
        }
>>>>>>> 4b112d9 (Add or update frontend & backend code)
      }
    };

    fetchData();
<<<<<<< HEAD
  }, [router, selectedPeriod]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const staffData = await createStaff(token, {
        name: staffFormData.fullName,
        email: staffFormData.email,
        password_hash: staffFormData.password,
        phone: staffFormData.phone,
        role: staffFormData.role,
        department: staffFormData.department,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });

      setStaff([...staff, staffData]);
      setIsCreateStaffOpen(false);
      setStaffFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
        department: '',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const message = axiosError.response?.data?.error || axiosError.message || 'Failed to create staff';
      setError(message);
    }
  };

  const handleLogout = () => {
    console.log('Logging out, clearing tokens');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userId');
    router.push('/login');
  };
=======
  }, [router, selectedPeriod, hasRedirected]);
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  // lọc dịch vụ theo search + filter
  const filteredServices = services.filter((s) => {
    const searchTerm = serviceSearchTerm.toLowerCase()

    // ✅ chuyển active -> string để so sánh
    const statusValue = s.active ? "active" : "inactive"

    // ✅ hỗ trợ tiếng Việt (có dấu / không dấu)
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt

    const matchSearch =
      normalize(s.name).includes(normalize(searchTerm)) ||
      normalize(s.location).includes(normalize(searchTerm))

    const matchStatus =
      serviceStatusFilter === "all" || statusValue === serviceStatusFilter

    const matchLocation =
      serviceLocationFilter === "all" ||
      normalize(s.location) === normalize(serviceLocationFilter)

    return matchSearch && matchStatus && matchLocation
  })

  const handleCheckInOut = async (
    bookingId: string,
    action: 'checkin' | 'checkout'
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      await checkBooking(token, bookingId); // bookingId giờ là string
      const bookingsData = await fetchBookings(token);
      setBookings(bookingsData);
    } catch (error: any) {
      const apiError = error as ApiError;
      setError(apiError.message || `Failed to ${action} booking`);
    }
  };
  const getServiceBadge = (active: boolean | null) => {
    if (active === true) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          Hoạt động
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
        Tạm dừng
      </span>
    );
  };
  // phan trang 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lọc + sắp xếp dữ liệu
  const sortedServices = useMemo(() => {
    return [...filteredServices].reverse(); // record cuối cùng lên đầu
  }, [filteredServices]);

  // Tính số trang
  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);

  // Cắt dữ liệu cho trang hiện tại
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedServices.slice(start, end);
  }, [sortedServices, currentPage]);

>>>>>>> 4b112d9 (Add or update frontend & backend code)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
<<<<<<< HEAD
        return <Badge className="bg-green-100 text-green-800 border-0">Đã xác nhận</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-0">Hoàn thành</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">Chờ xử lý</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-0">Đã hủy</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-0">Hoạt động</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-0">Tạm dừng</Badge>;
      case 'available':
        return <Badge className="bg-green-100 text-green-800 border-0">Còn hàng</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800 border-0">Hết hàng</Badge>;
      default:
        return <Badge variant="secondary" className="border-0">Không xác định</Badge>;
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchStaff.toLowerCase()) &&
      (filterDepartment === 'all' || member.department === filterDepartment)
  );

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.customer.toLowerCase().includes(searchBookings.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchBookings.toLowerCase())) &&
      (filterStatus === 'all' || booking.status === filterStatus)
  );

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Tent className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">OG Camping Admin</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Settings className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarImage src={user.avatar ?? '/images/default-avatar.png'} />
              <AvatarFallback>{user.name?.[0] ?? 'AD'}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Quản trị</h1>
          <p className="text-gray-600">Quản lý hệ thống OG Camping</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{error}</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Star;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change} so với tháng trước</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 border-gray-300">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Tháng này</SelectItem>
              <SelectItem value="weekly">Tuần này</SelectItem>
              <SelectItem value="daily">Hôm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-6 bg-gray-100">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Dịch vụ
            </TabsTrigger>
            <TabsTrigger
              value="equipment"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Thiết bị
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Khách hàng
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Nhân viên
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Đơn hàng gần đây</CardTitle>
                  <CardDescription>Các đơn đặt dịch vụ mới nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredBookings.slice(0, 4).map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-3 border rounded-lg border-gray-200"
                      >
                        <div>
                          <h4 className="font-medium">{booking.customer}</h4>
                          <p className="text-sm text-gray-600">{booking.service}</p>
                          <p className="text-xs text-gray-500">{booking.date}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                          <p className="text-sm font-medium mt-1">
                            {booking.amount.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
                    asChild
                  >
                    <Link href="/admin/bookings">Xem tất cả đơn hàng</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Thao tác nhanh</CardTitle>
                  <CardDescription>Các tính năng quản lý thường dùng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-green-600 hover:bg-green-700 text-white border-0"
                    asChild
                  >
                    <Link href="/admin/services/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm dịch vụ mới
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                    asChild
                  >
                    <Link href="/admin/equipment">
                      <Package className="w-4 h-4 mr-2" />
                      Quản lý kho thiết bị
                    </Link>
                  </Button>
                  <Dialog open={isCreateStaffOpen} onOpenChange={setIsCreateStaffOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Thêm nhân viên
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-0">
                      <DialogHeader>
                        <DialogTitle>Tạo tài khoản nhân viên</DialogTitle>
                        <DialogDescription>
                          Điền thông tin để tạo tài khoản nhân viên mới
                        </DialogDescription>
                      </DialogHeader>
                      {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">
                          {error}
                        </div>
                      )}
                      <form onSubmit={handleCreateStaff} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="staffName">Họ và tên *</Label>
                            <Input
                              id="staffName"
                              value={staffFormData.fullName}
                              onChange={(e) =>
                                setStaffFormData((prev) => ({ ...prev, fullName: e.target.value }))
                              }
                              placeholder="Nguyễn Văn A"
                              className="border-gray-300 focus:border-green-500"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="staffEmail">Email *</Label>
                            <Input
                              id="staffEmail"
                              type="email"
                              value={staffFormData.email}
                              onChange={(e) =>
                                setStaffFormData((prev) => ({ ...prev, email: e.target.value }))
                              }
                              placeholder="email@ogcamping.vn"
                              className="border-gray-300 focus:border-green-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="staffPhone">Số điện thoại *</Label>
                            <Input
                              id="staffPhone"
                              value={staffFormData.phone}
                              onChange={(e) =>
                                setStaffFormData((prev) => ({ ...prev, phone: e.target.value }))
                              }
                              placeholder="0123456789"
                              className="border-gray-300 focus:border-green-500"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="staffRole">Vai trò *</Label>
                            <Select
                              value={staffFormData.role}
                              onValueChange={(value) =>
                                setStaffFormData((prev) => ({
                                  ...prev,
                                  role: value as 'staff',
                                }))
                              }
                            >
                              <SelectTrigger className="border-gray-300 focus:border-green-500">
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="staff">Nhân viên</SelectItem>
                                <SelectItem value="manager">Quản lý</SelectItem>
                                <SelectItem value="guide">Hướng dẫn viên</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="staffDepartment">Bộ phận</Label>
                          <Select
                            value={staffFormData.department}
                            onValueChange={(value) =>
                              setStaffFormData((prev) => ({ ...prev, department: value }))
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:border-green-500">
                              <SelectValue placeholder="Chọn bộ phận" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="guide">Hướng dẫn viên</SelectItem>
                              <SelectItem value="equipment">Kho thiết bị</SelectItem>
                              <SelectItem value="tour">Quản lý tour</SelectItem>
                              <SelectItem value="customer">Chăm sóc khách hàng</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="staffPassword">Mật khẩu tạm thời *</Label>
                          <Input
                            id="staffPassword"
                            type="password"
                            value={staffFormData.password}
                            onChange={(e) =>
                              setStaffFormData((prev) => ({ ...prev, password: e.target.value }))
                            }
                            placeholder="••••••••"
                            className="border-gray-300 focus:border-green-500"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Nhân viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu
                          </p>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
                          >
                            Tạo tài khoản
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateStaffOpen(false)}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Hủy
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                    asChild
                  >
                    <Link href="/admin/reports">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Xem báo cáo chi tiết
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Cảnh báo hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipment.some((item) => item.available === 0) && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Thiết bị sắp hết</p>
                        <p className="text-sm text-yellow-700">
                          {equipment.find((item) => item.available === 0)?.name} đã hết hàng, cần nhập thêm
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Đánh giá mới</p>
                      <p className="text-sm text-blue-700">5 đánh giá mới cần phản hồi từ khách hàng</p>
                    </div>
                  </div>
                </div>
=======
      case 'active':
      case 'available':
      case 'sufficient':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600 text-white">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      case 'cancelled':
      case 'inactive':
      case 'out_of_stock':
        return <Badge className="bg-red-600 text-white">Inactive</Badge>;
      case 'low':
        return <Badge className="bg-orange-600 text-white">Low</Badge>;
      case 'expired':
        return <Badge className="bg-gray-600 text-white">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <Link href="/" className="block px-4 py-3 text-2xl">
          Admin Dashboard
        </Link>
        <nav className="mt-4">
          <Link href="/admin" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <BarChart3 className="inline-block w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link href="/admin/bookings" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Calendar className="inline-block w-5 h-5 mr-2" />
            Bookings
          </Link>
          <Link href="/admin/staff" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Users className="inline-block w-5 h-5 mr-2" />
            Staff
          </Link>
          <Link href="/admin/services" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Tent className="inline-block w-5 h-5 mr-2" />
            Services
          </Link>
          <Link href="/admin/combo" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Tent className="inline-block w-5 h-5 mr-2" />
            Combo
          </Link>
          <Link href="/admin/equipment" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Package className="inline-block w-5 h-5 mr-2" />
            Equipment
          </Link>
          <Link href="/admin/customers" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Users className="inline-block w-5 h-5 mr-2" />
            Customers
          </Link>
          <Link href="/admin/locations" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <MapPin className="inline-block w-5 h-5 mr-2" />
            Locations
          </Link>
          <Link href="/admin/inventory" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Package className="inline-block w-5 h-5 mr-2" />
            Inventory
          </Link>
          <Link href="/admin/promotions" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Percent className="inline-block w-5 h-5 mr-2" />
            Promotions
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            <AlertTriangle className="inline-block w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.role}</p>
            </div>
            <Button variant="ghost" onClick={() => {
              localStorage.removeItem('authToken');
              router.push('/login');
            }}>
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-green-100 gap-12">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="services">Dịch vụ</TabsTrigger>
            <TabsTrigger value="services">Combo</TabsTrigger>
            <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            <TabsTrigger value="locations">Địa điểm</TabsTrigger>
            <TabsTrigger value="inventory">Kho</TabsTrigger>
            <TabsTrigger value="pricing-promotions">Giá & Khuyến mãi</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = iconMap[stat.icon] || Tent;
                return (
                  <Card key={stat.title} className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-gray-600">{stat.change}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý Bookings</CardTitle>
                    <CardDescription>Xem và quản lý các bookings của khách hàng</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Tìm kiếm booking..." className="w-64" />
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Bộ lọc
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất báo cáo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                    {bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">{booking.customer}</TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.amount.toLocaleString()} VNĐ</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
                              onClick={() => handleCheckInOut(booking._id, 'checkin')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              onClick={() => handleCheckInOut(booking._id, 'checkout')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý nhân viên</CardTitle>
<<<<<<< HEAD
                    <CardDescription>Danh sách nhân viên và thông tin</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isCreateStaffOpen} onOpenChange={setIsCreateStaffOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white border-0">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Thêm nhân viên
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất danh sách
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm nhân viên..."
                      className="pl-10 border-gray-300 focus:border-green-500"
                      value={searchStaff}
                      onChange={(e) => setSearchStaff(e.target.value)}
                    />
                  </div>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-48 border-gray-300">
                      <SelectValue placeholder="Bộ phận" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="guide">Hướng dẫn viên</SelectItem>
                      <SelectItem value="equipment">Kho thiết bị</SelectItem>
                      <SelectItem value="tour">Quản lý tour</SelectItem>
                      <SelectItem value="customer">Chăm sóc khách hàng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên nhân viên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Điện thoại</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Bộ phận</TableHead>
                      <TableHead>Ngày vào làm</TableHead>
=======
                    <CardDescription>Quản lý thông tin nhân viên và phân công</CardDescription>
                  </div>
                  <Dialog open={isCreateStaffOpen} onOpenChange={setIsCreateStaffOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 text-white border-0">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Thêm nhân viên
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm nhân viên mới</DialogTitle>
                        <DialogDescription>Nhập thông tin nhân viên để thêm vào hệ thống</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="fullName" className="text-right">
                            Họ tên
                          </Label>
                          <Input
                            id="fullName"
                            value={staffFormData.fullName}
                            onChange={(e) =>
                              setStaffFormData({ ...staffFormData, fullName: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            value={staffFormData.email}
                            onChange={(e) =>
                              setStaffFormData({ ...staffFormData, email: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Số điện thoại
                          </Label>
                          <Input
                            id="phone"
                            value={staffFormData.phone}
                            onChange={(e) =>
                              setStaffFormData({ ...staffFormData, phone: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                            Mật khẩu
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={staffFormData.password}
                            onChange={(e) =>
                              setStaffFormData({ ...staffFormData, password: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                            Vai trò
                          </Label>
                          <Select
                            value={staffFormData.role}
                            onValueChange={(value) =>
                              setStaffFormData({ ...staffFormData, role: value as 'staff' })
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="guide">Guide</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="department" className="text-right">
                            Bộ phận
                          </Label>
                          <Input
                            id="department"
                            value={staffFormData.department}
                            onChange={(e) =>
                              setStaffFormData({ ...staffFormData, department: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('authToken');
                            if (!token) {
                              router.push('/login');
                              return;
                            }
                            await createStaff(token, {
                              name: staffFormData.fullName,
                              email: staffFormData.email,
                              password_hash: staffFormData.password,
                              phone: staffFormData.phone,
                              role: staffFormData.role,
                              department: staffFormData.department,
                              joinDate: new Date().toISOString(),
                              status: 'active',
                            });
                            setIsCreateStaffOpen(false);
                            const staffData = await fetchStaff(token);
                            setStaff(staffData);
                          } catch (error: any) {
                            const apiError = error as ApiError;
                            setError(apiError.message || 'Failed to create staff');
                          }
                        }}
                      >
                        Thêm nhân viên
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Bộ phận</TableHead>
                      <TableHead>Ngày gia nhập</TableHead>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
<<<<<<< HEAD
                    {filteredStaff.map((member) => (
=======
                    {staff.map((member) => (
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                      <TableRow key={member._id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
<<<<<<< HEAD
                        <TableCell>
                          <Badge
                            className={
                              member.role === 'staff'
                                ? 'bg-purple-100 text-purple-800 border-0'
                                : 'bg-blue-100 text-blue-800 border-0'
                            }
                          >
                            {member.role === 'staff' ? 'Nhân viên' : member.role}
                          </Badge>
                        </TableCell>
=======
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                        <TableCell>{member.department}</TableCell>
                        <TableCell>{member.joinDate}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

<<<<<<< HEAD
          <TabsContent value="bookings">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý đơn hàng</CardTitle>
                    <CardDescription>Tất cả đơn đặt dịch vụ và thiết bị</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm đơn hàng..."
                      className="pl-10 border-gray-300 focus:border-green-500"
                      value={searchBookings}
                      onChange={(e) => setSearchBookings(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 border-gray-300">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">{booking._id}</TableCell>
                        <TableCell>{booking.customer}</TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.amount.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

=======
>>>>>>> 4b112d9 (Add or update frontend & backend code)
          <TabsContent value="services">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý dịch vụ</CardTitle>
                    <CardDescription>Danh sách các gói dịch vụ cắm trại</CardDescription>
                  </div>
<<<<<<< HEAD
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0" asChild>
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
                      <TableHead>Địa điểm</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Lượt đặt</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service._id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.location}</TableCell>
                        <TableCell>{service.price.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell>{service.bookings}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {service.rating}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(service.status)}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
=======
                  <div className="flex gap-2">
                    <Button
                      asChild
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 
             text-sm font-medium text-white shadow-md transition 
             hover:bg-green-700 hover:shadow-lg focus:ring-2 
             focus:ring-green-500 focus:ring-offset-2"
                    >
                      <Link href="/admin/services/new">
                        <Plus className="w-4 h-4" />
                        Thêm gói dịch vụ
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Bộ lọc */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm dịch vụ theo tên hoặc địa điểm..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-green-500"
                    />
                  </div>

                  <Select value={serviceStatusFilter} onValueChange={setServiceStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 border-gray-300">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Tạm dừng</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={serviceLocationFilter} onValueChange={setServiceLocationFilter}>
                    <SelectTrigger className="w-full sm:w-48 border-gray-300">
                      <SelectValue placeholder="Địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả địa điểm</SelectItem>
                      <SelectItem value="sapa">Sapa</SelectItem>
                      <SelectItem value="quy nhon">Quy Nhơn</SelectItem>
                      <SelectItem value="ninh binh">Ninh Bình</SelectItem>
                      <SelectItem value="quang ninh">Quảng Ninh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bảng dịch vụ */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Dịch vụ</TableHead>
                        <TableHead>Địa điểm & Thời gian</TableHead>
                        <TableHead>Giá & Sức chứa</TableHead>
                        <TableHead>Đánh giá</TableHead>
                        <TableHead>Tình trạng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-center">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginatedServices.map((service) => (
                        <TableRow key={service.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{service.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">{service.location}</div>
                              <div className="text-xs text-gray-600">{service.duration}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-green-600">{formatPrice(service.price)}</div>
                              <div className="text-xs text-gray-600">{service.capacity}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{service.averageRating}</span>
                              </div>
                              <div className="text-xs text-gray-600">{service.totalReviews} đánh giá</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {getTodayAvailability(service.availability)}
                              </div>
                              <div className="text-xs text-gray-600">
                                Cập nhật: {new Date().toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getServiceBadge(!!service.active)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              {/* Xem chi tiết */}
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                              >
                                <Link href={`/admin/services/${service.id}/details`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>

                              {/* Chỉnh sửa */}
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              >
                                <Link href={`/admin/services/${service.id}/edit`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>

                              {/* Xoá */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xoá dịch vụ</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xoá <b>{service.name}</b>? Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      // onClick={() => handleDelete(service.id)}
                                    >
                                      Xoá
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>

                        </TableRow>
                      ))}
                    </TableBody>

                  </Table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <div>
                    Hiển thị {paginatedServices.length} / {services.length} dịch vụ
                  </div>
                  <div className="flex items-center gap-2 pr-24">
                    <span>Trang:</span>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        className={`border-gray-300 ${currentPage === i + 1
                          ? "bg-green-500 text-white"
                          : "text-gray-700 hover:bg-gray-50 bg-transparent"
                          }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                </div>

>>>>>>> 4b112d9 (Add or update frontend & backend code)
              </CardContent>
            </Card>
          </TabsContent>

<<<<<<< HEAD
=======



>>>>>>> 4b112d9 (Add or update frontend & backend code)
          <TabsContent value="equipment">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý thiết bị</CardTitle>
<<<<<<< HEAD
                    <CardDescription>Kho thiết bị cho thuê</CardDescription>
                  </div>
                   <div className="flex gap-2">
                  <Dialog open={isCreateStaffOpen} onOpenChange={setIsCreateStaffOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white border-0">
                          <UserPlus className="w-4 h-4 mr-2" />
                    <Link
                      href={{
                        pathname: '/admin/equipment/new',
                        query: {
                          token: localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '',
                          userId: localStorage.getItem('userId') || sessionStorage.getItem('userId') || user?._id || '1',
                        },
                      }}
                    >
=======
                    <CardDescription>Quản lý các thiết bị cho thuê</CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0" asChild>
                    <Link href="/admin/equipment/new">
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm thiết bị
                    </Link>
                  </Button>
<<<<<<< HEAD
                  </DialogTrigger>
                    </Dialog>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất danh sách
                  </Button>
                  </div>
=======
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên thiết bị</TableHead>
                      <TableHead>Danh mục</TableHead>
<<<<<<< HEAD
                      <TableHead>Giá thuê</TableHead>
                      <TableHead>Tồn kho</TableHead>
=======
                      <TableHead>Giá/Ngày</TableHead>
                      <TableHead>Còn lại/Tổng</TableHead>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
<<<<<<< HEAD
                        <TableCell>
                          {typeof item.price_per_day === 'number'
                            ? `${item.price_per_day.toLocaleString('vi-VN')}đ/ngày`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>
                              {item.available}/{item.total}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  item.available === 0
                                    ? 'bg-red-500'
                                    : item.available <= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${(item.available / item.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
=======
                        <TableCell>{item.price_per_day.toLocaleString()} VNĐ</TableCell>
                        <TableCell>
                          {item.available}/{item.total}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý khách hàng</CardTitle>
<<<<<<< HEAD
                    <CardDescription>Danh sách khách hàng và thông tin</CardDescription>
                  </div>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất danh sách
                  </Button>
=======
                    <CardDescription>Quản lý thông tin khách hàng và lịch sử booking</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Tìm kiếm khách hàng..." className="w-64" />
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Bộ lọc
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất báo cáo
                    </Button>
                  </div>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
<<<<<<< HEAD
                      <TableHead>Tên khách hàng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Điện thoại</TableHead>
                      <TableHead>Số đơn</TableHead>
                      <TableHead>Tổng chi tiêu</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
=======
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Số bookings</TableHead>
                      <TableHead>Chi tiêu</TableHead>
                      <TableHead>Ngày tạo</TableHead>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.bookings}</TableCell>
<<<<<<< HEAD
                        <TableCell>
                          {typeof customer.spent === 'number'
                            ? `${customer.spent.toLocaleString('vi-VN')}đ`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {customer.created_at && !isNaN(new Date(customer.created_at).getTime())
                            ? new Date(customer.created_at).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </TableCell>
=======
                        <TableCell>{customer.spent.toLocaleString()} VNĐ</TableCell>
                        <TableCell>{customer.created_at}</TableCell>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
<<<<<<< HEAD
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
=======
                              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
<<<<<<< HEAD
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                            >
                              <MessageCircle className="w-4 h-4" />
=======
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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
<<<<<<< HEAD
=======

          <TabsContent value="locations">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý địa điểm</CardTitle>
                    <CardDescription>Quản lý các địa điểm cắm trại</CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0" asChild>
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
                    {locations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell>{location.capacity}</TableCell>
                        <TableCell>{getStatusBadge(location.status)}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý kho</CardTitle>
                    <CardDescription>Quản lý số lượng thiết bị và vật dụng trong kho</CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0" asChild>
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
                    {inventory.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.threshold}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing-promotions">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý giá & khuyến mãi</CardTitle>
                    <CardDescription>Điều chỉnh giá dịch vụ/thiết bị, tạo promotion</CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0" asChild>
                    <Link href="/admin/promotions/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm khuyến mãi
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pricing" className="space-y-4">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="pricing">Quản lý giá</TabsTrigger>
                    <TabsTrigger value="promotions">Khuyến mãi</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pricing">
                    <p className="text-gray-600">Chọn dịch vụ/thiết bị từ tab tương ứng để chỉnh giá.</p>
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
                        {promotions.map((promo) => (
                          <TableRow key={promo._id}>
                            <TableCell className="font-medium">{promo.code}</TableCell>
                            <TableCell>{promo.discount}%</TableCell>
                            <TableCell>{promo.startDate}</TableCell>
                            <TableCell>{promo.endDate}</TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        </Tabs>
      </div>
    </div>
  );
}