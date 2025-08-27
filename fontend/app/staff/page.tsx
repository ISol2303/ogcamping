'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Tent,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Bell,
  Settings,
  LogOut,
  Eye,
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { DialogHeader } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';

interface Order {
  id: string;
  customerName: string;        // sửa từ customer -> customerName
  email: string;               // thêm email
  phone: string;
  people: number;              // thêm số lượng người
  bookingDate: string;         // sửa từ date -> bookingDate
  totalPrice: number;          // thêm tổng giá
  specialRequests: string;     // thêm yêu cầu đặc biệt
  emergencyContact: string;    // thêm thông tin liên hệ khẩn cấp
  emergencyPhone: string;      // thêm số điện thoại khẩn cấp
  priority: 'NORMAL' | 'HIGH' | 'LOW';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; // sửa status cho trùng backend
}



interface EquipmentCheck {
  _id: string;
  name: string;
  code: string;
  lastCheck: string;
  nextCheck: string;
  status: 'due' | 'upcoming' | 'overdue';
}

interface Stat {
  title: string;
  value: string;
  icon: keyof typeof iconMap; // Restrict to iconMap keys
  color: string;
}

// Define iconMap with explicit types
const iconMap: { [key: string]: LucideIcon } = {
  Calendar,
  Clock,
  CheckCircle,
  Package,
};


