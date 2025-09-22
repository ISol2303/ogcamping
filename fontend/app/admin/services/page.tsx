'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tent, Eye, Edit, Trash2, Plus, AlertTriangle, BarChart3, Calendar, Users, Package, MapPin, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md">
        <h1 className="px-4 py-3 text-2xl font-bold">Admin Dashboard</h1>
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
      <div className="flex-1 p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quản lý gói dịch vụ</CardTitle>
                <CardDescription>Quản lý các gói dịch vụ cắm trại</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Tìm kiếm gói dịch vụ..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-64"
                />
                <Button className="bg-green-600 hover:bg-green-700 text-white border-0" asChild>
                  <Link href="/admin/services/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm gói dịch vụ
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên gói dịch vụ</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Số người tối đa</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      Không tìm thấy gói dịch vụ nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.location}</TableCell>
                      <TableCell>{formatPrice(pkg.price)}</TableCell>
                      <TableCell>{pkg.maxCapacity}</TableCell>

                      {/* Đúng phải là pkg.active thay vì service.active */}
                      <TableCell>{getStatusBadge(pkg.active)}</TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/services/${pkg.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/services/${pkg.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(pkg.id)}
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
      </div>
    </div>
  );
}