'use client';
<<<<<<< HEAD

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tent, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { fetchUser, submitEquipment } from '@/app/api/admin';

interface EquipmentFormData {
  name: string;
  category: string;
  area: string;
  description: string;
  quantity_in_stock: number;
  image: File | null;
  available: number;
  price_per_day: number;
  status: 'available' | 'out_of_stock';
}

interface User {
  _id: string;
  role: string | string[];
  name?: string;
  email?: string;
  avatar?: string;
}

export default function NewEquipmentPage() {
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    category: '',
    area: '',
    description: '',
    quantity_in_stock: 0,
    image: null,
    available: 0,
    price_per_day: 0,
    status: 'available',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  // Kiểm tra localStorage
  const isStorageAvailable = (): boolean => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('localStorage không khả dụng:', e);
      return false;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!isStorageAvailable()) {
          setError('Trình duyệt đã tắt lưu trữ. Vui lòng bật localStorage để tiếp tục.');
          router.push('/login');
          return;
        }

        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          setError('Không tìm thấy token hoặc ID người dùng. Vui lòng đăng nhập lại.');
          router.push('/login');
          return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser: User = JSON.parse(storedUser);
            const userRole = Array.isArray(parsedUser.role)
              ? parsedUser.role[0]?.toUpperCase()
              : typeof parsedUser.role === 'string'
              ? parsedUser.role.toUpperCase()
              : undefined;

            if (userRole === 'ADMIN') {
              setUser(parsedUser);
              setIsLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem('user');
          }
        }

        const userData = await fetchUser(token, Number(userId));
        const userRole = Array.isArray(userData.role)
          ? userData.role[0]?.toUpperCase()
          : typeof userData.role === 'string'
          ? userData.role.toUpperCase()
          : undefined;

        if (!userRole || userRole !== 'ADMIN') {
          localStorage.clear();
          setError('Không có quyền truy cập. Chỉ Admin mới được phép.');
          router.push('/login');
          return;
        }

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (err: any) {
        if (err.status === 401 || err.status === 403) {
          localStorage.clear();
          setError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
          router.push('/login');
        } else {
          setError(err.message || 'Không thể tải dữ liệu người dùng.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setSubmitError('Vui lòng chọn file JPEG hoặc PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Dung lượng ảnh tối đa là 5MB.');
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitError(null);

  if (formData.available > formData.quantity_in_stock) {
    setSubmitError('Số lượng khả dụng không được vượt quá số lượng tồn kho.');
    return;
  }
  if (!formData.image) {
    setSubmitError('Vui lòng chọn ảnh.');
    return;
  }
  if (!formData.area) {
    setSubmitError('Vui lòng chọn khu vực.');
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setSubmitError('Không tìm thấy token xác thực. Vui lòng đăng nhập.');
      router.push('/login');
      return;
    }

    const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value as any);
      });

    // page.tsx
   await submitEquipment(token, data); // Không tạo fd ở đây
 // formData là object EquipmentFormData
    router.push('/admin?tab=equipment');
  } catch (err: any) {
    setSubmitError(err?.message || 'Không thể thêm thiết bị. Vui lòng thử lại.');
  }
};


  const handleInputChange = (field: keyof EquipmentFormData, value: string | number | File) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Không thể xác thực người dùng. Vui lòng đăng nhập lại.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Tent className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Quản trị OG Camping</span>
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <Avatar>
                <AvatarImage src={user.avatar ?? '/admin-avatar.png'} />
                <AvatarFallback>{user.name?.[0] ?? 'AD'}</AvatarFallback>
              </Avatar>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin?tab=equipment')}
            >
              Quay lại
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Thêm Thiết Bị Mới</h1>
          <p className="text-gray-600">Nhập thông tin thiết bị để thêm vào kho</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 mb-4">{error}</div>}
        {submitError && <div className="bg-red-100 text-red-700 p-3 mb-4">{submitError}</div>}

        <Card className="border-0 shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Chi tiết thiết bị</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Tên thiết bị *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ví dụ: Lều 4 người"
                  required
                />
              </div>

              <div>
                <Label>Loại thiết bị *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TENT">Lều</SelectItem>
                    <SelectItem value="SLEEPING_BAG">Túi ngủ</SelectItem>
                    <SelectItem value="AIR_MATTRESS">Nệm hơi</SelectItem>
                    <SelectItem value="FOLDING_TABLE">Bàn gấp</SelectItem>
                    <SelectItem value="FOLDING_CHAIR">Ghế gấp</SelectItem>
                    <SelectItem value="STOVE">Bếp</SelectItem>
                    <SelectItem value="LANTERN">Đèn lồng</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Khu vực *</Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) => handleInputChange('area', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSIDE_TENT">Bên trong lều</SelectItem>
                    <SelectItem value="OUTSIDE_TENT">Bên ngoài lều</SelectItem>
                    <SelectItem value="KITCHEN">Khu bếp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết thiết bị"
                />
              </div>

              <div>
                <Label>Ảnh *</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  required
                />
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Xem trước ảnh:</p>
                    <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-auto rounded-md border" />
                  </div>
                )}
              </div>

              <div>
                <Label>Giá thuê (VND/ngày) *</Label>
                <Input
                  type="number"
                  value={formData.price_per_day}
                  onChange={(e) => handleInputChange('price_per_day', Number(e.target.value))}
                  placeholder="VD: 100000"
                  min="0"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số lượng tồn kho *</Label>
                  <Input
                    type="number"
                    value={formData.quantity_in_stock}
                    onChange={(e) => handleInputChange('quantity_in_stock', Number(e.target.value))}
                    placeholder="VD: 10"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label>Số lượng khả dụng *</Label>
                  <Input
                    type="number"
                    value={formData.available}
                    onChange={(e) => handleInputChange('available', Number(e.target.value))}
                    placeholder="VD: 5"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Trạng thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleInputChange('status', value as 'available' | 'out_of_stock')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Còn hàng</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                    <SelectItem value="MAINTENANCE">Đang bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Thêm thiết bị
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/admin?tab=equipment')}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
=======
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchAreas, fetchCategories, fetchCurrentUser } from '../../../api/admin';

