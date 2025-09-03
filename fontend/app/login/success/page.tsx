"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {jwtDecode} from 'jwt-decode'

interface JwtPayload {
  role?: string
  sub?: string
  exp?: number
}

export default function LoginSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      router.push('/login?error=missing_token')
      return
    }

    try {
      // Decode JWT to get role
      const decoded: JwtPayload = jwtDecode(token)
      console.log('Decoded JWT:', decoded)

      // Validate token and role
      if (!decoded.role) {
        throw new Error('Token không chứa thông tin vai trò.')
      }

      // Store token and userId
      localStorage.setItem('authToken', token)
      localStorage.setItem('userId', decoded.sub || '1')

      // Redirect based on role
      const role = decoded.role.toUpperCase()
      if (role === 'ADMIN') {
        router.push('/')
      } else if (role === 'STAFF') {
        router.push('/')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      console.error('Error decoding token:', err.message)
      router.push('/login?error=invalid_token')
    }
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Đang xử lý đăng nhập...</p>
    </div>
  )
}