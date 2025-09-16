"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, Star, Clock, Shield, Utensils, Tent, Camera, ArrowLeft, Settings, Sparkles, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
interface Availability {
  id: number;
  date: string;
  totalSlots: number;
  bookedSlots: number;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  location: string;
  duration: string;
  minDays?: number;
  maxDays?: number;
  capacity: string;
  minCapacity: number;
  maxCapacity: number;
  allowExtraPeople: boolean;
  extraFeePerPerson?: number;
  maxExtraPeople: number;
  imageUrl?: string;
  availability?: ServiceAvailability[];
  itinerary?: ItineraryDay[];
  highlights?: string[];
  included?: string[];
}

export interface ServiceAvailability {
  date: string; // "YYYY-MM-DD"
  totalSlots: number;
  bookedSlots: number;
}

export interface ItineraryDay {
  day: string; // "Ngày 1"
  title: string;
  activities: string[];
}

export interface Combo {
  id: number;
  name: string;
  description?: string;
  price: number;
  active?: boolean;
  items?: ComboItem[];
}

export interface ComboItem {
  id: number;
  service?: Service;
  equipment?: Equipment;
  quantity: number;
  price: number;
}

export interface Equipment {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  type: "SERVICE" | "COMBO" | "EQUIPMENT";
  item: Service | Combo | Equipment;
  quantity: number;
  totalPrice: number;
  // chỉ dành cho service
  checkInDate?: string;
  checkOutDate?: string;
  allowExtra?: boolean;
  extraPeople?: number;
}

