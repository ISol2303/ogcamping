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
import { useParams, useSearchParams } from "next/navigation"
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
  fullname: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string; phone?: string; role: string; avatar?: string } | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log("🔍 Bắt đầu fetch dữ liệu...");

      try {
        // Lấy token & userData
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          console.warn("⚠️ Không có token hoặc userData trong localStorage");
          router.push("/login");
          return;
        }

        // Parse user
        let parsedUser;
        try {
          parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log("✅ User:", parsedUser);
        } catch (err) {
          console.error("❌ Lỗi parse userData:", err);
          router.push("/login");
          return;
        }

        // Gắn token vào axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Fetch orders
        console.log("📡 Đang gọi API lấy đơn hàng...");
        const ordersRes = await axios.get("http://localhost:8080/apis/orders/my-orders");
        console.log("✅ Orders response:", ordersRes.data);

        if (Array.isArray(ordersRes.data)) {
          setPendingOrders(ordersRes.data);
        } else {
          console.warn("⚠️ API trả về không phải mảng:", ordersRes.data);
          setPendingOrders([]);
        }
      } catch (error) {
        console.error("❌ Lỗi khi fetch data:", error);
        setPendingOrders([]);
      } finally {
        console.log("🏁 Hoàn tất fetch data");
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
  function generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `#OGC${timestamp}${randomStr}`;
  }
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
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
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
              <AvatarFallback>{user.name?.[0] || 'JD'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Danh sách đơn hàng */}
              <Card className="lg:col-span-2 shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Danh sách đơn hàng của bạn</CardTitle>
                      <CardDescription>Các đơn hàng mà bạn đã đặt</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {pendingOrders && pendingOrders.length > 0 ? (
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
                            <TableCell className="font-medium">{order.orderCode}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.email}</TableCell>
                            <TableCell>
                              {new Date(order.bookingDate).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {order.totalPrice
                                ? order.totalPrice.toLocaleString() + " đ"
                                : "-"}
                            </TableCell>
                            <TableCell>{order.phone}</TableCell>
                            <TableCell>{order.people}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-500">
                      Bạn chưa có đơn hàng nào
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Thao tác nhanh */}
              <Card className="shadow-lg rounded-2xl">
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
                  {user?.role === "admin" && (
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