export default function StaffDashboard() {
  const [selectedTab, setSelectedTab] = useState('orders');
  const [stats, setStats] = useState<Stat[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [equipmentChecks, setEquipmentChecks] = useState<EquipmentCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOrders, setSearchOrders] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  // const [selectedTab, setSelectedTab] = useState("orders")
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token =
          localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          console.log('Token không tồn tại, redirect login');
          router.push('/login');
          return;
        }

        // Set default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 1️⃣ Lấy user
        const userResponse = await axios.get('http://localhost:8080/users/me');
        const role = userResponse.data.role;
        console.log('User role:', role);
        if (!['staff', 'manager', 'guide'].includes(role)) {
          router.push('/login');
          return;
        }

        // 2️⃣ Lấy thống kê
        const statsResponse = await axios.get('http://localhost:8080/stats/staff');
        setStats(statsResponse.data.stats);

        // 3️⃣ Lấy tất cả orders
        const ordersResponse = await axios.get('http://localhost:8080/apis/orders');
        console.log('Orders Response:', ordersResponse.data);

        // Convert bookingDate về string để frontend hiển thị
        const orders: Order[] = ordersResponse.data.map((order: any) => ({
          ...order,
          bookingDate: order.bookingDate || order.date || '', // fallback nếu khác tên field
        }));
        setPendingOrders(orders);

        // 4️⃣ Lấy equipment checks
        const equipmentResponse = await axios.get('http://localhost:8080/equipment/checks');
        setEquipmentChecks(equipmentResponse.data);
      } catch (err: any) {
        console.error('Lỗi fetchData:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          router.push('/login');
        } else {
          setError(err.response?.data?.error || 'Lỗi khi tải dữ liệu');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersResponse = await axios.get('http://localhost:8080/apis/orders/all');
        setPendingOrders(ordersResponse.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách order:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (order: any) => {
    console.log("👉 handleViewOrder called with:", order); // log ngay đầu
    setSelectedOrder(order);
    try {
      if (!order) {
        throw new Error("Không tìm thấy dữ liệu đơn hàng");
      }
      setSelectedOrder(order);
      setError(null);
    } catch (err: any) {
      console.error("Lỗi khi chọn đơn hàng:", err.message);
      setError(err.message);
      setSelectedOrder(null);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Hủy</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  // const getPriorityBadge = (priority: string) => {
  //   switch (priority.toUpperCase()) {
  //     case 'HIGH':
  //       return <Badge variant="destructive">Cao</Badge>;
  //     case 'NORMAL':
  //       return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
  //     case 'LOW':
  //       return <Badge className="bg-green-100 text-green-800">Thấp</Badge>;
  //     default:
  //       return <Badge variant="secondary">Bình thường</Badge>;
  //   }
  // };

  const filteredOrders = pendingOrders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchOrders.toLowerCase()) ||
      order.id.toLowerCase().includes(searchOrders.toLowerCase());
    return matchesStatus && matchesSearch;
  });


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Tent className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">OG Camping Staff</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarImage src="/staff-avatar.png" />
              <AvatarFallback>ST</AvatarFallback>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Nhân viên</h1>
          <p className="text-gray-600">Quản lý đơn hàng và thiết bị</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon]; // Now properly typed
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-4">
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            <TabsTrigger value="reports">Báo cáo</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đơn hàng cần xử lý</CardTitle>
                    <CardDescription>Danh sách đơn hàng đang chờ xử lý</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm đơn hàng..."
                      className="pl-10"
                      value={searchOrders}
                      onChange={(e) => setSearchOrders(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                      <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                      <SelectItem value="CANCELLED">Hủy</SelectItem>

                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Email khách hàng </TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Ngày</TableHead>
                      {/* <TableHead>Ưu tiên</TableHead> */}
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#OGC{Date.now()}</TableCell>
                        <TableCell className="font-medium">{order.email}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.totalPrice ? order.totalPrice.toLocaleString() + ' đ' : '-'} </TableCell>
                        <TableCell>{new Date(order.bookingDate).toLocaleString()}</TableCell>
                        {/* <TableCell>{getPriorityBadge(order.priority)}</TableCell> */}
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log("👉 Eye clicked for order:", order); // log khi click
                                handleViewOrder(order);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm"><MessageCircle className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>


                </Table>
              </CardContent>
            </Card>
            {error && (
              <div className="text-red-600 font-semibold mt-4">
                ⚠ {error}
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Xử lý nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Xác nhận đơn hàng
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Gọi khách hàng
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Gửi email xác nhận
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ghi chú nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="Ghi chú về đơn hàng, khách hàng..." rows={4} />
                  <Button className="w-full mt-3">Lưu ghi chú</Button>
                </CardContent>
              </Card>
            </div>
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="text-center mb-4">
                    {/* Logo */}
                    <div className="flex items-left justify-left mb-2">
                      <Tent className="h-6 w-6 text-green-600" />
                    <span className="text-xl font-bold text-green-800">OG CAMPING BILL </span>
                    </div>
                    {/* Hóa đơn */}
                    <h2 className="text-2xl font-bold text-gray-800">🧾 Hóa đơn đặt tour</h2>
                    <p className="text-sm text-gray-500 mt-1">Mã đơn hàng: #{selectedOrder.id}</p>
                  </div>

                  {/* Body */}
                  <div className="divide-y divide-gray-200 border rounded-lg">
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Tên khách hàng</p>
                      <p className="text-gray-800">{selectedOrder.customerName}</p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">Email</p>
                      <p className="text-gray-800">{selectedOrder.email}</p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Số điện thoại</p>
                      <p className="text-gray-800">{selectedOrder.phone}</p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">Ngày đặt</p>
                      <p className="text-gray-800">
                        {new Date(selectedOrder.orderDate).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Giá tiền</p>
                      <p className="text-gray-800 font-medium">
                        {selectedOrder.totalPrice?.toLocaleString("vi-VN")} VND
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">Tour đặt</p>
                      <p className="text-gray-800">
                        {selectedOrder.service?.name || "Chưa có thông tin"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Dịch vụ đã chọn</p>
                      <p className="text-gray-800">
                        {selectedOrder.serviceName || "Chưa có thông tin"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">Thiết bị thuê</p>
                      <p className="text-gray-800">
                        {selectedOrder.equipment || "Không thuê"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Số người tham gia</p>
                      <p className="text-gray-800">{selectedOrder.people}</p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">Yêu cầu đặc biệt</p>
                      <p className="text-gray-800">
                        {selectedOrder.specialRequests || "Không có"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Người liên hệ khẩn cấp</p>
                      <p className="text-gray-800">
                        {selectedOrder.emergencyContact || "Không có"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">SĐT khẩn cấp</p>
                      <p className="text-gray-800">
                        {selectedOrder.emergencyPhone || "Không có"}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <p className="text-center text-gray-500 text-sm mt-6">
                    🎉 Cảm ơn quý khách đã tin tưởng dịch vụ của chúng tôi!
                  </p>

                  <div className="flex justify-end mt-4">
                    <button
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}




          </TabsContent>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Kiểm tra thiết bị</CardTitle>
                <CardDescription>Lịch kiểm tra và bảo trì thiết bị</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên thiết bị</TableHead>
                      <TableHead>Mã thiết bị</TableHead>
                      <TableHead>Lần kiểm tra cuối</TableHead>
                      <TableHead>Kiểm tra tiếp theo</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentChecks.map((equipment) => (
                      <TableRow key={equipment._id}>
                        <TableCell className="font-medium">{equipment.name}</TableCell>
                        <TableCell>{equipment.code}</TableCell>
                        <TableCell>{equipment.lastCheck}</TableCell>
                        <TableCell>{equipment.nextCheck}</TableCell>
                        <TableCell>{getStatusBadge(equipment.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Hỗ trợ khách hàng</CardTitle>
                <CardDescription>Quản lý yêu cầu hỗ trợ từ khách hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Tính năng đang được phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo công việc</CardTitle>
                <CardDescription>Tạo báo cáo hàng ngày</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Tính năng đang được phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}