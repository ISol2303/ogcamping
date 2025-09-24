'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tent, Eye, Edit, Trash2, Plus, AlertTriangle, BarChart3, Calendar, Users, Package, MapPin, Percent, Search, Filter, Star, TrendingUp, Activity, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';
import { fetchUser, fetchServices } from '../../api/admin';
import jwtDecode from 'jwt-decode';
import { PackageFormData } from '@/app/api/package';


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



export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          router.push('/login?error=no-token');
          return;
        }

        const userData = await fetchUser(token, 1);
        if (userData.token) {
          if (localStorage.getItem('authToken')) {
            localStorage.setItem('authToken', userData.token);
          }
          sessionStorage.setItem('authToken', userData.token);
        }

        if (userData.role !== 'ADMIN') {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=unauthorized');
          return;
        }

        const ServiceData = await fetchServices(token);
        const mappedServices: Service[] = ServiceData.map((pkg: any) => ({
          ...pkg,
          category: pkg.category || '', // Ensure category is defined
          duration: pkg.duration || 0, // Ensure duration is defined
        }));
        setServices(mappedServices);
      } catch (error: any) {
        setError(error.message || 'Failed to load inventory');
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=unauthenticated');
        }
      }
    };
    fetchData();
  }, [router]);

  const getStatusBadge = (active: boolean | null) => {
    if (active === true) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
          Đang hoạt động
        </span>
      );
    }
    if (active === false) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">
          Ngừng hoạt động
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
        Chưa rõ
      </span>
    );
  };



  const formatPrice = (value: number | string): string => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numberValue)) return "0 vn₫";
    return numberValue.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };


  // Hàm loại bỏ dấu tiếng Việt
  const normalizeText = (text: string) => {
    return text
      .normalize("NFD") // tách chữ cái và dấu
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .toLowerCase();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredServices = services.filter((srv) =>
    normalizeText(srv.name).includes(normalizeText(searchQuery)) ||
    normalizeText(srv.location).includes(normalizeText(searchQuery))
  );


  // Placeholder for delete package (assumes an API function `deletePackage`)
  const handleDelete = async (serviceId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      // Assume deletePackage API function exists
      // await deletePackage(token, packageId);
      const updatedPackages = await fetchServices(token);
      const mappedUpdatedServices: Service[] = updatedPackages.map((pkg: any) => ({
        ...pkg,
        category: pkg.category || '', // Ensure category is defined
        duration: pkg.duration || 0, // Ensure duration is defined
      }));
      setServices(mappedUpdatedServices);
    } catch (error: any) {
      setError(error.message || 'Failed to delete package');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ</h1>
              <p className="text-sm text-gray-600 mt-1">
                <Link href="/admin" className="hover:text-blue-600">Dashboard</Link>
                <span className="mx-2">/</span>
                <span>Services</span>
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/admin/services/new">
                <Plus className="w-4 h-4 mr-2" />
                Thêm dịch vụ mới
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="p-4 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng dịch vụ</p>
                  <p className="text-3xl font-bold text-gray-900">{services.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {services.length > 0 ? 'dịch vụ' : 'Chưa có dịch vụ'}
                  </p>
                </div>
                <Tent className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-3xl font-bold text-green-700">
                    {services.filter(service => service.active === true).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {services.length > 0 
                      ? `${Math.round((services.filter(service => service.active === true).length / services.length) * 100)}% hoạt động`
                      : 'Chưa có dữ liệu'
                    }
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
                  <p className="text-3xl font-bold text-yellow-700">
                    {services.length > 0 
                      ? (services.reduce((sum, service) => sum + (service.averageRating || 0), 0) / services.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {services.reduce((sum, service) => sum + (service.totalReviews || 0), 0)} đánh giá
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="services" className="space-y-6">
         

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Danh sách dịch vụ</CardTitle>
                    <CardDescription>Quản lý các gói dịch vụ cắm trại</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm dịch vụ..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Địa điểm</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Sức chứa</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          <Tent className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Không tìm thấy dịch vụ nào</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredServices.map((service) => (
                        <TableRow key={service.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Tent className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{service.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {service.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{service.location}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatPrice(service.price)}</TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {service.minCapacity}-{service.maxCapacity} người
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="text-sm font-medium">
                                {service.averageRating?.toFixed(1) || '0.0'}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({service.totalReviews || 0})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(service.active)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/services/${service.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/services/${service.id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(service.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê dịch vụ</CardTitle>
                <CardDescription>Phân tích hiệu suất và xu hướng dịch vụ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Tính năng thống kê</p>
                  <p>Đang được phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}