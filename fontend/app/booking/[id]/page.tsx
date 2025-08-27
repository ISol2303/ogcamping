'use client';


import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tent, ArrowLeft, Calendar, Users, CreditCard, Shield, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import axios from "axios"
import router from "next/router"


export default function BookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    // Customer info
    fullName: "",
    email: "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",

    // Booking details
    date: searchParams.get("date") || "",
    people: Number(searchParams.get("people")) || 4,
    specialRequests: "",

    // Payment
    paymentMethod: "",
    agreeTerms: false,
    agreeInsurance: false,

    // Priority (add default value)
    priority: "NORMAL" as 'NORMAL' | 'HIGH' | 'LOW',
  })


  // Mock service data
  const service = {
    id: 1,
    name: "Cắm trại núi cao Sapa",
    location: "Sapa, Lào Cai",
    duration: "2-3 ngày",
    price: 2500000,
    image: "mountain",
  }

  const totalPrice = service.price + (bookingData.people > 4 ? (bookingData.people - 4) * 200000 : 0)

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  interface Order {
    customerName: string;
    phone: string;
    people: number;
    bookingDate: string;
    totalPrice: number;
    specialRequests?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    priority: 'NORMAL' | 'HIGH' | 'LOW';
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    paymentMethod: 'vnpay' | 'momo' | 'bank';
  }
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setBookingData((prev) => ({
          ...prev,
          email: parsed.email || ""
        }));
      } else {
        // Guest → để trống để họ nhập
        setBookingData((prev) => ({
          ...prev,
          email: ""
        }));
      }
    } catch (err) {
      console.error("Lỗi parse user:", err);
    }
  }, []);


  const handleSubmit = async () => {
    try {
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      // Mapping bookingData sang Order
      const orderToSave: any = {
        customerName: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone,
        people: bookingData.people,
        bookingDate: new Date(bookingData.date).toISOString(),
        totalPrice,
        specialRequests: bookingData.specialRequests,
        emergencyContact: bookingData.emergencyContact,
        emergencyPhone: bookingData.emergencyPhone,
        priority: bookingData.priority || "NORMAL",
        status: "PENDING",
        paymentMethod: bookingData.paymentMethod as "vnpay" | "momo" | "bank",
      };

      if (token) {
        // Nếu login → gắn token để backend lấy email từ User
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        // Nếu guest → email phải có trong bookingData
        if (!bookingData.email || bookingData.email.trim() === "") {
          alert("Vui lòng nhập email để đặt đơn.");
          return;
        }
        orderToSave.email = bookingData.email;
      }

      // Gửi lên backend
      const response = await axios.post(
        "http://localhost:8080/apis/orders",
        orderToSave
      );

      console.log("Order created:", response.data);

      // Chuyển sang bước 4: thành công
      setCurrentStep(4);
    } catch (err: any) {
      console.error("Lỗi khi tạo đơn:", err.response?.data || err.message);
      alert("Lỗi khi tạo đơn, vui lòng thử lại.");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <img src="/ai-avatar.jpg" className="h-12 w-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
            <span className="text-3xl font-bold text-green-800">OG Camping</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/services" className="text-gray-600 hover:text-green-600 transition-colors">
              Dịch vụ
            </Link>
            <Link href="/equipment" className="text-gray-600 hover:text-green-600 transition-colors">
              Thuê thiết bị
            </Link>
            <Link href="/ai-consultant" className="text-gray-600 hover:text-green-600 transition-colors">
              Tư vấn AI
            </Link>
            <Link
              href="/about"
              className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium relative group"
            >
              Về chúng tôi
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium relative group"
            >
              Liên hệ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/register">Đăng ký</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href={`/services/${params.id}`} className="flex items-center gap-2 text-gray-600 hover:text-green-600">
            <ArrowLeft className="w-4 h-4" />
            Quay lại chi tiết dịch vụ
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-80 h-1 mx-5 ${currentStep > step ? "bg-green-600" : "bg-gray-200"}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? "text-green-600 font-medium" : "text-gray-500"}>Thông tin</span>
            <span className={currentStep >= 2 ? "text-green-600 font-medium" : "text-gray-500"}>Xác nhận</span>
            <span className={currentStep >= 3 ? "text-green-600 font-medium" : "text-gray-500"}>Thanh toán</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin đặt chỗ</CardTitle>
                  <CardDescription>Vui lòng điền đầy đủ thông tin để hoàn tất đặt chỗ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-semibold mb-4">Thông tin khách hàng</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên *</Label>
                        <Input
                          id="fullName"
                          value={bookingData.fullName}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Nguyễn Văn A"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingData.email}
                          onChange={(e) =>
                            setBookingData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          disabled={!!localStorage.getItem("authToken")} // nếu có login thì disable
                          className="bg-gray-100 text-black"
                        />
                      </div>



                      <div>
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                          id="phone"
                          value={bookingData.phone}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="0123456789"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Người liên hệ khẩn cấp</Label>
                        <Input
                          id="emergencyContact"
                          value={bookingData.emergencyContact}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                          placeholder="Tên người thân"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="emergencyPhone">SĐT người liên hệ khẩn cấp</Label>
                        <Input
                          id="emergencyPhone"
                          value={bookingData.emergencyPhone}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                          placeholder="0987654321"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Details */}
                  <div>
                    <h3 className="font-semibold mb-4">Chi tiết đặt chỗ</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Ngày khởi hành *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="people">Số người tham gia *</Label>
                        <Select
                          value={bookingData.people.toString()}
                          onValueChange={(value) => setBookingData((prev) => ({ ...prev, people: Number(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} người
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
                        <Textarea
                          id="specialRequests"
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, specialRequests: e.target.value }))}
                          placeholder="Ví dụ: Ăn chay, dị ứng thực phẩm, yêu cầu đặc biệt khác..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleNext}
                      disabled={!bookingData.fullName || !bookingData.email || !bookingData.phone || !bookingData.date}
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Xác nhận thông tin</CardTitle>
                  <CardDescription>Vui lòng kiểm tra lại thông tin trước khi thanh toán</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Họ tên:</span> {bookingData.fullName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {bookingData.email}
                        </p>
                        <p>
                          <span className="font-medium">SĐT:</span> {bookingData.phone}
                        </p>
                        {bookingData.emergencyContact && (
                          <p>
                            <span className="font-medium">Liên hệ khẩn cấp:</span> {bookingData.emergencyContact} -{" "}
                            {bookingData.emergencyPhone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Chi tiết chuyến đi</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Ngày:</span>{" "}
                          {new Date(bookingData.date).toLocaleDateString("vi-VN")}
                        </p>
                        <p>
                          <span className="font-medium">Số người:</span> {bookingData.people} người
                        </p>
                        {bookingData.specialRequests && (
                          <p>
                            <span className="font-medium">Yêu cầu:</span> {bookingData.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={bookingData.agreeTerms}
                        onCheckedChange={(checked) =>
                          setBookingData((prev) => ({ ...prev, agreeTerms: checked as boolean }))
                        }
                      />
                      <Label htmlFor="agreeTerms" className="text-sm">
                        Tôi đồng ý với{" "}
                        <Link href="/terms" className="text-green-600 hover:underline">
                          điều khoản dịch vụ
                        </Link>{" "}
                        và{" "}
                        <Link href="/privacy" className="text-green-600 hover:underline">
                          chính sách bảo mật
                        </Link>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeInsurance"
                        checked={bookingData.agreeInsurance}
                        onCheckedChange={(checked) =>
                          setBookingData((prev) => ({ ...prev, agreeInsurance: checked as boolean }))
                        }
                      />
                      <Label htmlFor="agreeInsurance" className="text-sm">
                        Tôi đồng ý tham gia bảo hiểm du lịch (đã bao gồm trong giá)
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevious}>
                      Quay lại
                    </Button>
                    <Button onClick={handleNext} disabled={!bookingData.agreeTerms || !bookingData.agreeInsurance}>
                      Tiếp tục thanh toán
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Thanh toán</CardTitle>
                  <CardDescription>Chọn phương thức thanh toán để hoàn tất đặt chỗ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Phương thức thanh toán</Label>
                    <div className="grid gap-3 mt-3">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="vnpay"
                          checked={bookingData.paymentMethod === "vnpay"}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">VNPay</p>
                            <p className="text-sm text-gray-600">Thanh toán qua VNPay</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="momo"
                          checked={bookingData.paymentMethod === "momo"}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-pink-100 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-medium">MoMo</p>
                            <p className="text-sm text-gray-600">Ví điện tử MoMo</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="bank"
                          checked={bookingData.paymentMethod === "bank"}
                          onChange={(e) => setBookingData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Chuyển khoản ngân hàng</p>
                            <p className="text-sm text-gray-600">Chuyển khoản trực tiếp</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Thanh toán an toàn</h4>
                        <p className="text-sm text-blue-700">
                          Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevious}>
                      Quay lại
                    </Button>
                    <Button onClick={handleSubmit} disabled={!bookingData.paymentMethod}>
                      Thanh toán {totalPrice.toLocaleString("vi-VN")}đ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Đặt chỗ thành công!</h2>
                  <p className="text-gray-600 mb-6">
                    Cảm ơn bạn đã đặt dịch vụ. Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận chi tiết.
                  </p>
                  <div className="space-y-2 mb-6">
                    <p>
                      <span className="font-medium">Mã đặt chỗ:</span> #OGC{Date.now()}
                    </p>
                    <p>
                      <span className="font-medium">Email xác nhận:</span> Đã gửi đến {bookingData.email}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button asChild>
                      <Link href="/dashboard">Xem đơn hàng</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/services">Đặt thêm dịch vụ</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Tóm tắt đặt chỗ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.location}</p>
                    <p className="text-sm text-gray-600">{service.duration}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {bookingData.date ? new Date(bookingData.date).toLocaleDateString("vi-VN") : "Chưa chọn"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{bookingData.people} người</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Giá gói:</span>
                    <span>{service.price.toLocaleString("vi-VN")}đ</span>
                  </div>
                  {bookingData.people > 4 && (
                    <div className="flex justify-between">
                      <span>Phụ thu ({bookingData.people - 4} người):</span>
                      <span>{((bookingData.people - 4) * 200000).toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Bảo hiểm:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{totalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Miễn phí hủy trong 24h</p>
                  <p>✓ Bảo hiểm du lịch</p>
                  <p>✓ Hỗ trợ 24/7</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
