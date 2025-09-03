'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tent,
  Calendar,
  Package,
  Users,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  ShoppingCart,
  MessageCircle,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface Booking {
  _id: string;
  service: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
  amount: number;
  rating?: number;
  created_at: string;
}

interface Stat {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string; phone?: string; role: string; avatar?: string } | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get token from storage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user data
        const userResponse = await axios.get('http://localhost:8080/apis/v1/users');
        setUser(userResponse.data);

        // Fetch stats
        const statsResponse = await axios.get('http://localhost:8080/stats');
        setStats(statsResponse.data.stats);

        // Fetch bookings based on role
        const bookingsEndpoint = userResponse.data.role === 'admin' ? '/bookings' : '/bookings/user';
        const bookingsResponse = await axios.get(`http://localhost:8080${bookingsEndpoint}`);
        setBookings(bookingsResponse.data);
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          router.push('/login');
        } else {
          setError(error.response?.data?.error || 'Failed to fetch data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

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
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }

  const iconMap: { [key: string]: any } = {
    Calendar,
    Package,
    Users,
    ShoppingCart,
    TrendingUp,
    Star,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            Error: {error}
          </div>
        )}
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại, {user.name}!</h1>
          <p className="text-gray-600">
            {user.role === 'admin'
              ? 'Quản lý hệ thống OG Camping của bạn'
              : 'Quản lý các chuyến cắm trại và thiết bị của bạn'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    {Icon && <Icon className={`w-8 h-8 ${stat.color}`} />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="bookings">Đặt chỗ</TabsTrigger>
            <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Đặt chỗ gần đây</CardTitle>
                  <CardDescription>Các đơn đặt dịch vụ và thiết bị mới nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.length > 0 ? (
                      bookings.map((booking) => (
                        <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{booking.service}</h4>
                            <p className="text-sm text-gray-600">{booking.date}</p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(booking.status)}
                            <p className="text-sm font-medium mt-1">{(booking.amount || 0).toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">Chưa có đặt chỗ nào</p>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/bookings">Xem tất cả</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Thao tác nhanh</CardTitle>
                  <CardDescription>Các tính năng thường sử dụng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" asChild>
                    <Link href="/services">
                      <Calendar className="w-4 h-4 mr-2" />
                      Đặt dịch vụ mới
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/equipment">
                      <Package className="w-4 h-4 mr-2" />
                      Thuê thiết bị
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/ai-consultant">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Tư vấn AI
                    </Link>
                  </Button>
                  {user.role === 'admin' && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/reports">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Xem báo cáo
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  Gợi ý từ AI
                </CardTitle>
                <CardDescription>Dựa trên lịch sử và sở thích của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium text-green-800 mb-2">Gói được đề xuất</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Cắm trại rừng Cát Tiên - phù hợp với sở thích khám phá thiên nhiên của bạn
                    </p>
                    <Button size="sm" variant="outline">
                      Xem chi tiết
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium text-blue-800 mb-2">Thiết bị nên thuê</h4>
                    <p className="text-sm text-blue-700 mb-3">Túi ngủ cao cấp - thích hợp cho chuyến đi núi sắp tới</p>
                    <Button size="sm" variant="outline">
                      Thuê ngay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử đặt chỗ</CardTitle>
                <CardDescription>Quản lý tất cả các đơn đặt dịch vụ và thiết bị</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Tính năng đang được phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Thiết bị đã thuê</CardTitle>
                <CardDescription>Theo dõi tình trạng thiết bị và lịch trả</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Tính năng đang được phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin tài khoản và cài đặt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Họ và tên</h4>
                    <p className="text-gray-600">{user.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Số điện thoại</h4>
                    <p className="text-gray-600">{user.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Vai trò</h4>
                    <p className="text-gray-600">{user.role}</p>
                  </div>
                  <Button variant="outline">Cập nhật hồ sơ</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}