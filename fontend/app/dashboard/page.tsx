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
import jwt_decode from 'jwt-decode';
import Link from 'next/link';
<<<<<<< HEAD
interface Booking {
  _id: string;
  service: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
  amount: number;
  rating?: number;
  created_at: string;
}

=======
interface Payment {
  id: number;
  bookingId: number | null;
  method: string; // VD: "VNPAY"
  status: 'PENDING' | 'PAID' | 'FAILED';
  amount: number;
  providerTransactionId: string;
  paymentUrl?: string | null;
  createdAt: string;
}

interface Booking {
  id: number;
  customerId: number;
  services: BookingItemResponseDTO[];
  combos: BookingItemResponseDTO[];
  equipments: BookingItemResponseDTO[];
  checkInDate: string;   // "2025-08-26"
  checkOutDate: string;  // "2025-08-29"
  numberOfPeople: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  payment?: Payment | null;
  note?: string | null;
  totalPrice: number;
  rating?: number | null;
  feedback?: string | null;
  createdAt?: string; // Nếu backend có trả
}
interface BookingResponseDTO {
  id: number;
  customerId: number;
  bookingItems: BookingItemResponseDTO[]; // danh sách item: service/combo/equipment
  checkInDate: string | null;
  checkOutDate: string | null;
  status: string;
  totalPrice: number;
}
interface BookingItemResponseDTO {
  id: number;
  serviceId?: number;
  comboId?: number;
  euipmentId?: number;
  bookingId: number;
  checkInDate: string;
  checkOutDate: string;
  type?: ItemType;
  numberOfPeople?: number;
  quantity?: number;
  name: string;
  price?: number;
  total?: number;
}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
interface Stat {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
}
interface JwtPayload {
  email: string;
  role?: string;
  sub?: string;
}
<<<<<<< HEAD
export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string; phone?: string; role: string; avatar?: string } | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);

  //       // Get token from storage
  //       const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  //       if (!token) {
  //         router.push('/login');
  //         return;
  //       }

  //       // Set axios default headers
  //       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  //       // Fetch user data
  //       const userResponse = await axios.get('http://localhost:8080/apis/v1/users');
  //       setUser(userResponse.data);
  //        console.log(userResponse);

  //       // Fetch stats
  //       const statsResponse = await axios.get('http://localhost:8080/stats');
  //       setStats(statsResponse.data.stats);

  //       // Fetch bookings based on role
  //       const bookingsEndpoint = userResponse.data.role === 'admin' ? '/bookings' : '/bookings/user';
  //       const bookingsResponse = await axios.get(`http://localhost:8080${bookingsEndpoint}`);
  //       setBookings(bookingsResponse.data);
  //     } catch (error: any) {
  //       if (error.response?.status === 401 || error.response?.status === 403) {
  //         localStorage.removeItem('authToken');
  //         localStorage.removeItem('user');
  //         sessionStorage.removeItem('authToken');
  //         sessionStorage.removeItem('user');
  //         router.push('/login');
  //       } else {
  //         setError(error.response?.data?.error || 'Failed to fetch data');
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [router]);
  useEffect(() => {
    const fetchData = async () => {
=======

type ItemType = "SERVICE" | "COMBO" | "EQUIPMENT";
const getBookingItems = (booking: Booking) => {
  return [
    ...(booking.services || []),
    ...(booking.combos || []),
    ...(booking.equipments || []),
  ];
};
export default function DashboardPage() {
  const [user, setUser] = useState<{
    id: number
    name: string
    email: string
    phone?: string
    role: string
    avatar?: string
  } | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tabValue, setTabValue] = useState("overview"); // mặc định là overview

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // số booking mỗi trang
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Tính toán slice data
  // Đảo ngược bookings theo id (hoặc ngày tạo nếu có)
  const sortedBookings = [...bookings].sort((a, b) => b.id - a.id);

  // Phân trang
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = sortedBookings.slice(startIndex, endIndex);

  const totalPages = Math.ceil(bookings.length / itemsPerPage);


  const router = useRouter();
  useEffect(() => {
    const fetchUserAndBookings = async () => {
>>>>>>> 4b112d9 (Add or update frontend & backend code)
      try {
        setIsLoading(true);
        setError(null);

<<<<<<< HEAD
        const token =
          localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        // Decode JWT để lấy email
        const decoded: JwtPayload = jwt_decode(token);
        console.log(decoded);
        if (!decoded.sub) {
          throw new Error('Email không hợp lệ trong token');
        }

        // Set Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user theo email
        const userResponse = await axios.get<User>(
          `http://localhost:8080/apis/v1/users/by-email?email=${decoded.sub}`
        );
        setUser(userResponse.data);
        localStorage.setItem('user', JSON.stringify(userResponse.data));

        // Fetch stats
        const statsResponse = await axios.get<{ stats: Stat[] }>(
          'http://localhost:8080/apis/v1/stats'
        );
        setStats(statsResponse.data.stats);

        // Fetch bookings dựa theo role
        const bookingsEndpoint =
          userResponse.data.role.toUpperCase() === 'ADMIN'
            ? '/bookings'
            : '/bookings/user';
        const bookingsResponse = await axios.get<Booking[]>(
          `http://localhost:8080${bookingsEndpoint}`
        );
        setBookings(bookingsResponse.data);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          router.push('/login');
        } else {
          setError(err.message || 'Failed to fetch data');
=======
        // 1. Lấy token
        const token =
          localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        // 2. Decode JWT để lấy email
        const decoded: JwtPayload = jwt_decode(token);
        if (!decoded.sub) throw new Error("Email không hợp lệ trong token");

        // 3. Set Authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // 4. Lấy thông tin user
        const { data: userData } = await axios.get<User>(
          `http://localhost:8080/apis/v1/users/by-email?email=${decoded.sub}`
        );
        setUser(userData);
        setIsLoggedIn(true); // cập nhật state login
        localStorage.setItem("user", JSON.stringify(userData));

        // 5. Lấy danh sách bookings của user
        const { data: bookingsData } = await axios.get<Booking[]>(
          `http://localhost:8080/apis/v1/bookings/customer/${userData.id}`
        );
        setBookings(bookingsData);

        console.log("User:", userData);
        console.log("Bookings:", bookingsData);

        // 6. Redirect nếu có redirectAfterLogin
        const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
        if (redirectAfterLogin && redirectAfterLogin !== "/") {
          localStorage.removeItem("redirectAfterLogin");
          router.push(redirectAfterLogin);
        }

      } catch (err: any) {
        console.error("Error fetching user/bookings:", err);

        // Xử lý lỗi 401/403 → logout và redirect login
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("user");
          router.push("/login");
        } else {
          setError(err.message || "Failed to fetch data");
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        }
      } finally {
        setIsLoading(false);
      }
    };

<<<<<<< HEAD
    fetchData();
  }, [router]);
=======
    fetchUserAndBookings();

    // Optional: fallback tắt loading sau 5s nếu fetch quá lâu
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);

  }, [router]);

