"use client"

<<<<<<< HEAD
import { useState } from "react"
=======
import { useEffect, useState } from "react"
>>>>>>> 4b112d9 (Add or update frontend & backend code)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
<<<<<<< HEAD
import { Tent, ArrowLeft, Calendar, Users, CreditCard, Shield, CheckCircle,Sparkles } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"

export default function BookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    // Customer info
=======
import { Tent, ArrowLeft, Calendar, Users, CreditCard, Shield, CheckCircle, Sparkles, Settings } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Trạng thái user/login
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ id: number; email: string; name: string; role: string } | null>(null)

  // Bước đặt chỗ
  const [currentStep, setCurrentStep] = useState(1)
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
  const [booking, setBooking] = useState<any>(null);

  // Trạng thái service & loading
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Booking data từ query string
  const [bookingData, setBookingData] = useState({
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    fullName: "",
    email: "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
<<<<<<< HEAD

    // Booking details
    date: searchParams.get("date") || "",
    people: Number(searchParams.get("people")) || 4,
    specialRequests: "",

    // Payment
=======
    date: searchParams.get("date") || "",
    people: Number(searchParams.get("people")) || service?.minCapacity || 1,
    allowExtra: searchParams.get("allowExtra") === "true",
    extraPeople: Number(searchParams.get("extraPeople")) || 0,
    specialRequests: "",
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    paymentMethod: "",
    agreeTerms: false,
    agreeInsurance: false,
  })

<<<<<<< HEAD
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

  const handleSubmit = () => {
    // Handle booking submission
    console.log("Booking submitted:", bookingData)
    setCurrentStep(4) // Success step
  }

