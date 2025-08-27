'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Eye, Edit, Trash2, MapPin, Package, Percent, Tent, Calendar, BarChart3, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { fetchEquipment, fetchCurrentUser } from '../../api/admin';
import jwtDecode from 'jwt-decode';

interface Equipment {
  _id: string;
  name: string;
  category: string;
  price_per_day: number;
  available: number;
  total: number;
  status: 'available' | 'out_of_stock';
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
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

        const userData = await fetchCurrentUser(token, 1); // Pass the second argument as 0 or the appropriate value
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

        const equipmentData = await fetchEquipment(token);
        setEquipment(equipmentData);
      } catch (error: any) {
        setError(error.message || 'Failed to load equipment');
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=unauthenticated');
        }
      }
    };
    fetchData();
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-600 text-white">Available</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-600 text-white">Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
