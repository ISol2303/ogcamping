'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/app/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tent, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect"); // ?redirect=...

  // Hàm điều hướng theo role (nếu không có redirect gốc)
  const handleDashboardNavigation = (user: any) => {
    const role = (user.role || "CUSTOMER").toString().toUpperCase();
    if (role === "ADMIN") router.push("/admin");
    else if (role === "STAFF") router.push("/staff");
    else router.push("/dashboard");
  };

  // --- Xử lý khi backend redirect về /login/success?token=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("authToken", token);

      const savedRedirect = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");

      // Xóa token khỏi URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      router.push(savedRedirect);
    }
  }, [router]);

  // --- Login bằng email/password ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (!response?.token || !response?.user?.email) {
        throw new Error("Dữ liệu phản hồi không hợp lệ từ máy chủ.");
      }

      const { token, user } = response;
      const role = (user.role || "CUSTOMER").toString().toUpperCase();
      const fullUser = { ...user, role };
      const storage = formData.remember ? localStorage : sessionStorage;

      storage.setItem("authToken", token);
      storage.setItem("user", JSON.stringify(fullUser));

      // Redirect nếu có ?redirect=..., nếu không → role-based
      if (redirectParam) router.push(redirectParam);
      else handleDashboardNavigation(fullUser);

    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Login bằng Google ---
  const handleGoogleLogin = () => {
    const savedRedirect = localStorage.getItem("redirectAfterLogin") || "/";
    window.location.href = `http://localhost:8080/oauth2/authorization/google`;
    // Backend sẽ redirect về /login/success?token=..., frontend sẽ đọc savedRedirect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/ai-avatar.jpg"
                className="h-12 w-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
            <span className="text-3xl font-bold text-green-600">OG Camping</span>
          </Link>
          <p className="text-gray-700 mt-3 text-lg">Chào mừng trở lại!</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Đăng nhập
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">Nhập thông tin để truy cập tài khoản</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Mật khẩu
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-12 pr-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.remember}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remember: checked as boolean }))}
                    className="border-gray-300"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Hoặc đăng nhập với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.30-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              {/* <Button
                variant="outline"
                className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button> */}
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link href="/terms" className="text-green-600 hover:text-green-700 transition-colors">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="text-green-600 hover:text-green-700 transition-colors">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}