export default function NewEquipmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    area: '',
    price_per_day: '',
    available: '',
    total: '',
    status: 'available' as 'available' | 'out_of_stock' | 'maintenace',
    image: null as File | null,
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

 useEffect(() => {
  const checkAuthAndFetchData = async () => {
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

      // Gọi API thực
      const categoriesData = await fetchCategories(token);
      const areasData = await fetchAreas(token);
      setCategories(categoriesData.map((category: any) => ({ id: category.id, name: category.name })));
      setAreas(areasData.map((area: any) => ({ id: area.id, name: area.name })));
    } catch (error: any) {
      setError(error.message || 'Failed to authenticate');
    }
  };
  checkAuthAndFetchData();
}, [router]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const form = new FormData();
      form.append('name', formData.name);
      form.append('category', formData.category);
      form.append('area', formData.area);
      form.append('price_per_day', formData.price_per_day);
      form.append('available', formData.available);
      form.append('total', formData.total);
      form.append('status', formData.status);
      if (formData.image) {
        form.append('image', formData.image);
      }

      // await createEquipment(token, form); // Gửi API

      router.push('/admin/equipment');
    } catch (error: any) {
      setError(error.message || 'Failed to create equipment');
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Thêm thiết bị mới</CardTitle>
          <CardDescription>Nhập thông tin để thêm thiết bị cho thuê mới</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Tên thiết bị */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên thiết bị</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>

            {/* Danh mục */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Danh mục</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Khu vực */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area" className="text-right">Khu vực</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, area: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Giá/Ngày */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price_per_day" className="text-right">Giá/Ngày (VNĐ)</Label>
              <Input
                id="price_per_day"
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                className="col-span-3"
              />
            </div>

            {/* Số lượng còn lại */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="available" className="text-right">Số lượng còn lại</Label>
              <Input
                id="available"
                type="number"
                value={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                className="col-span-3"
              />
            </div>

            {/* Tổng số lượng */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right">Tổng số lượng</Label>
              <Input
                id="total"
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                className="col-span-3"
              />
            </div>

            {/* Trạng thái */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'available' | 'out_of_stock'| 'maintenace' })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Còn hàng</SelectItem>
                  <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                  <SelectItem value="maintenace">Bảo Trì</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hình ảnh */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">Hình ảnh</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null })
                }
                className="col-span-3"
              />
            </div>

            <Button onClick={handleSubmit}>Thêm thiết bị</Button>
          </div>
        </CardContent>
      </Card>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    </div>
  );
}
