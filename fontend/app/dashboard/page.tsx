'use client';
import { useState, useEffect, Suspense } from 'react'; 
import { useRouter } from 'next/navigation'; 
import axios from 'axios'; 
import { Button } from '@/components/ui/button'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Badge } from '@/components/ui/badge'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { Tent, Calendar, Package, Users, TrendingUp, Bell, Settings, LogOut, BarChart3, ShoppingCart, MessageCircle, Star, } from 'lucide-react';
import Link from 'next/link'; import { useParams, useSearchParams } from "next/navigation" 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface User {
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');


        if (!token || !userData) {
          router.push('/login');
          return;
        }

        // Parse user
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch orders
        // const ordersRes = await axios.get('http://localhost:8080/apis/orders/my-orders');
        // if (Array.isArray(ordersRes.data)) {
        //   setPendingOrders(ordersRes.data);
        // }

        // Example stats (mock data)
        setStats([
          { title: 'Đơn hàng', value: '12', change: '+5%', icon: 'ShoppingCart', color: 'text-green-600' },
          { title: 'Khách hàng', value: '8', change: '+2%', icon: 'Users', color: 'text-blue-600' },
          { title: 'Thiết bị', value: '25', change: '+10%', icon: 'Package', color: 'text-yellow-600' },
          { title: 'Đánh giá', value: '4.8', change: '+1%', icon: 'Star', color: 'text-purple-600' },
        ]);
      } catch (error) {
        console.error('❌ Lỗi khi fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
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

  const iconMap: { [key: string]: any } = {
    Calendar,
    Package,
    Users,
    ShoppingCart,
    TrendingUp,
    Star,
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Tent className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">OG Camping</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarImage src={user.avatar || '/user-avatar.png'} />
              <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header> */}

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại, {user.name}!</h1>
          <p className="text-gray-600">
            {user.role === 'admin'
              ? 'Quản lý hệ thống OG Camping của bạn'
              : 'Quản lý các chuyến cắm trại và thiết bị của bạn'}
          </p>
        </div>

        {/* Stats */}
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

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="bookings">Đặt chỗ</TabsTrigger>
            <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Orders */}
              <Card className="lg:col-span-2 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Danh sách đơn hàng</CardTitle>
                  <CardDescription>Các đơn hàng bạn đã đặt</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã đơn hàng</TableHead>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ngày khởi hành</TableHead>
                          <TableHead>Giá đơn</TableHead>
                          <TableHead>Số điện thoại</TableHead>
                          <TableHead>Số người</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingOrders.map((order, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">#OGC{order._id.slice(-6)}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.email}</TableCell>
                            <TableCell>{new Date(order.bookingDate).toLocaleString()}</TableCell>
                            <TableCell className="font-medium text-green-600">
                              {order.totalPrice?.toLocaleString() + ' đ'}
                            </TableCell>
                            <TableCell>{order.phone}</TableCell>
                            <TableCell>{order.people}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Thao tác nhanh</CardTitle>
                  <CardDescription>Các tính năng thường dùng</CardDescription>
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
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử đặt chỗ</CardTitle>
                <CardDescription>Tính năng đang phát triển...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Equipment */}
          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Thiết bị đã thuê</CardTitle>
                <CardDescription>Tính năng đang phát triển...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
