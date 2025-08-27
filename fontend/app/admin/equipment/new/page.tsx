'use client';
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
    </div>
  );
}
