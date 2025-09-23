'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPasswordApi, getUserProfile, forgotPasswordApiAuth, forgotPasswordApiGuest } from "@/app/api/auth";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"forgot" | "reset">("forgot");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const { token } = useAuth();
  const router = useRouter();

  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (step === "forgot") {
        let msg;

        if (token) {
            msg = await forgotPasswordApiAuth(token);
        } else {
            msg = await forgotPasswordApiGuest(formData.email);
        }
        setSuccess(msg);
        setStep("reset");
      } else {
        // reset password
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp.");
        }
        if (!formData.code) {
          throw new Error("Vui lòng nhập mã OTP được gửi vào email.");
        }
        const msg = await resetPasswordApi(formData.code, formData.password);
        setSuccess(msg);
        if(!token) {
          setTimeout(() => router.push("/login"), 2000);
        }else {
            setTimeout(() => router.push("/dashboard"), 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* background blob */}
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
          <p className="text-gray-700 mt-3 text-lg">
            {token ? 'Đặt lại mật khẩu mới' : 'Khôi phục mật khẩu'}
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {token ? 'Đặt lại mật khẩu' : 'Quên mật khẩu'}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {token
                ? 'Nhập mã OTP và mật khẩu mới'
                : 'Nhập email để nhận mã OTP khôi phục'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === "forgot" && !token && (
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
              )}

              {step === "reset" && (
                <>
                  {/* Nhập mã OTP */}
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                      Mã OTP
                    </Label>
                    <div className="relative group">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        id="code"
                        type="text"
                        placeholder="Nhập mã OTP"
                        className="pl-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-all"
                        value={formData.code}
                        onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Mật khẩu mới */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Mật khẩu mới
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

                  {/* Xác nhận mật khẩu */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                      Xác nhận mật khẩu
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-all"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      required
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : step === "reset" ? "Đặt lại mật khẩu mới" : "Khôi phục mật khẩu"}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-600">
                <Link
                  href="/login"
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  Quay lại đăng nhập
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
