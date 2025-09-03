
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Eye, Edit, Trash2, UserPlus, BarChart3, Calendar, Tent, Package, MapPin, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { fetchStaff, createStaff, fetchCurrentUser } from '../../api/admin';
import jwtDecode from 'jwt-decode';

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

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff' as 'staff',
    department: '',
  });
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

        const staffData = await fetchStaff(token);
        setStaff(staffData);
      } catch (error: any) {
        setError(error.message || 'Failed to load staff');
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=unauthenticated');
        }
      }
    };
    fetchData();
  }, [router]);

  const handleCreateStaff = async () => {
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
      setError(error.message || 'Failed to create staff');
    }
  };

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
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fullName" className="text-right">Họ tên</Label>
                    <Input
                      id="fullName"
                      value={staffFormData.fullName}
                      onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
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
                    <Label htmlFor="phone" className="text-right">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={staffFormData.phone}
                      onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
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
                    <Label htmlFor="department" className="text-right">Bộ phận</Label>
                    <Input
                      id="department"
                      value={staffFormData.department}
                      onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateStaff}>Thêm nhân viên</Button>
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