>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
        <Tabs defaultValue="overview" className="space-y-6">
=======
        <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-6">
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
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
=======
                    {bookings && bookings.length > 0 ? (
                      bookings
                        .slice(-3)
                        .reverse() // hiển thị booking mới nhất lên trên cùng
                        .map((booking) => {
                          const firstItem = getBookingItems(booking)?.[0];


                          const title = firstItem?.name || "Không có tên";

                          const checkInDate = firstItem?.checkInDate || booking.checkInDate;
                          const checkOutDate = firstItem?.checkOutDate || booking.checkOutDate;

                          return (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div>
                                <h4 className="font-medium">{title}</h4>
                                <p className="text-sm text-gray-600">
                                  {checkInDate
                                    ? new Date(checkInDate).toLocaleDateString("vi-VN")
                                    : "Chưa có ngày"}{" "}
                                  →{" "}
                                  {checkOutDate
                                    ? new Date(checkOutDate).toLocaleDateString("vi-VN")
                                    : "Chưa có ngày"}
                                </p>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(booking.status?.toLowerCase() || "pending")}
                                <p className="text-sm font-medium mt-1 text-green-600">
                                  {booking.totalPrice
                                    ? booking.totalPrice.toLocaleString("vi-VN") + "đ"
                                    : "0đ"}
                                </p>
                              </div>
                            </div>
                          );
                        })
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                    ) : (
                      <p className="text-center text-gray-500">Chưa có đặt chỗ nào</p>
                    )}
                  </div>
<<<<<<< HEAD
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/bookings">Xem tất cả</Link>
                  </Button>
                </CardContent>
              </Card>

=======

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setTabValue("bookings")}
                  >
                    Xem tất cả
                  </Button>
                </CardContent>


              </Card>


>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Tính năng đang được phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

=======
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {paginatedBookings.map((booking) => {
                      const firstItem = getBookingItems(booking)[0];
                      const itemName = firstItem?.name || "-";
                      const numberOfPeopleOrQuantity =
                        firstItem?.serviceId || firstItem?.comboId
                          ? firstItem?.numberOfPeople
                          : firstItem?.quantity;

                      return (
                        <div
                          key={booking.id}
                          className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg gap-4"
                        >
                          <div>
                            <h4 className="font-semibold">
                              <span
                                className={`px-2 py-1 rounded-lg font-semibold ${booking.payment?.status === "PAID"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                  }`}
                              >
                                #OG{booking.id.toString().padStart(6, "0")}
                              </span>

                            </h4>
                            <h4 className="font-medium">{itemName}</h4>
                            <p className="font-normal">{firstItem.checkInDate} - {firstItem.checkOutDate}</p>
                          </div>

                          <div className="text-right flex flex-col items-end gap-2">
                            {getStatusBadge(booking.status.toLowerCase())}
                            <p className="text-sm font-medium text-green-600">
                              {(booking.totalPrice || 0).toLocaleString("vi-VN")}đ
                            </p>
                            {booking.payment?.status === "PAID" && (
                              <p className="text-xs text-gray-500">
                                Đã thanh toán ({booking.payment.method})
                              </p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/booking/${booking.id}`)}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination controls */}
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        ← Trước
                      </button>
                      <span>
                        Trang {currentPage}/{totalPages}
                      </span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Bạn chưa có đơn đặt chỗ nào</p>
                  </div>
                )}
              </CardContent>


            </Card>
          </TabsContent>


>>>>>>> 4b112d9 (Add or update frontend & backend code)
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