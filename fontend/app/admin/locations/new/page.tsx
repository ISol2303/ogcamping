'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jwtDecode from 'jwt-decode';

export default function NewLocationPage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          router.push('/login?error=no-token');
          return;
        }

        const decoded: any = jwtDecode(token);
        if (decoded.role !== 'ADMIN') {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login?error=unauthorized');
          return;
        }
      } catch (error: any) {
        setError(error.message || 'Failed to authenticate');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      // Assume an API function `createLocation` exists
      // await createLocation(token, {
      //   name: formData.name,
      //   address: formData.address,
      //   capacity: parseInt(formData.capacity),
      //   status: formData.status,
      // });
      router.push('/admin/locations');
    } catch (error: any) {
      setError(error.message || 'Failed to create location');
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Thêm địa điểm mới</CardTitle>
          <CardDescription>Nhập thông tin để thêm địa điểm cắm trại mới</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên địa điểm</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">Sức chứa</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit}>Thêm địa điểm</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}