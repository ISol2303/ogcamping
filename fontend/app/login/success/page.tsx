'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem('authToken', token);

      // Chuyển hướng sang dashboard
      router.push('/dashboard');
    } else {
      // Nếu không có token, quay lại login
      router.push('/login?error=missing_token');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Đang xử lý đăng nhập...</p>
    </div>
  );
}
