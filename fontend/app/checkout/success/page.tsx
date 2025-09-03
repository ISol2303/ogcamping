"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tent,
  CheckCircle,
  Package,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Download,
  Star,
  Gift,
  ShoppingCart,
  Settings,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface BookingItem {
  id: number
  serviceId?: number
  comboId?: number
  euipmentId?: number
  bookingId?: number
  type: "SERVICE" | "EQUIPMENT" | "COMBO"
  numberOfPeople?: number
  name: string
  quantity: number
  price: number
  total: number
  image?: string
}


interface BookingResponse {
  id: number
  items: BookingItem[]
  discount: number
  total: number
}
export default function PaymentSuccessPage() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const status = searchParams.get("status");

  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`http://localhost:8080/apis/v1/bookings/${bookingId}`);
        const data = await res.json();

        // gộp tất cả items từ 3 mảng
        const bookingItems = [
          ...(data.services || []),
          ...(data.combos || []),
          ...(data.equipments || []),
        ];

        if (!bookingItems.length) {
          console.warn("Booking không có item nào");
          return;
        }

        // gọi API để lấy imageUrl
        const enrichedItems = await Promise.all(
          bookingItems.map(async (item: any) => {
            let image = "/placeholder.svg";

            if (item.serviceId) {
              try {
                const serviceRes = await fetch(
                  `http://localhost:8080/apis/v1/services/${item.serviceId}`
                );
                const serviceData = await serviceRes.json();

                if (serviceData.imageUrl) {
                  // đảm bảo không có double slash
                  const path = serviceData.imageUrl.startsWith("/")
                    ? serviceData.imageUrl
                    : `/${serviceData.imageUrl}`;

                  image = serviceData.imageUrl.startsWith("http")
                    ? serviceData.imageUrl
                    : `http://localhost:8080${path}`;
                }

              } catch (err) {
                console.error("Error fetching service image:", err);
              }
            }

            // TODO: nếu có equipmentId thì gọi API equipments giống như trên
            return { ...item, image };
          })
        );

        setItems(enrichedItems);

        const sub = enrichedItems.reduce(
          (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
          0
        );
        const disc = 0; // có thể lấy từ API nếu có mã giảm giá
        const tot = sub - disc;

        setSubtotal(sub);
        setDiscount(disc);
        setTotal(tot);
      } catch (err) {
        console.error("Error fetching booking:", err);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (!bookingId) {
    return <p>Không tìm thấy bookingId</p>;
  }

  // if (status !== "success") {
  //   return <p>Thanh toán thất bại hoặc bị hủy.</p>
  // }
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }

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
  const handleGoToCart = () => {
    router.push("/cart");
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }
  const firstServiceItem = items.find(
    (item) => item.serviceId || item.comboId
  );

  const estimatedDelivery = firstServiceItem?.checkInDate
    ? new Date(firstServiceItem.checkInDate).toLocaleDateString("vi-VN")
    : "Chưa có";
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
          <Link href="/checkout" className="hover:text-green-600 transition-colors">
            Thanh toán
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-green-600 font-medium">Thành công</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thanh toán thành công!</h1>
          <p className="text-xl text-gray-600 mb-2">Cảm ơn bạn đã tin tưởng OG Camping</p>
          <p className="text-gray-600">
            Đơn hàng <span className="font-semibold text-green-600">#OG0000{bookingId}</span> đã được xác nhận
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Chi tiết đơn đặt chỗ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-green-200 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />

                      {/* chỉ hiển thị badge số lượng nếu là equipment */}
                      {item.equipmentId && item.quantity > 1 && (
                        <Badge className="absolute -top-1 -right-1 bg-green-600 hover:bg-green-700 text-white border-0 text-xs w-6 h-6 rounded-full flex items-center justify-center p-0">
                          {item.quantity}
                        </Badge>
                      )}

                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.serviceId
                          ? "Dịch vụ"
                          : item.comboId
                            ? "Combo"
                            : "Thiết bị"}{" "}
                        • {item.serviceId || item.comboId
                          ? `${item.numberOfPeople} người`
                          : `${item.quantity} cái`}
                      </p>


                      <p className="font-semibold text-green-600">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  Thông tin đặt chỗ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Địa điểm nhận chỗ</h4>
                    <div className="space-y-1 text-gray-600">
                      <p className="font-medium text-gray-900">Khu cắm trại Công ty OGCAMPING</p>
                      <p>21 Bis Hậu Giang</p>
                      <p>Phường Tân Sơn Nhất TP HCM</p>
                      <p>Điện thoại hỗ trợ: 0834 999 810</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Thời gian nhận</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Dự kiến: {estimatedDelivery}</span>
                      </div>
                      <p className="text-sm text-gray-600">Khách hàng vui lòng đến nhận chỗ trong khung giờ: 8:00 - 18:00</p>
                      <p className="text-sm text-gray-600">Chúng tôi sẽ liên hệ xác nhận trước khi khách đến</p>
                    </div>
                  </div>
                </div>
              </CardContent>

            </Card>
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Đơn hàng đã được xác nhận</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Chúng tôi đang chuẩn bị đơn hàng của bạn và sẽ sớm giao đến địa chỉ đã cung cấp
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Bước tiếp theo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  asChild
                >
                  <Link href="/dashboard">
                    <Package className="w-4 h-4 mr-2" />
                    Theo dõi đơn hàng
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/services">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Tiếp tục mua sắm
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/">
                    <Tent className="w-4 h-4 mr-2" />
                    Về trang chủ
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Tải hóa đơn
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Cần hỗ trợ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>Hotline: 1900 1234</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span>Email: support@ogcamping.vn</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>Thời gian: 8:00 - 22:00 hàng ngày</span>
                </div>
              </CardContent>
            </Card>

            {/* Review Reminder */}
            <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Đánh giá trải nghiệm</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Sau khi sử dụng dịch vụ, hãy chia sẻ trải nghiệm để giúp chúng tôi cải thiện chất lượng
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Nhận ưu đãi khi đánh giá
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