=======
  // --- State cho availability ---
  const [availability, setAvailability] = useState<null | { totalSlots: number; bookedSlots: number }>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // --- EFFECT: Fetch service data ---

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get("status")

    if (status === "success") {
      setCurrentStep(4)   // ✅ Hiện step thành công
    }
    if (status === "fail") {
      alert("Thanh toán thất bại, vui lòng thử lại.")
      setCurrentStep(1)   // hoặc quay lại bước đầu
    }
  }, [])

  useEffect(() => {
    if (!params?.id) return
    const fetchService = async () => {
      try {
        const res = await fetch(`http://localhost:8080/apis/v1/services/${params.id}`)
        if (!res.ok) throw new Error("Không thể lấy dữ liệu service")
        const data = await res.json()
        setService(data)
      } catch (err) {
        console.error("Lỗi fetch service:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [params?.id])

  // --- EFFECT: Check login ---
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      const parsedUser = JSON.parse(userData)
      setIsLoggedIn(true)
      setUser(parsedUser)

      // Gọi API lấy chi tiết user theo email
      fetchUserByEmail(parsedUser.email)
    }
  }, [])

  // ✅ Hàm lấy thông tin user theo email
  const fetchUserByEmail = async (email: string) => {
    try {
      const res = await fetch(`http://localhost:8080/apis/v1/users/by-email?email=${email}`)
      if (!res.ok) throw new Error("Không thể lấy thông tin user")
      const data = await res.json()

      setBookingData(prev => ({
        ...prev,
        fullName: data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        emergencyContact: prev.emergencyContact,
        emergencyPhone: prev.emergencyPhone,
      }))
    } catch (err) {
      console.error("Lỗi fetch user:", err)
    }
  }

  // --- EFFECT: Fetch availability khi chọn ngày ---
  useEffect(() => {
    if (!bookingData.date || !params?.id) return

    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true)
        setAvailabilityError(null)

        const res = await fetch(
          `http://localhost:8080/apis/v1/services/${params.id}/availability`
        )
        if (!res.ok) throw new Error("Không thể lấy availability")
        const data = await res.json()
        setAvailability(data)
      } catch (err) {
        console.error("Lỗi fetch availability:", err)
        setAvailability(null)
        setAvailabilityError("Chưa có lịch cho ngày này")
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchAvailability()
  }, [bookingData.date, params?.id])
  const bookingId = searchParams.get("bookingId")
  const status = searchParams.get("status")


  useEffect(() => {
    if (bookingId && status === "success") {
      fetch(`http://localhost:8080/apis/v1/bookings/${bookingId}`)
        .then(res => res.json())
        .then(data => setBooking(data))
        .catch(err => console.error("Error loading booking:", err))
    }
  }, [bookingId, status])

  // if (!booking) {
  //   return <p className="text-center py-12">Đang tải thông tin đặt chỗ...</p>
  // }
  // Loading / Error state
  if (loading) return <div className="p-6 text-center">Đang tải...</div>
  if (!service) return <div className="p-6 text-center">Không tìm thấy dịch vụ</div>
  // Extra fee & total lấy từ query (ServiceDetailPage truyền sang)
  const extraFee = Number(searchParams.get("extra")) || 0
  const totalPrice = Number(searchParams.get("total")) || service.price

  // Step control
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3))
  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 1))
  const handleSubmit = async () => {
    try {
      if (!bookingData.paymentMethod) return

      // Nếu chọn VNPay
      if (bookingData.paymentMethod === "vnpay") {
        const payload = {
          bookingId: createdBookingId,
          method: "VNPAY",
        }

        console.log("👉 Body gửi lên:", payload) // log trước khi gửi
        const res = await fetch("http://localhost:8080/apis/v1/payments/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })


        if (!res.ok) throw new Error("Không tạo được thanh toán VNPay")

        const data = await res.json()
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl // redirect sang VNPay
        }
      }

      // Nếu chọn MoMo hoặc Bank → xử lý riêng sau này
      if (bookingData.paymentMethod === "momo") {
        console.log("Thanh toán MoMo (chưa implement)")
        setCurrentStep(4)
      }

      if (bookingData.paymentMethod === "bank") {
        console.log("Thanh toán ngân hàng (chưa implement)")
        setCurrentStep(4)
      }
    } catch (err) {
      console.error("Lỗi khi tạo thanh toán:", err)
      alert("Có lỗi xảy ra khi tạo thanh toán")
    }
  }

  // ✅ Hàm tạo booking
  const handleCreateBooking = async () => {
    try {
      if (!user?.id) {
        alert("Bạn cần đăng nhập trước khi đặt chỗ")
        return
      }

      let checkOutDate = bookingData.date
      if (service?.maxDays && bookingData.date) {
        const d = new Date(bookingData.date)
        d.setDate(d.getDate() + service.maxDays)
        checkOutDate = d.toISOString().split("T")[0]
      }

      const totalPeople = bookingData.people + (bookingData.allowExtra ? bookingData.extraPeople : 0)

      const payload: any = {
        serviceId: service.id,
        comboId: null,
        checkInDate: bookingData.date,
        checkOutDate: checkOutDate,
        numberOfPeople: totalPeople,
        note: bookingData.specialRequests || ""
      }

      // Nếu đã có bookingId trong state → gửi để update
      if (createdBookingId) payload.id = createdBookingId

      const res = await fetch(`http://localhost:8080/apis/v1/bookings?customerId=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Không thể tạo/update booking")

      const data = await res.json()
      console.log("Booking saved:", data)

      // ✅ Lưu bookingId vào state và localStorage
      setCreatedBookingId(data.id)
      localStorage.setItem("bookingId", data.id.toString())

      setCurrentStep(3)
    } catch (err) {
      console.error("Lỗi tạo/update booking:", err)
      alert("Đặt chỗ thất bại, vui lòng thử lại.")
    }
  }



  // Logout & chuyển hướng dashboard
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("user")
    router.push("/login")
  }

  const handleDashboardNavigation = () => {
    if (user?.role === "ADMIN") router.push("/admin")
    else if (user?.role === "STAFF") router.push("/staff")
    else router.push("/dashboard")
  }

  let slotsText = ""
  let isDateUnavailable = false

  if (loadingAvailability) {
    slotsText = "(Đang kiểm tra...)"
  } else if (availabilityError) {
    slotsText = `(${availabilityError})`
    isDateUnavailable = true
  } else if (Array.isArray(availability) && bookingData.date) {
    const selectedDate = availability.find(
      (a: any) => a.date === bookingData.date
    )
    if (selectedDate) {
      const remaining = selectedDate.totalSlots - selectedDate.bookedSlots
      if (remaining <= 0) {
        slotsText = "- Hết chỗ"
        isDateUnavailable = true
      } else {
        slotsText = `- Còn ${remaining} chỗ`
      }
    } else {
      slotsText = "- Chưa có lịch cho ngày này"
      isDateUnavailable = true
    }
  } else {
    slotsText = "(Chưa chọn ngày)"
  }
  const isSuccessStep = currentStep === 4

  // Nếu đã thanh toán thành công thì dùng booking từ backend
  const summaryService = isSuccessStep ? booking.service : service
  const summaryBooking = isSuccessStep ? booking : bookingData



>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
           <span className="text-3xl font-bold text-green-800">OG Camping</span>
=======
            <span className="text-3xl font-bold text-green-800">OG Camping</span>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
            <Button variant="outline" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button
                          asChild
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                        >
                          <Link href="/register">Đăng ký</Link>
             </Button>
=======
            {isLoggedIn ? (
              <>
                <span className="text-gray-800 font-medium">{user?.name}</span>
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
              </>
            )}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
=======
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
                          onChange={(e) => setBookingData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                          id="phone"
<<<<<<< HEAD
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
=======
                          type="tel"
                          value={bookingData.phone}
                          onChange={(e) => {
                            const value = e.target.value
                            // Chỉ cho phép số và tối đa 10 ký tự
                            if (/^\d{0,10}$/.test(value)) {
                              setBookingData((prev) => ({ ...prev, phone: value }))
                            }
                          }}
                          placeholder="09333xxxxx"
                          required
                        />
                        {/* optional: thông báo lỗi */}
                        {bookingData.phone && bookingData.phone.length !== 10 && (
                          <p className="text-red-500 text-sm mt-1">Số điện thoại phải đủ 10 chữ số</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Người liên hệ khẩn cấp *</Label>
                        <Input
                          id="emergencyContact"
                          value={bookingData.emergencyContact}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              emergencyContact: e.target.value,
                            }))
                          }
                          placeholder="Tên người thân"
                          required
                        />
                        {bookingData.emergencyContact.trim() === "" && (
                          <p className="text-red-500 text-sm mt-1">
                            Vui lòng nhập tên người liên hệ khẩn cấp
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="emergencyPhone">SĐT người liên hệ khẩn cấp *</Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={bookingData.emergencyPhone}
                          onChange={(e) => {
                            const value = e.target.value
                            if (/^\d{0,10}$/.test(value)) {
                              setBookingData((prev) => ({ ...prev, emergencyPhone: value }))
                            }
                          }}
                          placeholder="092222xxxxx"
                          required
                        />
                        {bookingData.emergencyPhone && bookingData.emergencyPhone.length !== 10 && (
                          <p className="text-red-500 text-sm mt-1">
                            Số điện thoại phải đủ 10 chữ số
                          </p>
                        )}
                      </div>

>>>>>>> 4b112d9 (Add or update frontend & backend code)
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Details */}
                  <div>
<<<<<<< HEAD
                    <h3 className="font-semibold mb-4">Chi tiết đặt chỗ</h3>
=======
                    <h3 className="font-semibold mb-4">
                      Chi tiết đặt chỗ {slotsText}
                    </h3>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Ngày khởi hành *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingData.date}
<<<<<<< HEAD
=======
                          min={new Date().toISOString().split("T")[0]}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                          onChange={(e) => setBookingData((prev) => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="people">Số người tham gia *</Label>
                        <Select
                          value={bookingData.people.toString()}
<<<<<<< HEAD
                          onValueChange={(value) => setBookingData((prev) => ({ ...prev, people: Number(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
=======
                          onValueChange={(value) => {
                            const newPeople = Number(value)
                            setBookingData((prev) => ({
                              ...prev,
                              people: newPeople,
                              // Nếu số người < maxCapacity thì reset extra
                              ...(newPeople < service.maxCapacity
                                ? { allowExtra: false, extraPeople: 0 }
                                : {}),
                            }))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn số người" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: service.maxCapacity - service.minCapacity + 1 },
                              (_, i) => service.minCapacity + i
                            ).map((num) => (
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                              <SelectItem key={num} value={num.toString()}>
                                {num} người
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
<<<<<<< HEAD
=======
                        {service.allowExtraPeople &&
                          service.maxExtraPeople > 0 &&
                          bookingData.people === service.maxCapacity && (
                            <div className="mt-4 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="allowExtra"
                                checked={bookingData.allowExtra || false}
                                onChange={(e) =>
                                  setBookingData((prev) => ({
                                    ...prev,
                                    allowExtra: e.target.checked,
                                    extraPeople: e.target.checked ? prev.extraPeople : 0,
                                  }))
                                }
                              />
                              <label htmlFor="allowExtra" className="text-sm font-medium">
                                Thêm người (Phụ thu)
                              </label>

                              {bookingData.allowExtra && (
                                <>
                                  <input
                                    type="number"
                                    className="w-16 p-1 border rounded ml-2"
                                    min={0}
                                    max={service.maxExtraPeople}
                                    value={bookingData.extraPeople}
                                    onChange={(e) =>
                                      setBookingData((prev) => ({
                                        ...prev,
                                        extraPeople: Math.min(
                                          Number(e.target.value),
                                          service.maxExtraPeople
                                        ),
                                      }))
                                    }
                                  />
                                  <span className="text-sm text-gray-500 ml-2">
                                    Tối đa +{service.maxExtraPeople} người
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                      </div>
                      <div className="md:col-span-2">
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
                      disabled={!bookingData.fullName || !bookingData.email || !bookingData.phone || !bookingData.date}
=======
                      disabled={
                        !bookingData.fullName ||
                        !bookingData.email ||
                        !bookingData.phone ||
                        !bookingData.date ||
                        isDateUnavailable
                      }
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                    >
                      Tiếp tục
                    </Button>
                  </div>
<<<<<<< HEAD
=======

>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
                          <p>
                            <span className="font-medium">Yêu cầu:</span> {bookingData.specialRequests}
                          </p>
                        )}
=======
                          <p className="break-words whitespace-pre-wrap">
                            <span className="font-medium">Yêu cầu:</span>{" "}
                            {bookingData.specialRequests}
                          </p>
                        )}

>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
                    <Button onClick={handleNext} disabled={!bookingData.agreeTerms || !bookingData.agreeInsurance}>
=======
                    <Button onClick={handleCreateBooking} disabled={!bookingData.agreeTerms || !bookingData.agreeInsurance}>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
                  <div className="space-y-2 mb-6">
                    <p>
                      <span className="font-medium">Mã đặt chỗ:</span> #OGC{Date.now()}
                    </p>
                    <p>
                      <span className="font-medium">Email xác nhận:</span> Đã gửi đến {bookingData.email}
                    </p>
                  </div>
=======

                  <div className="space-y-2 mb-6 text-left mx-auto max-w-md">
                    <p><span className="font-medium">Mã đặt chỗ:</span> #OG00000{booking.id}</p>
                    <p><span className="font-medium">Ngày check-in:</span> {booking.checkInDate}</p>
                    <p><span className="font-medium">Ngày check-out:</span> {booking.checkOutDate}</p>
                    <p><span className="font-medium">Email xác nhận:</span> {user?.email}</p>
                    {booking.note && <p><span className="font-medium">Ghi chú:</span> {booking.note}</p>}
                  </div>

>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
=======

>>>>>>> 4b112d9 (Add or update frontend & backend code)
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Tóm tắt đặt chỗ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
<<<<<<< HEAD
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex-shrink-0"></div>
=======
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex-shrink-0">
                    <img
                      src={`http://localhost:8080${service.imageUrl}`}
                      alt={service.name}
                      className="object-cover w-full h-full"
                      width={64}
                      height={64}
                    />
                  </div>
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.location}</p>
                    <p className="text-sm text-gray-600">{service.duration}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
<<<<<<< HEAD
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
=======
                  {/* Ngày khởi hành */}
                  {/* Ngày khởi hành */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {currentStep === 4
                        ? new Date(booking.checkInDate).toLocaleDateString("vi-VN")
                        : bookingData.date
                          ? new Date(bookingData.date).toLocaleDateString("vi-VN")
                          : "Chưa chọn"}
                    </span>
                  </div>

                  {/* Ngày trả phòng / check-out */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {currentStep === 4
                        ? "" + new Date(booking.checkOutDate).toLocaleDateString("vi-VN")
                        : bookingData.date && service?.maxDays
                          ? "" +
                          new Date(
                            new Date(bookingData.date).setDate(
                              new Date(bookingData.date).getDate() + service.maxDays
                            )
                          ).toLocaleDateString("vi-VN")
                          : "Chưa chọn"}
                    </span>
                  </div>


                  {/* Tổng số người */}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>
                      {currentStep === 4
                        ? booking.numberOfPeople
                        : bookingData.people +
                        (bookingData.allowExtra ? bookingData.extraPeople || 0 : 0)
                      } người
                    </span>
                  </div>

                </div>


                <Separator />

                <div className="space-y-2">
                  {/* Giá gói chính */}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                  <div className="flex justify-between">
                    <span>Giá gói:</span>
                    <span>{service.price.toLocaleString("vi-VN")}đ</span>
                  </div>
<<<<<<< HEAD
                  {bookingData.people > 4 && (
                    <div className="flex justify-between">
                      <span>Phụ thu ({bookingData.people - 4} người):</span>
                      <span>{((bookingData.people - 4) * 200000).toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}
=======


                  {/* Phụ thu (nếu có) */}
                  {currentStep !== 4 ? (
                    bookingData.extraPeople > 0 && (
                      <div className="flex justify-between">
                        <span>Phụ thu ({bookingData.extraPeople} người):</span>
                        <span>
                          {(bookingData.extraPeople * (service.extraFeePerPerson || 0)).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )
                  ) : (
                    booking.numberOfPeople > service.maxCapacity && (
                      <div className="flex justify-between">
                        <span>
                          Phụ thu ({booking.numberOfPeople - service.maxCapacity} người):
                        </span>
                        <span>
                          {(
                            (booking.numberOfPeople - service.maxCapacity) *
                            (service.extraFeePerPerson || 0)
                          ).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )
                  )}


                  {/* Bảo hiểm */}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                  <div className="flex justify-between">
                    <span>Bảo hiểm:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
<<<<<<< HEAD
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{totalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>
=======

                  <Separator />

                  {/* Tổng cộng */}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">
                      {(
                        currentStep === 4
                          ? booking.totalPrice
                          : service.price + (bookingData.extraPeople || 0) * (service.extraFeePerPerson || 0)
                      )?.toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>

>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
