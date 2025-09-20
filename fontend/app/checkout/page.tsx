"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tent,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Shield,
  MapPin,
  Building,
  Wallet,
  Smartphone,
  Banknote,
  CheckCircle,
  Clock,
  Settings,
  ShoppingCart,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import axios from "axios"


export default function CheckoutPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("vnpay")
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [note, setNote] = useState("")
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])
  useEffect(() => {
    const raw = localStorage.getItem("cart");
    if (!raw) return;

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    const parsed = JSON.parse(raw);

    const mapped = parsed.map((c: any) => ({
      id: c.id,
      name: c.item?.name,
      type: c.type as "SERVICE" | "COMBO" | "EQUIPMENT",
      quantity: c.quantity,
      unitPrice: c.item?.price,
      // tổng dòng ưu tiên lấy từ totalPrice (hoặc total), fallback = unitPrice * quantity
      total: c.totalPrice ?? c.total ?? (c.item?.price ?? 0) * (c.quantity ?? 1),
      image: c.item?.imageUrl
        ? (c.item.imageUrl.startsWith("http") ? c.item.imageUrl : `${BASE_URL}${c.item.imageUrl}`)
        : "/placeholder.svg",
    }));

    setCartItems(mapped);
  }, []);
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }
  const handleGoToCart = () => {
    router.push("/cart");
  };
  // Handle dashboard navigation based on role
  const handleDashboardNavigation = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin')
    } else if (user?.role === 'STAFF') {
      router.push('/staff')
    } else {
      router.push('/dashboard')
    }
  }
  // Mock cart data - in real app this would come from state management


  // Tính tạm tính (subtotal) = tổng totalPrice của tất cả item
  const subtotal = cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
  // const discountRate = 0.2;
  // const discount = subtotal > 0 ? subtotal * discountRate : 0;
  const total = subtotal;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Simulate payment result (80% success rate)
    const isSuccess = Math.random() > 0.2

    if (isSuccess) {
      router.push("/checkout/success")
    } else {
      router.push("/checkout/failure")
    }
  }
  const handleCreateBooking = async () => {
    try {
      setIsProcessing(true);

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("Bạn cần đăng nhập trước khi đặt chỗ");
        return;
      }
      const user = JSON.parse(storedUser);

      const storedCart = localStorage.getItem("cart");
      if (!storedCart) {
        alert("Giỏ hàng trống");
        return;
      }

      if (!paymentMethod) {
        alert("Vui lòng chọn phương thức thanh toán");
        return;
      }

      const cart = JSON.parse(storedCart);

      const services = cart
        .filter((item: any) => item.type === "SERVICE")
        .map((item: any) => ({
          serviceId: item.item.id,
          checkInDate: item.checkInDate ? `${item.checkInDate}T08:00:00` : null,
          checkOutDate: item.checkOutDate ? `${item.checkOutDate}T12:00:00` : null,
          numberOfPeople: item.extraPeople
            ? item.item.maxCapacity + item.extraPeople
            : item.item.maxCapacity,
        }));

      const combos = cart
        .filter((item: any) => item.type === "COMBO")
        .map((item: any) => ({
          comboId: item.item.id,
          quantity: item.quantity,
          checkInDate: item.checkInDate ? `${item.checkInDate}T08:00:00` : null,
          checkOutDate: item.checkOutDate ? `${item.checkOutDate}T12:00:00` : null,
          extraPeople: item.extraPeople || 0,
        }));


      const bookingRequest = {
        services,
        combos,
        note: note || "",
      };

      // B1: Tạo booking
      const res = await axios.post(
        `http://localhost:8080/apis/v1/bookings?customerId=${user.id}`,
        bookingRequest
      );

      const booking = res.data;
      localStorage.setItem("infoBookingItem", JSON.stringify(booking));
      localStorage.removeItem("cart")
      // B2: Thanh toán
      if (paymentMethod === "vnpay") {
        const paymentRes = await axios.post(
          "http://localhost:8080/apis/v1/payments/create",
          {
            bookingId: booking.id,
            method: "VNPAY",
          }
        );

        if (paymentRes.data?.paymentUrl) {
          window.location.href = paymentRes.data.paymentUrl;
          return;
        }
      }

      if (paymentMethod === "cod") {
        window.location.href = "/checkout/success";
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Có lỗi khi tạo booking");
    } finally {
      setIsProcessing(false);
    }
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <img src="/ai-avatar.jpg" className="h-12 w-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
              <span className="text-3xl font-bold text-green-600">OG Camping</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/services"
              className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium"
            >
              Dịch vụ
            </Link>
            <Link
              href="/equipment"
              className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium"
            >
              Thuê thiết bị
            </Link>
            <Link
              href="/combos"
              className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium"
            >
              Combo
            </Link>
            <Link href="/about" className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium">
              Về chúng tôi
            </Link>
            <Link
              href="/contact"
              className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium"
            >
              Liên hệ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-gray-800 font-medium">{user?.name}</span>
                <button onClick={handleGoToCart} className="p-2 rounded hover:bg-gray-100">
                  <ShoppingCart className="h-5 w-5 text-gray-800" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5 text-gray-800" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDashboardNavigation}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Đăng ký</Link>
                </Button>
                <button onClick={handleGoToCart} className="p-2 rounded hover:bg-gray-100">
                  <ShoppingCart className="h-5 w-5 text-gray-800" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-green-600 transition-colors">
            Trang chủ
          </Link>
          <ArrowRight className="w-4 h-4" />
          <Link href="/cart" className="hover:text-green-600 transition-colors">
            Giỏ hàng
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
            <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card className="border-1 border-red-500 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-600" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Họ *</Label>
                      <Input
                        id="firstName"
                        defaultValue={user?.firstName || ""}
                        placeholder="Nguyễn"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Tên *</Label>
                      <Input
                        id="lastName"
                        defaultValue={user?.lastName || ""}
                        placeholder="Văn A"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue={user?.phone || ""}
                      placeholder="0123 456 789"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Input
                      id="address"
                      defaultValue={user?.address || ""}
                      placeholder="123 Đường ABC, Phường XYZ"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Ghi chú đặc biệt cho đơn hàng..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-600" />
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">

                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="vnpay" id="vnpay" />
                      <Label htmlFor="vnpay" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Smartphone className="w-5 h-5 text-pink-600" />
                        <div>
                          <div className="font-medium">Ví VNPAY</div>
                          <div className="text-sm text-gray-600">Thanh toán qua ví điện tử VnPay</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Banknote className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-medium">Thanh toán tại quầy</div>
                          <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Đơn hàng của bạn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-green-200 flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        {item.type === "EQUIPMENT" && item.quantity > 1 && (
                          <Badge className="absolute -top-1 -right-1 bg-green-600 hover:bg-green-700 text-white border-0 text-xs w-6 h-6 rounded-full flex items-center justify-center p-0">
                            {item.quantity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">{item.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600">
                            {item.type === "SERVICE" ? "Dịch vụ" : item.type === "COMBO" ? "Combo" : "Thiết bị"}
                          </span>
                          <span className="font-medium text-green-600 text-sm">
                            {formatPrice(item.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

              </Card>

              {/* Price Summary */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Tóm tắt thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {/* <div className="flex justify-between text-green-600">
                    <span>Giảm giá (CAMPING20)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div> */}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">{formatPrice(total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleCreateBooking}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 h-12 text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Hoàn tất thanh toán
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/cart">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại giỏ hàng
                  </Link>
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Thông tin của bạn được bảo mật 100%</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}