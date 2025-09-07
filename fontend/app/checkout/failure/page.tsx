"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tent,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  CreditCard,
  AlertTriangle,
  Clock,
  Shield,
  HelpCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PaymentFailurePage() {
  const orderNumber = "OG" + Math.random().toString(36).substr(2, 9).toUpperCase()

  const orderItems = [
    {
      id: "1",
      name: "Cắm trại núi Sapa",
      type: "service",
      price: 2500000,
      quantity: 1,
      image: "/mountain-camping-sapa-vietnam.png",
    },
    {
      id: "2",
      name: "Lều cắm trại 4 người",
      type: "equipment",
      price: 350000,
      quantity: 2,
      image: "/camping-tent-4-person-outdoor.png",
    },
    {
      id: "3",
      name: "Túi ngủ cao cấp",
      type: "equipment",
      price: 180000,
      quantity: 4,
      image: "/premium-sleeping-bag-camping.png",
    },
  ]

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = subtotal * 0.2
  const total = subtotal - discount

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const commonIssues = [
    {
      icon: CreditCard,
      title: "Thông tin thẻ không chính xác",
      description: "Kiểm tra lại số thẻ, ngày hết hạn và mã CVV",
    },
    {
      icon: Shield,
      title: "Hạn mức giao dịch",
      description: "Thẻ của bạn có thể đã vượt quá hạn mức cho phép",
    },
    {
      icon: Clock,
      title: "Phiên giao dịch hết hạn",
      description: "Thời gian thanh toán đã quá lâu, vui lòng thử lại",
    },
    {
      icon: AlertTriangle,
      title: "Lỗi từ ngân hàng",
      description: "Ngân hàng từ chối giao dịch, liên hệ ngân hàng để biết chi tiết",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Tent className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-bold text-green-900">OG Camping</span>
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
            <Button variant="outline" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Link href="/register">Đăng ký</Link>
            </Button>
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
          <span className="text-red-600 font-medium">Thất bại</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Failure Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thanh toán không thành công</h1>
          <p className="text-xl text-gray-600 mb-2">Đã xảy ra lỗi trong quá trình thanh toán</p>
          <p className="text-gray-600">
            Đơn hàng <span className="font-semibold text-red-600">#{orderNumber}</span> chưa được xử lý
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Error Details & Solutions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Alert */}
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Lỗi thanh toán:</strong> Giao dịch không thể hoàn tất. Vui lòng kiểm tra thông tin thanh toán và
                thử lại.
              </AlertDescription>
            </Alert>

            {/* Common Issues */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-orange-600" />
                  Nguyên nhân có thể gây lỗi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commonIssues.map((issue, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <issue.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                      <p className="text-sm text-gray-600">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Đơn hàng chưa được xử lý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg opacity-75">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover grayscale"
                      />
                      {item.quantity > 1 && (
                        <Badge className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white border-0 text-xs w-6 h-6 rounded-full flex items-center justify-center p-0">
                          {item.quantity}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-700">{item.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.type === "service" ? "Dịch vụ" : "Thiết bị"} • Số lượng: {item.quantity}
                      </p>
                      <p className="font-semibold text-gray-600">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 opacity-75">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá (CAMPING20)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Support */}
          <div className="space-y-6">
            {/* Retry Payment */}
            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCw className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Thử lại thanh toán</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Đơn hàng của bạn vẫn được giữ trong 30 phút. Bạn có thể thử lại thanh toán ngay bây giờ.
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      asChild
                    >
                      <Link href="/checkout">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Thử lại thanh toán
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Actions */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Tùy chọn khác</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/cart">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại giỏ hàng
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/services">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tiếp tục mua sắm
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/">
                    <Tent className="w-4 h-4 mr-2" />
                    Về trang chủ
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Cần hỗ trợ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp bạn giải quyết vấn đề thanh toán
                </p>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full bg-transparent justify-start" asChild>
                    <Link href="tel:19001234">
                      <Phone className="w-4 h-4 mr-2 text-green-600" />
                      Gọi hotline: 1900 1234
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent justify-start" asChild>
                    <Link href="mailto:support@ogcamping.vn">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      Email: support@ogcamping.vn
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent justify-start">
                    <MessageCircle className="w-4 h-4 mr-2 text-purple-600" />
                    Chat trực tuyến
                  </Button>
                </div>

                <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                  <strong>Thời gian hỗ trợ:</strong> 8:00 - 22:00 hàng ngày
                  <br />
                  <strong>Thời gian phản hồi:</strong> Trong vòng 15 phút
                </div>
              </CardContent>
            </Card>

            {/* Security Note */}
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Bảo mật thông tin</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Thông tin thanh toán của bạn được bảo mật tuyệt đối. Chúng tôi không lưu trữ thông tin thẻ của bạn.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
