
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';  // ✅ đúng Link của Next.js
import { Users, Eye, Edit, Trash2, MapPin, Package, Percent, Tent, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchCustomers, fetchCurrentUser } from '../../api/admin';
import jwtDecode from 'jwt-decode';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bookings: number;
  spent: number;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          router.push('/login?error=no-token');
          return;
        }

        const userData = await fetchCurrentUser(token,1);
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

        const customersData = await fetchCustomers(token);
        setCustomers(customersData);
      } catch (error: any) {
        setError(error.message || 'Failed to load customers');
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=unauthenticated');
        }
      }
    };
    fetchData();
  }, [router]);

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
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
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
                <Users className="w-4 h-4 mr-2" />
                Bộ lọc
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
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
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
      </div>
    </div>
  );
}
