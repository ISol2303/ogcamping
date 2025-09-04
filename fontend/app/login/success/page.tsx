"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {jwtDecode} from 'jwt-decode'
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from '@/app/api/auth';

interface JwtPayload {
  role?: string
  sub?: string
  exp?: number
}

export default function LoginSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      router.push('/login?error=missing_token')
      return
    }
     (async () => {
    try {
      // ✅ gọi API backend để lấy thêm thông tin user
      const profile = await getUserProfile(token);

      // ✅ update context ngay với dữ liệu đầy đủ
      login(token, {
        email: profile.email,
        name: profile.name,
        role: profile.role,
      });

      router.push("/");
    } catch (err) {
      console.error("Error fetching profile:", err);
      router.push("/login?error=invalid_token");
    }
    })();
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Đang xử lý đăng nhập...</p>
    </div>
  )
}