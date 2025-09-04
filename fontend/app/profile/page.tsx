'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Package, Utensils, Settings, Star } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Booking {
  _id: string;
  service: string;
  category: 'camping' | 'equipment' | 'food';
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
  amount: number;
}

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
        avatar: user?.avatar || ""
    });


  // 1. Load user khi vào trang
useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const userResponse = await axios.get("http://localhost:8080/apis/v1/users/me");
      setUser(userResponse.data);
    } catch (err) {
      console.error(err);
      router.push("/login");
    }
  };

  fetchUser();
}, [router]);

// 2. Khi user có dữ liệu thì load bookings
useEffect(() => {
  if (!user) return;

  const fetchBookings = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const bookingsResponse = await axios.get(
        `http://localhost:8080/apis/v1/bookings/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings(bookingsResponse.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBookings();
}, [user]);

useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      avatar: user.avatar || ""
    });
  }
}, [user]);


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

  if (!user) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.avatar || ''} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full lg:w-auto">
            <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="history">Lịch sử dịch vụ</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          {/* Thông tin cá nhân */}
          <TabsContent value="info">
  <Card>
    <CardHeader>
      <CardTitle>Thông tin cá nhân</CardTitle>
      <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {!isEditing ? (
        <>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <p><strong>Tên:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Số điện thoại:</strong> {user.phone || "Chưa cập nhật"}</p>
          <p><strong>Địa chỉ:</strong> {user.address || "Chưa cập nhật"}</p>
          <p><strong>Ngày tham gia:</strong> {new Date(user.createdAt).toLocaleDateString("vi-VN")}</p>
          <Button variant="outline" onClick={() => setIsEditing(true)}>Chỉnh sửa hồ sơ</Button>
        </>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const token = localStorage.getItem("authToken");
              await axios.put("http://localhost:8080/apis/v1/users/me",
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
                );
              setUser({ ...user, ...formData });
              setIsEditing(false);
            } catch (err) {
              console.error("Cập nhật thất bại", err);
            }
          }}
        >
          <div>
            <Label>Ảnh đại diện</Label>
            <Input
              type="text"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="URL ảnh đại diện"
            />
          </div>
          <div>
            <Label>Tên</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
            <div>
                <Label>Email</Label>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
          <div className="flex gap-2">
            <Button type="submit">Lưu thay đổi</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
          </div>
        </form>
      )}
    </CardContent>
  </Card>
</TabsContent>

          {/* Lịch sử dịch vụ */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử đặt dịch vụ</CardTitle>
                <CardDescription>Xem lại các dịch vụ, thiết bị và món ăn đã đặt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookings.length > 0 ? bookings.map(b => (
                  <div key={b._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{b.service}</h4>
                      <p className="text-sm text-gray-600">{b.date}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(b.status)}
                      <p className="text-sm mt-1">{b.amount.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500">Chưa có lịch sử đặt dịch vụ</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Đánh giá */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá & phản hồi</CardTitle>
                <CardDescription>Xem hoặc thêm đánh giá cho dịch vụ</CardDescription>
              </CardHeader>
              <CardContent className="text-gray-500">
                <Star className="w-10 h-10 mx-auto mb-2 text-yellow-400" />
                <p className="text-center">Tính năng đang phát triển...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cài đặt */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt tài khoản</CardTitle>
                <CardDescription>Bảo mật & quản lý đăng nhập</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">Đổi mật khẩu</Button>
                <Button variant="destructive" onClick={() => {
                  localStorage.clear();
                  router.push('/login');
                }}>Đăng xuất</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
