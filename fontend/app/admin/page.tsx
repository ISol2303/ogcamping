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
  createEquipment,
  fetchCurrentUser,
  ApiError,
} from '../api/admin';
import jwtDecode from 'jwt-decode';

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
  status: 'available' | 'out_of_stock';
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

const iconMap: { [key: string]: LucideIcon } = {
  vnd: Banknote,
  calendar: Calendar,
  users: Users,
  shoppingCart: ShoppingCart,
  star: Star,
};

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
const VALID_PERIODS: Period[] = ['daily', 'weekly', 'monthly', 'yearly'];

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isCreateEquipmentOpen, setIsCreateEquipmentOpen] = useState(false);
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
    status: 'available' as 'available' | 'out_of_stock',
  });
  const [equipmentImageFile, setEquipmentImageFile] = useState<File | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
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
      console.warn('Attempted to set invalid period:', newPeriod);
      setError('Invalid period selected. Defaulting to monthly.');
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
          router.push('/login?error=no-token');
          return;
        }

        let decoded: any;
        try {
          decoded = jwtDecode(token);
        } catch (e) {
          setHasRedirected(true);
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=invalid-token');
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
          router.push('/login?error=unauthorized');
          return;
        }

        if (!VALID_PERIODS.includes(selectedPeriod)) {
          console.warn('Invalid selectedPeriod:', selectedPeriod);
          setError('Invalid period selected. Defaulting to monthly.');
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
            console.error('fetchStats failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
              period: selectedPeriod,
            });
            setError(err.message || 'Failed to fetch stats');
            return [];
          }),
          fetchBookings(token).catch((err: ApiError) => {
            console.error('fetchBookings failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
            });
            setError(err.message || 'Failed to fetch bookings');
            return [];
          }),
          fetchStaff(token).catch((err: ApiError) => {
            console.error('fetchStaff failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
            });
            setError(err.message || 'Failed to fetch staff');
            return [];
          }),
          fetchServices(token).catch((err: ApiError) => {
            console.error('fetchServices failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
            });
            setError(err.message || 'Failed to fetch services');
            return [];
          }),
          fetchEquipment(token).catch((err: ApiError) => {
            console.error('fetchEquipment failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
            });
            setError(err.message || 'Failed to fetch equipment');
            return [];
          }),
          fetchCustomers(token).catch((err: ApiError) => {
            console.error('fetchCustomers failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
            });
            setError(err.message || 'Failed to fetch customers');
            return [];
          }),
          fetchLocations(token).catch((err: ApiError) => {
            console.error('fetchLocations failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
            });
            setError(err.message || 'Failed to fetch locations');
            return [];
          }),
          fetchInventory(token).catch((err: ApiError) => {
            console.error('fetchInventory failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
            });
            setError(err.message || 'Failed to fetch inventory');
            return [];
          }),
          fetchPromotions(token).catch((err: ApiError) => {
            console.error('fetchPromotions failed:', {
              message: err.message || 'No error message',
              status: err.status || 'No status',
              data: err.data || 'No data',
            });
            setError(err.message || 'Failed to fetch promotions');
            return [];
          }),
        ]);

        // Validate and filter data to ensure unique _id
        const validateArray = <T extends { _id: string }>(data: T[], type: string): T[] => {
          if (!Array.isArray(data)) {
            console.warn(`Invalid ${type} data: Expected an array, received:`, data);
            return [];
          }
          const seenIds = new Set<string>();
          const filtered = data.filter((item, index) => {
            if (!item._id || typeof item._id !== 'string') {
              console.warn(`Invalid _id in ${type} at index ${index}:`, item);
              return false;
            }
            if (seenIds.has(item._id)) {
              console.warn(`Duplicate _id in ${type}: ${item._id}`);
              return false;
            }
            seenIds.add(item._id);
            return true;
          });
          return filtered;
        };

        // Special handling for stats (uses title as key)
        const validStats = Array.isArray(statsData)
          ? statsData.filter((stat, index) => {
              if (!stat.title || typeof stat.title !== 'string') {
                console.warn(`Invalid title in stats at index ${index}:`, stat);
                return false;
              }
              return true;
            })
          : [];

        setStats(validStats);
        setBookings(validateArray(bookingsData, 'bookings'));
        setStaff(validateArray(staffData, 'staff'));
        setServices(validateArray(servicesData, 'services'));
        setEquipment(validateArray(equipmentData, 'equipment'));
        setCustomers(validateArray(customersData, 'customers'));
        setLocations(validateArray(locationsData, 'locations'));
        setInventory(validateArray(inventoryData, 'inventory'));
        setPromotions(validateArray(promotionsData, 'promotions'));
      } catch (error: any) {
        const apiError: ApiError = {
          status: error.response?.status || error.status || 500,
          data: error.response?.data || error.data || {},
          message: error.response?.data?.message || error.message || 'Failed to load dashboard data',
        };

        console.error('Error in fetchData:', {
          status: apiError.status,
          message: apiError.message,
          data: apiError.data,
          errorMessage: error.message || 'No error message',
          errorCode: error.code || 'No error code',
          stack: error.stack || 'No stack trace',
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
      setError(apiError.message || `Failed to ${action} booking`);
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
      setError(apiError.message || 'Failed to delete service');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active':
      case 'available':
      case 'sufficient':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      case 'cancelled':
      case 'inactive':
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
      case 'low':
        return <Badge className="bg-orange-100 text-orange-800">Số lượng thấp</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Hết hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || booking.status === filterStatus)
  );

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">OG Camping Admin</span>
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
        </header>

        <div className="container mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
              <AlertTriangle className="inline-block w-5 h-5 mr-2" />
              Error: {error}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Quản trị</h1>
            <p className="text-gray-600">Quản lý toàn bộ hoạt động cắm trại</p>
            <div className="mt-4">
              <Label htmlFor="period-select" className="mr-2">Chọn khoảng thời gian:</Label>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger id="period-select" className="w-48">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_PERIODS.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </SelectItem>
                  ))}
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
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full lg:w-auto grid-cols-5">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="staff">Nhân viên</TabsTrigger>
              <TabsTrigger value="services">Dịch vụ</TabsTrigger>
              <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
              <TabsTrigger value="customers">Khách hàng</TabsTrigger>
              <TabsTrigger value="locations">Địa điểm</TabsTrigger>
              <TabsTrigger value="inventory">Kho</TabsTrigger>
              <TabsTrigger value="pricing-promotions">Giá & Khuyến mãi</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan hoạt động</CardTitle>
                  <CardDescription>Thông tin tổng quan về hoạt động kinh doanh</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Tính năng đang được phát triển...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quản lý Bookings</CardTitle>
                      <CardDescription>Xem và quản lý các bookings của khách hàng</CardDescription>
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
                        placeholder="Tìm kiếm booking..."
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
                        <SelectItem value="confirmed">Hoạt động</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="cancelled">Không hoạt động</SelectItem>
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
                            <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                            <TableCell>{booking.amount.toLocaleString()} VNĐ</TableCell>
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
                            Không có dữ liệu bookings
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
                      <CardTitle>Quản lý nhân viên</CardTitle>
                      <CardDescription>Quản lý đội ngũ nhân viên</CardDescription>
                    </div>
                    <Dialog open={isCreateStaffOpen} onOpenChange={setIsCreateStaffOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm nhân viên
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Thêm nhân viên mới</DialogTitle>
                          <DialogDescription>Điền thông tin nhân viên</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Họ tên</Label>
                            <Input
                              id="name"
                              value={staffFormData.name}
                              onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input
                              id="email"
                              value={staffFormData.email}
                              onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">Mật khẩu</Label>
                            <Input
                              id="password"
                              type="password"
                              value={staffFormData.password}
                              onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Số điện thoại</Label>
                            <Input
                              id="phone"
                              value={staffFormData.phone}
                              onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Vai trò</Label>
                            <Select
                              value={staffFormData.role}
                              onValueChange={(value) =>
                                setStaffFormData({ ...staffFormData, role: value as 'staff' | 'manager' | 'guide' })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="staff">Nhân viên</SelectItem>
                                <SelectItem value="manager">Quản lý</SelectItem>
                                <SelectItem value="guide">Hướng dẫn viên</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="department" className="text-right">Phòng ban</Label>
                            <Input
                              id="department"
                              value={staffFormData.department}
                              onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="joinDate" className="text-right">Ngày tham gia</Label>
                            <Input
                              id="joinDate"
                              type="date"
                              value={staffFormData.joinDate}
                              onChange={(e) => setStaffFormData({ ...staffFormData, joinDate: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Trạng thái</Label>
                            <Select
                              value={staffFormData.status}
                              onValueChange={(value) =>
                                setStaffFormData({ ...staffFormData, status: value as 'active' | 'inactive' })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Hoạt động</SelectItem>
                                <SelectItem value="inactive">Không hoạt động</SelectItem>
                              </SelectContent>
                            </Select>
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
                              await createStaff(token, staffFormData);
                              setIsCreateStaffOpen(false);
                              setStaffFormData({
                                name: '',
                                email: '',
                                phone: '',
                                password: '',
                                role: 'staff',
                                department: '',
                                joinDate: new Date().toISOString().split('T')[0],
                                status: 'active',
                              });
                              const staffData = await fetchStaff(token);
                              setStaff(staffData.filter((item) => item._id && typeof item._id === 'string'));
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
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Phòng ban</TableHead>
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
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.department}</TableCell>
                            <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
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
                          <TableCell colSpan={8} className="text-center">
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
                      <CardTitle>Quản lý dịch vụ</CardTitle>
                      <CardDescription>Quản lý các dịch vụ cắm trại</CardDescription>
                    </div>
                    <Dialog open={isCreateServiceOpen} onOpenChange={setIsCreateServiceOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm dịch vụ
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Thêm dịch vụ mới</DialogTitle>
                          <DialogDescription>Điền thông tin dịch vụ</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Tên dịch vụ</Label>
                            <Input
                              id="name"
                              value={serviceFormData.name}
                              onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          {/* Add other fields for description, price, location, etc. as needed */}
                        </div>
                        <Button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('authToken');
                              if (!token) {
                                router.push('/login');
                                return;
                              }
                              await createService(token, serviceFormData, serviceImageFile);
                              setIsCreateServiceOpen(false);
                              const servicesData = await fetchServices(token);
                              setServices(servicesData.filter((item) => item._id && typeof item._id === 'string'));
                            } catch (error: any) {
                              const apiError = error as ApiError;
                              setError(apiError.message || 'Failed to create service');
                            }
                          }}
                        >
                          Thêm dịch vụ
                        </Button>
                      </DialogContent>
                    </Dialog>
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
                            <TableCell>{service.price.toLocaleString()} VNĐ</TableCell>
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
                      <CardTitle>Quản lý thiết bị</CardTitle>
                      <CardDescription>Quản lý thiết bị cắm trại</CardDescription>
                    </div>
                    <Dialog open={isCreateEquipmentOpen} onOpenChange={setIsCreateEquipmentOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm thiết bị
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Thêm thiết bị mới</DialogTitle>
                          <DialogDescription>Điền thông tin thiết bị</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Tên thiết bị</Label>
                            <Input
                              id="name"
                              value={equipmentFormData.name}
                              onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Danh mục</Label>
                            <Input
                              id="category"
                              value={equipmentFormData.category}
                              onChange={(e) => setEquipmentFormData({ ...equipmentFormData, category: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="area" className="text-right">Khu vực</Label>
                            <Input
                              id="area"
                              value={equipmentFormData.area}
                              onChange={(e) => setEquipmentFormData({ ...equipmentFormData, area: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Mô tả</Label>
                            <Input
                              id="description"
                              value={equipmentFormData.description}
                              onChange={(e) =>
                                setEquipmentFormData({ ...equipmentFormData, description: e.target.value })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantityInStock" className="text-right">Số lượng trong kho</Label>
                            <Input
                              id="quantityInStock"
                              type="number"
                              value={equipmentFormData.quantityInStock}
                              onChange={(e) =>
                                setEquipmentFormData({ ...equipmentFormData, quantityInStock: parseInt(e.target.value) })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="available" className="text-right">Số lượng có sẵn</Label>
                            <Input
                              id="available"
                              type="number"
                              value={equipmentFormData.available}
                              onChange={(e) =>
                                setEquipmentFormData({ ...equipmentFormData, available: parseInt(e.target.value) })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pricePerDay" className="text-right">Giá/Ngày</Label>
                            <Input
                              id="pricePerDay"
                              type="number"
                              value={equipmentFormData.pricePerDay}
                              onChange={(e) =>
                                setEquipmentFormData({ ...equipmentFormData, pricePerDay: parseFloat(e.target.value) })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Trạng thái</Label>
                            <Select
                              value={equipmentFormData.status}
                              onValueChange={(value) =>
                                setEquipmentFormData({
                                  ...equipmentFormData,
                                  status: value as 'available' | 'out_of_stock',
                                })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Có sẵn</SelectItem>
                                <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">Hình ảnh</Label>
                            <Input
                              id="image"
                              type="file"
                              onChange={(e) => setEquipmentImageFile(e.target.files?.[0] || null)}
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
                              await createEquipment(
                                token,
                                {
                                  ...equipmentFormData,
                                  total: equipmentFormData.quantityInStock,
                                },
                                equipmentImageFile
                              );
                              setIsCreateEquipmentOpen(false);
                              setEquipmentFormData({
                                name: '',
                                category: '',
                                area: '',
                                description: '',
                                quantityInStock: 0,
                                available: 0,
                                pricePerDay: 0,
                                status: 'available',
                              });
                              setEquipmentImageFile(null);
                              const equipmentData = await fetchEquipment(token);
                              setEquipment(equipmentData.filter((item) => item._id && typeof item._id === 'string'));
                            } catch (error: any) {
                              const apiError = error as ApiError;
                              setError(apiError.message || 'Failed to create equipment');
                            }
                          }}
                        >
                          Thêm thiết bị
                        </Button>
                      </DialogContent>
                    </Dialog>
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
                            <TableCell>{item.pricePerDay.toLocaleString()} VNĐ</TableCell>
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
                      <CardTitle>Quản lý khách hàng</CardTitle>
                      <CardDescription>Quản lý thông tin khách hàng và lịch sử booking</CardDescription>
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
                        <TableHead>Số bookings</TableHead>
                        <TableHead>Chi tiêu</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.length > 0 ? (
                        customers.map((customer, index) => (
                          <TableRow key={customer._id || `customer-${index}`}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.bookings}</TableCell>
                            <TableCell>
                              {customer.spent != null ? customer.spent.toLocaleString() + ' VNĐ' : '0 VNĐ'}
                            </TableCell>
                            <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
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
                      <CardTitle>Quản lý địa điểm</CardTitle>
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
                      <CardTitle>Quản lý kho</CardTitle>
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
                      <CardTitle>Quản lý giá & khuyến mãi</CardTitle>
                      <CardDescription>Điều chỉnh giá dịch vụ/thiết bị, tạo promotion</CardDescription>
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
                                <TableCell>{new Date(promo.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(promo.endDate).toLocaleDateString()}</TableCell>
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