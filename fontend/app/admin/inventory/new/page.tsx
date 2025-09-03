'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import jwtDecode from 'jwt-decode';

export default function NewInventoryItemPage() {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    threshold: '',
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
      // Assume an API function `createInventoryItem` exists
      // await createInventoryItem(token, {
      //   name: formData.name,
      //   quantity: parseInt(formData.quantity),
      //   threshold: parseInt(formData.threshold),
      // });
      router.push('/admin/inventory');
    } catch (error: any) {
      setError(error.message || 'Failed to create inventory item');
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Thêm vật dụng mới</CardTitle>
          <CardDescription>Nhập thông tin để thêm vật dụng vào kho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên vật dụng</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="threshold" className="text-right">Ngưỡng</Label>
              <Input
                id="threshold"
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                className="col-span-3"
              />
            </div>
            <Button onClick={handleSubmit}>Thêm vật dụng</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}