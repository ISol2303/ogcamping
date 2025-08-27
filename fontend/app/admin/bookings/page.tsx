
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';  // ✅ đúng Link của Next.js
import { Users, Edit, Trash2, MapPin, Package, Percent, Tent, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchBookings, checkBooking, fetchCurrentUser } from '../../api/admin';
import jwtDecode from 'jwt-decode';

interface Booking {
  _id: string;
  customer: string;
  service: string;
  date: string;
  amount: number;
  status: 'confirmed' | 'completed' | 'pending' | 'cancelled';
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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

        const bookingsData = await fetchBookings(token);
        setBookings(bookingsData);
      } catch (error: any) {
        setError(error.message || 'Failed to load bookings');
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=unauthenticated');
        }
      }
    };
    fetchData();
  }, [router]);

  const handleCheckInOut = async (bookingId: string, action: 'checkin' | 'checkout') => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      await checkBooking(token, bookingId, action);
      const bookingsData = await fetchBookings(token);
      setBookings(bookingsData);
    } catch (error: any) {
      setError(error.message || `Failed to ${action} booking`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600 text-white">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600 text-white">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600 text-white">Cancelled</Badge>;
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
                <CardTitle>Quản lý Bookings</CardTitle>
                <CardDescription>Xem và quản lý các bookings của khách hàng</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Tìm kiếm booking..." className="w-64" />
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Bộ lọc
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
        </div>
     
    </div>
  );
}
