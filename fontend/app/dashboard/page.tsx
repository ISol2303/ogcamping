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
import { DialogHeader } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { Input } from '@/components/ui/input';
import React from 'react';

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
interface Dish {
  id: number;
  name: string;
  category: string;
  price: number;
}
interface BillItem {
  dish: Dish;
  qty: number;
  totalPrice?: number; // tùy backend trả về
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
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null); // Add selectedOrder state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dishes, setDishes] = useState<any[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<any[]>([]);
  const [bill, setBill] = useState<BillItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  // Lưu số lượng còn lại trong state tạm thời
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});




  useEffect(() => {
    const fetchData = async () => {
      console.log("🔍 Bắt đầu fetch dữ liệu...");

      try {
        // Lấy token & userData
        const token = sessionStorage.getItem("authToken");
        const userData = sessionStorage.getItem("user");

        if (!token || !userData) {
          console.warn("⚠️ Không có token hoặc userData trong sessionStorage");
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

        const ordersRes = await axios.get("http://localhost:8080/apis/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  // Lấy dữ liệu từ backend
  useEffect(() => {
    fetch("http://localhost:8080/apis/dishes/all")
      .then((res) => res.json())
      .then((data) => setDishes(data))
      .catch((err) => console.error("Error fetching dishes:", err));
  }, []);

  // Bộ lọc món ăn (kết hợp search + category)
  const filteredDishes = React.useMemo(() => {
    return dishes.filter((dish: any) => {
      const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase());
      // nếu chọn ALL thì luôn true
      if (categoryFilter === "ALL") {
        return matchesSearch;
      }

      // chuẩn hóa cả 2 về lowercase để so sánh
      const matchesCategory =
        categoryFilter === "ALL"
          ? true
          : dish.category.toUpperCase() === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [dishes, search, categoryFilter]);

  // Thêm món vào order
  const handleAddToOrder = (dish: any) => {
    setSelectedDishes((prev) =>
      prev.some((item) => item.id === dish.id)
        ? prev.map((item) =>
          item.id === dish.id
            ? { ...item, qty: item.qty + 1 } // ✅ giữ nguyên field, chỉ tăng số lượng
            : item
        )
        : [
          ...prev,
          {
            ...dish, // ✅ lấy toàn bộ dữ liệu từ dish
            qty: 1,
          },
        ]
    );
  };

  const addToBill = (dish: Dish) => {
    console.log("➕ addToBill:", dish.id, dish.name);

    // Kiểm tra số lượng còn lại
    if (localQuantities[dish.id] === 0) {
      alert("❌ Món này đã hết hàng!");
      return;
    }

    setBill(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);

      if (existing) {
        // Nếu thêm vượt quá số lượng tồn kho thì chặn
        if (existing.qty + 1 > localQuantities[dish.id]) {
          alert("⚠️ Không thể gọi quá số lượng tồn kho!");
          return prev;
        }
        return prev.map(item =>
          item.dish.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prev, { dish, qty: 1 }];
      }
    });
  };

  useEffect(() => {
    const initQuantities: Record<number, number> = {};
    dishes.forEach(dish => {
      initQuantities[dish.id] = dish.quantity; // số lượng gốc từ DB
    });
    setLocalQuantities(initQuantities);
  }, [dishes]);


  // Xóa món khỏi bill
  const removeFromBill = (dishId: number) => {
    setBill(prev => prev.filter(item => item.dish.id !== dishId));
  };

  // Tổng tiền
  const total = React.useMemo(() => {
    return bill.reduce((sum, item) => sum + item.dish.price * item.qty, 0);
  }, [bill]);

  const fetchDishesFromDB = async () => {
    try {
      const res = await axios.get("http://localhost:8080/apis/dishes/all");
      const dishes = res.data;

      // cập nhật lại localQuantities dựa vào dữ liệu DB
      const updatedQuantities: Record<number, number> = {};
      dishes.forEach((dish: any) => {
        updatedQuantities[dish.id] = dish.quantity;
      });

      setLocalQuantities(updatedQuantities);
      console.log("✅ Đồng bộ món ăn từ DB:", updatedQuantities);
    } catch (err) {
      console.error("❌ Lỗi fetchDishesFromDB:", err);
    }
  };


  // Xác nhận gọi món
  const submitOrder = async () => {
    console.log("🔹 submitOrder bắt đầu...");

    if (!selectedOrder) {
      alert("Vui lòng chọn đơn hàng trước khi gọi món!");
      return;
    }

    if (bill.length === 0) {
      alert("Chưa chọn món nào!");
      return;
    }

    try {
      const orderId = selectedOrder.id;

      // Chuẩn bị payload cho backend
      const payload = bill.map(item => ({
        dishId: item.dish.id,
        quantity: item.qty
      }));

      console.log("📦 Payload gửi lên backend:", payload);

      // Gọi API add dishes
      const res = await axios.post(
        `http://localhost:8080/apis/orders/${orderId}/add-dishes`,
        payload
      );

      console.log("✅ Thêm món backend response:", res.data);

      alert("✅ Thêm món thành công!");

      // --- Bước 1: trừ số lượng tồn kho local theo bill
      setLocalQuantities(prev => {
        const updated = { ...prev };
        bill.forEach(item => {
          updated[item.dish.id] = Math.max(0, updated[item.dish.id] - item.qty);
        });
        return updated;
      });

      // --- Bước 2: reset bill bên customer
      setBill([]);

      // --- Bước 3: giữ selectedOrder không đổi (chỉ trigger render lại)
      setSelectedOrder((prev: any) => (prev ? { ...prev } : null));

      // --- Bước 4: refresh dishes từ DB để đồng bộ chính xác
      fetchDishesFromDB();

    } catch (err: any) {
      console.error("❌ submitOrder error:", err);
      if (err.response) {
        alert(`Lỗi server: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        alert("Không nhận được phản hồi từ server. Kiểm tra kết nối hoặc server.");
      } else {
        alert("Lỗi không mong đợi: " + (err.message || err));
      }
    }

    console.log("🔹 submitOrder kết thúc");
  };




  // ====== Khi mở modal gọi món ======
  const openBillModal = (order: any) => {
    setSelectedOrder(order);
    setOpen(true);
    setBill([]); // reset bill nếu muốn bắt đầu mới
  };







  //handleLogout
  // const handleLogout = () => {
  //   localStorage.removeItem('authToken');
  //   localStorage.removeItem('user');
  //   sessionStorage.removeItem('authToken');
  //   sessionStorage.removeItem('user');
  //   router.push('/login');
  // };

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

  function formatToVNTime(isoString: string) {
    return new Date(isoString).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header
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
      </header> */}

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
            {/* Danh sách đơn hàng */}
            <Card>
              <CardContent>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Danh sách đơn hàng của bạn</CardTitle>
                      <CardDescription>Các đơn hàng mà bạn đã đặt</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <div className="overflow-y-auto max-h-[500px] border rounded-md">
                  <div className="min-w-[800px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Mã đơn hàng</TableHead>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ngày khởi hành</TableHead>
                          <TableHead>Giá đơn</TableHead>
                          <TableHead>Số điện thoại</TableHead>
                          <TableHead>Số người</TableHead>
                          <TableHead>Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {pendingOrders && pendingOrders.length > 0 ? (
                          pendingOrders.map((order, idx) => (
                            <TableRow key={idx} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell className="font-medium">{order.orderCode}</TableCell>
                              <TableCell className="font-medium">{order.customerName}</TableCell>
                              <TableCell className="font-medium">{order.email}</TableCell>
                              <TableCell className="font-medium">
                                {formatToVNTime(order.bookingDate)}
                              </TableCell>
                              <TableCell className="font-medium text-green-600">
                                {order.totalPrice
                                  ? order.totalPrice.toLocaleString() + " đ"
                                  : "-"}
                              </TableCell>
                              <TableCell className="font-medium">{order.phone}</TableCell>
                              <TableCell className="font-medium">{order.people}</TableCell>
                              <TableCell>
                                <Button size="sm" onClick={() => {
                                  setSelectedOrder(order);
                                  setOpen(true);
                                }}>
                                  📋 Chọn thêm món ăn
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              className="text-center text-gray-500 py-6 italic"
                            >
                              Bạn chưa có đơn hàng nào
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>


            {open && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <Card className="w-[90%] max-w-6xl h-[80%] p-6 bg-white shadow-xl rounded-2xl flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Danh sách món ăn</h2>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setOpen(false)}
                    >
                      ❌
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Bảng món ăn */}
                    <div className="flex-1 flex flex-col">
                      {/* Search + Filter */}
                      <div className="flex gap-4 mb-4">
                        <Input
                          placeholder="Tìm kiếm món ăn..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="border p-2 rounded"
                        >
                          <option value="ALL">Tất cả</option>
                          <option value="APPETIZER">APPETIZER</option>
                          <option value="BBQ">BBQ</option>
                          <option value="HOTPOT">HOTPOT</option>
                          <option value="SNACK">SNACK</option>
                          <option value="DESSERT">DESSERT</option>
                          <option value="DRINK">DRINK</option>
                        </select>
                      </div>

                      {/* Table */}
                      <div className="flex-1 overflow-y-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Hình ảnh</TableHead>
                              <TableHead>Tên món</TableHead>
                              <TableHead>Loại</TableHead>
                              <TableHead>Số lượng</TableHead>
                              <TableHead>Giá</TableHead>
                              <TableHead>Thao tác</TableHead>

                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDishes.map((dish) => (
                              <TableRow key={dish.id}>
                                <TableCell className="font-medium">{dish.id}</TableCell>
                                <TableCell>
                                  {dish.imageUrl ? (
                                    <img
                                      src={`http://localhost:8080${dish.imageUrl}`}
                                      alt={dish.name}
                                      className="w-16 h-16 object-cover rounded-md"
                                    />
                                  ) : (
                                    <span className="text-gray-400 italic">Chưa có ảnh</span>
                                  )}
                                </TableCell>

                                <TableCell className="font-medium">{dish.name}</TableCell>
                                <TableCell className="font-medium">{dish.category}</TableCell>
                                <TableCell className="font-medium">{dish.quantity}</TableCell>
                                <TableCell className="font-medium">
                                  {dish.price.toLocaleString()} đ
                                </TableCell>
                                <TableCell className="font-medium">
                                  <Button
                                    size="sm"
                                    variant={localQuantities[dish.id] === 0 ? "destructive" : "outline"}
                                    disabled={localQuantities[dish.id] === 0}
                                    onClick={() => addToBill(dish)}
                                  >
                                    {localQuantities[dish.id] === 0 ? "SOLD OUT" : "Gọi món"}
                                  </Button>



                                </TableCell>


                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Bill */}
                    <Card className="w-[300px] flex flex-col p-4 shadow-md">
                      <h3 className="text-lg font-semibold mb-3">Hóa đơn</h3>
                      <div className="flex-1 overflow-y-auto space-y-2">
                        {bill.length === 0 ? (
                          <p className="text-gray-400 italic">Chưa chọn món nào</p>
                        ) : (
                          bill.map((item) => (
                            <div
                              key={item.dish.id}
                              className="flex justify-between items-center border-b pb-1"
                            >
                              <div>
                                {item.dish.name}{" "}
                                <span className="text-sm text-gray-500">x{item.qty}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>
                                  {(item.dish.price * item.qty).toLocaleString()} đ
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromBill(item.dish.id)}
                                >
                                  ➖
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-4 border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Tổng:</span>
                          <span>{total.toLocaleString()} đ</span>
                        </div>
                        <Button className="w-full mt-2" onClick={submitOrder}>Xác nhận gọi món</Button>
                      </div>
                    </Card>
                  </div>
                </Card>
              </div>
            )}







            {/* Thao tác nhanh */}
            <div className="grid md:grid-cols-2 gap-6">
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
            </div>


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
function fetchDishesFromDB() {
  throw new Error('Function not implemented.');
}

