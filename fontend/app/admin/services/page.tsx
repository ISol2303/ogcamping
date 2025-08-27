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
import { fetchCurrentUser, fetchServices } from '../../api/admin';
import jwtDecode from 'jwt-decode';
import { PackageFormData } from '@/app/api/package';

interface Package extends Omit<PackageFormData, 'status' | 'category'> {
  _id: string;
  status: 'active' | 'inactive';
  category: string; // Override the incompatible property
  duration: number; // Add the missing property
}

export default function ServicesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
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

        const userData = await fetchCurrentUser(token, 1);
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
        const mappedPackages: Package[] = ServiceData.map((pkg: any) => ({
          ...pkg,
          category: pkg.category || '', // Ensure category is defined
          duration: pkg.duration || 0, // Ensure duration is defined
        }));
        setPackages(mappedPackages);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-600 text-white">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(price));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Placeholder for delete package (assumes an API function `deletePackage`)
  const handleDelete = async (packageId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      // Assume deletePackage API function exists
      // await deletePackage(token, packageId);
      const updatedPackages = await fetchServices(token);
      const mappedUpdatedPackages: Package[] = updatedPackages.map((pkg: any) => ({
        ...pkg,
        category: pkg.category || '', // Ensure category is defined
        duration: pkg.duration || 0, // Ensure duration is defined
      }));
      setPackages(mappedUpdatedPackages);
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
                <TableHead>Slot có sẵn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Không tìm thấy gói dịch vụ nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.location}</TableCell>
                    <TableCell>{formatPrice(pkg.price)}</TableCell>
                    <TableCell>{pkg.max_people}</TableCell>
                    <TableCell>{pkg.available_slots}</TableCell>
                    <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/services/${pkg._id}`)} // Placeholder for view details
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/services/${pkg._id}/edit`)} // Placeholder for edit
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(pkg._id)}
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