export default function ServiceDetailPage() {
  const params = useParams()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const router = useRouter()
  const [service, setService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedPeople, setSelectedPeople] = useState<number>(0)
  const [allowExtraChecked, setAllowExtraChecked] = useState(false)
  const [extraPeople, setExtraPeople] = useState(0)

  const [dateError, setDateError] = useState("")
  const [peopleError, setPeopleError] = useState("")

  const today = new Date().toISOString().split("T")[0]
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<Combo[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Load cart từ localStorage lúc khởi tạo
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`http://localhost:8080/apis/v1/services/${params.id}`)
        const data: Service = await res.json()
        setService(data)
      } catch (err) {
        console.error("Fetch service error:", err)
      }
    }
    if (params.id) fetchService()
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [params.id])

  if (!service) {
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>
  }

  const selectedAvailability = (service.availability || []).find(
    (a) => a.date === selectedDate
  )

  const maxAllowed = service.allowExtraPeople
    ? service.maxCapacity + service.maxExtraPeople
    : service.maxCapacity

  const peopleOptions = Array.from(
    { length: maxAllowed - service.minCapacity + 1 },
    (_, i) => service.minCapacity + i
  )

  const totalPeople = selectedPeople + (allowExtraChecked ? extraPeople : 0)
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    router.push('/login');
  };
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
  const handleBooking = () => {
    let hasError = false;
    const token = localStorage.getItem("authToken");

    // ✅ Kiểm tra ngày khởi hành
    if (!selectedDate) {
      setDateError("Vui lòng chọn ngày khởi hành");
      hasError = true;
    } else if (!selectedAvailability) {
      setDateError("Chưa có lịch đặt cho ngày này");
      hasError = true;
    } else if (selectedAvailability.totalSlots - selectedAvailability.bookedSlots <= 0) {
      setDateError("Ngày này đã hết chỗ");
      hasError = true;
    } else {
      setDateError("");
    }

    // ✅ Kiểm tra số người
    if (!selectedPeople || selectedPeople <= 0) {
      setPeopleError("Vui lòng chọn số người");
      hasError = true;
    } else {
      setPeopleError("");
    }

    if (hasError) return;

    // ✅ Nếu chưa login → lưu redirect gốc + chuyển login
    if (!token) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
      router.push("/login");
      return;
    }

    // ✅ Nếu đã login → sang booking page
    const totalPeople = selectedPeople + (allowExtraChecked ? extraPeople : 0);
    const extraFee = allowExtraChecked && extraPeople > 0
      ? extraPeople * (service.extraFeePerPerson || 0)
      : 0
    const total = service.price + extraFee
    router.push(
      `/booking/${service.id}?date=${selectedDate}&people=${selectedPeople}&allowExtra=${allowExtraChecked}&extraPeople=${extraPeople}`
    );
  };


  const handleAddToCart = () => {
    if (!service) return;

    if (!selectedDate) {
      alert("Vui lòng chọn ngày khởi hành");
      return;
    }

    const availabilityList = service.availability || [];
    const selectedAvailability = availabilityList.find(a => a.date === selectedDate);

    if (!selectedAvailability) {
      alert("Ngày này chưa có lịch đặt");
      return;
    }

    if (selectedAvailability.totalSlots - selectedAvailability.bookedSlots <= 0) {
      alert("Ngày này đã hết chỗ");
      return;
    }

    const totalPeople = selectedPeople + (allowExtraChecked ? extraPeople : 0);
    const maxAllowed = service.allowExtraPeople
      ? service.maxCapacity + (service.maxExtraPeople || 0)
      : service.maxCapacity;

    if (totalPeople < service.minCapacity) {
      alert(`Số người tối thiểu là ${service.minCapacity}`);
      return;
    }

    if (totalPeople > maxAllowed) {
      alert(`Số người tối đa cho phép là ${maxAllowed}`);
      return;
    }

    // ✅ Tính checkOutDate dựa vào maxDays
    const checkInDate = new Date(selectedDate);
    let checkOutDate = new Date(checkInDate);

    if (service.maxDays && service.maxDays > 0) {
      checkOutDate.setDate(checkOutDate.getDate() + service.maxDays);
    } else {
      // Nếu không có maxDays thì mặc định 1 ngày
      checkOutDate.setDate(checkOutDate.getDate() + 1);
    }

    // format yyyy-MM-dd
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      type: "SERVICE",
      item: service,
      quantity: totalPeople,
      totalPrice: service.price + (allowExtraChecked ? extraPeople * (service.extraFeePerPerson || 0) : 0),
      checkInDate: formatDate(checkInDate),
      checkOutDate: formatDate(checkOutDate),
      allowExtra: allowExtraChecked,
      extraPeople: extraPeople || 0,
    };

    // Cập nhật state và localStorage
    setCart(prevCart => {
      const updatedCart = [...prevCart, newItem];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });

    router.push('/cart')
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
            <span className="text-3xl font-bold text-green-600">OG Camping</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/services" className="text-green-600 font-medium">
              Dịch vụ
            </Link>
            <Link href="/equipment" className="text-gray-600 hover:text-green-600 transition-colors">
              Thuê thiết bị
            </Link>
            <Link href="/ai-consultant" className="text-gray-600 hover:text-green-600 transition-colors">
              Tư vấn AI
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors">
              Về chúng tôi
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-green-600 transition-colors">
              Liên hệ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
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

                {/* Icon giỏ hàng vẫn hiện ngay cả khi chưa đăng nhập */}
                <button onClick={handleGoToCart} className="p-2 rounded hover:bg-gray-100">
                  <ShoppingCart className="h-5 w-5 text-gray-800" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/services" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
            <ArrowLeft className="w-4 h-4" />
            Quay lại dịch vụ
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="h-64 md:h-80 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20">
                <div className="relative h-56 w-full rounded-lg overflow-hidden">
                  <Image
                    src={service.imageUrl ? `http://localhost:8080${service.imageUrl}` : "/default.jpg"}
                    alt={service.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {service.capacity}
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                {/* Badge hiển thị số chỗ trống theo ngày chọn */}
                {selectedDate && (
                  <Badge variant="secondary" className="mt-2">
                    {selectedAvailability ? (
                      selectedAvailability.totalSlots - selectedAvailability.bookedSlots > 0
                        ? `Còn ${selectedAvailability.totalSlots - selectedAvailability.bookedSlots} chỗ`
                        : "Hết chỗ"
                    ) : (
                      "Không có lịch cho ngày này"
                    )}
                  </Badge>
                )}
              </div>
            </div>

            {/* Service Details */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
                <TabsTrigger value="included">Bao gồm</TabsTrigger>
                <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Mô tả dịch vụ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">{service.description}</p>

                    {/* Hiển thị highlights nếu có */}
                    {service.highlights && service.highlights.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Điểm nổi bật</h3>
                        <div className="grid md:grid-cols-2 gap-2">
                          {service.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                      <div className="text-center">
                        <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-medium">An toàn</h4>
                        <p className="text-sm text-gray-600">Bảo hiểm đầy đủ</p>
                      </div>
                      <div className="text-center">
                        <Utensils className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-medium">Ẩm thực</h4>
                        <p className="text-sm text-gray-600">Món địa phương</p>
                      </div>
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-medium">Nhiếp ảnh</h4>
                        <p className="text-sm text-gray-600">Hỗ trợ chụp ảnh</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>

              <TabsContent value="itinerary">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch trình chi tiết</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {service.itinerary?.map((day, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <h3 className="font-semibold text-lg text-green-700">{day.day}</h3>
                          <h4 className="font-medium mb-3">{day.title}</h4>
                          <div className="space-y-2">
                            {day.activities?.map((activity, actIndex) => (
                              <div key={actIndex} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-gray-700">{activity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="included">
                <Card>
                  <CardHeader>
                    <CardTitle>Dịch vụ bao gồm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {service.included?.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Đánh giá từ khách hàng</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{service.rating}</span>
                        <span className="text-gray-500">({service.reviews.length} đánh giá)</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {service.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{review.user}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Đặt dịch vụ</span>
                  {/* Badge hiển thị số chỗ trống theo ngày chọn */}
                  {selectedDate && (
                    <Badge variant="secondary" className="mt-2">
                      {selectedAvailability
                        ? `Còn ${selectedAvailability.totalSlots - selectedAvailability.bookedSlots} chỗ`
                        : "Không có lịch cho ngày này"}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-green-600">{service.price?.toLocaleString("vi-VN")}đ</span>
                  <span className="text-gray-500">/gói</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {/* Ngày khởi hành */}
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">Ngày khởi hành</label>
                    <input
                      type="date"
                      className={`w-full p-2 border rounded-lg ${dateError ? "border-red-500" : "border-gray-300"}`}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                    />
                    {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
                  </div>

                  {/* Số người tham gia */}
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">Số người tham gia</label>
                    <select
                      className={`w-full p-2 border rounded-lg ${peopleError ? "border-red-500" : "border-gray-300"
                        }`}
                      value={selectedPeople}
                      onChange={(e) => setSelectedPeople(Number(e.target.value))}
                    >
                      <option value={0}>Chọn số người</option>
                      {Array.from(
                        { length: service.maxCapacity - service.minCapacity + 1 },
                        (_, i) => service.minCapacity + i
                      ).map((num) => (
                        <option key={num} value={num}>
                          {num} người
                        </option>
                      ))}
                    </select>
                    {peopleError && (
                      <p className="text-red-500 text-sm mt-1">{peopleError}</p>
                    )}
                  </div>

                  {/* Cho phép thêm người ngoài maxCapacity */}
                  {service.allowExtraPeople && service.maxExtraPeople > 0 && selectedPeople === service.maxCapacity && (
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="allowExtra"
                        checked={allowExtraChecked}
                        onChange={(e) => {
                          setAllowExtraChecked(e.target.checked);
                          if (!e.target.checked) {
                            setExtraPeople(0); // reset nếu bỏ chọn
                          }
                        }}
                      />
                      <label htmlFor="allowExtra" className="text-sm font-medium">
                        Thêm người ngoài giới hạn
                      </label>

                      {allowExtraChecked && (
                        <>
                          <input
                            type="number"
                            className="w-16 p-1 border rounded ml-2"
                            min={0}
                            max={service.maxExtraPeople}
                            value={extraPeople}
                            onChange={(e) =>
                              setExtraPeople(
                                Math.min(Number(e.target.value), service.maxExtraPeople)
                              )
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
                <div className="border-t pt-4">
                  {/* Giá gói chính */}
                  <div className="flex justify-between mb-2">
                    <span>Giá gói:</span>
                    <span>{service.price?.toLocaleString("vi-VN")}đ</span>
                  </div>

                  {/* Phụ thu (nếu có) */}
                  {allowExtraChecked && extraPeople > 0 && (
                    <div className="flex justify-between mb-2">
                      <span>
                        Phụ thu ({extraPeople} người):
                      </span>
                      <span>
                        {(extraPeople * (service.extraFeePerPerson || 0)).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}

                  {/* Tổng cộng */}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">
                      {(
                        service.price +
                        (allowExtraChecked && extraPeople > 0
                          ? extraPeople * (service.extraFeePerPerson || 0)
                          : 0)
                      ).toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>
                </div>


              
                <Button className="w-full mt-2" size="lg" onClick={handleAddToCart}>
                  Thêm vào kế hoạch
                </Button>



                <Button variant="outline" className="w-full" asChild>
                  <Link href="/ai-consultant">Tư vấn với AI</Link>
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <p>✓ Miễn phí hủy trong 24h</p>
                  <p>✓ Hỗ trợ 24/7</p>
                  <p>✓ Bảo hiểm du lịch</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div >
  )
}
