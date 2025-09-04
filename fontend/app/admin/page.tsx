'use client';
import { AxiosError } from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
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
import {jwtDecode} from 'jwt-decode';

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
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  role: string | string[];
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

const iconMap: { [key: string]: LucideIcon } = {
  dollar: DollarSign,
  calendar: Calendar,
  users: Users,
  shoppingCart: ShoppingCart,
  star: Star,
};
const getTodayAvailability = (availability: ServiceAvailability[]): string => {
  const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd
  const todayAvailability = availability.find((a) => a.date === today);

  if (!todayAvailability) return "Không có dữ liệu";

  const remaining = todayAvailability.totalSlots - todayAvailability.bookedSlots;
  return remaining > 0 ? `Còn ${remaining} chỗ` : "Hết chỗ";
};
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
      }
    };

    fetchData();
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


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý nhân viên</CardTitle>
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
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
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

          <TabsContent value="services">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý dịch vụ</CardTitle>
                    <CardDescription>Danh sách các gói dịch vụ cắm trại</CardDescription>
                  </div>
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

              </CardContent>
            </Card>
          </TabsContent>




          <TabsContent value="equipment">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý thiết bị</CardTitle>
                    <CardDescription>Quản lý các thiết bị cho thuê</CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0" asChild>
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
                      <TableHead>Giá/Ngày</TableHead>
                      <TableHead>Còn lại/Tổng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.price_per_day.toLocaleString()} VNĐ</TableCell>
                        <TableCell>
                          {item.available}/{item.total}
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
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Số bookings</TableHead>
                      <TableHead>Chi tiêu</TableHead>
                      <TableHead>Ngày tạo</TableHead>
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
                        <TableCell>{customer.spent.toLocaleString()} VNĐ</TableCell>
                        <TableCell>{customer.created_at}</TableCell>
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
        </Tabs>
      </div>
    </div>
  );
}