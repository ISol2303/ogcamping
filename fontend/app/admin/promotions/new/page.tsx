'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import jwtDecode from 'jwt-decode';

export default function NewPromotionPage() {
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    startDate: '',
    endDate: '',
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
      // Assume an API function `createPromotion` exists
      // await createPromotion(token, {
      //   code: formData.code,
      //   discount: parseInt(formData.discount),
      //   startDate: formData.startDate,
      //   endDate: formData.endDate,
      // });
      router.push('/admin/promotions');
    } catch (error: any) {
      setError(error.message || 'Failed to create promotion');
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Thêm khuyến mãi mới</CardTitle>
          <CardDescription>Nhập thông tin để thêm mã khuyến mãi mới</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">Mã khuyến mãi</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount" className="text-right">Giảm giá (%)</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <Button onClick={handleSubmit}>Thêm khuyến mãi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}