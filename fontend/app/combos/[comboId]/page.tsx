"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, MapPin, Clock, Star, Check, ArrowLeft, Heart, Share2, Tent } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { CartItem } from "@/app/services/[id]/page"
interface ComboItem {
  serviceId: number;
  serviceName: string;
  quantity: number;
  price: number;
}

interface ComboDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  duration: string;
  imageUrl: string;
  active: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  location: string;
  minDays?: number | null;
  maxDays?: number | null;
  minPeople?: number | null;
  maxPeople?: number | null;
  highlights: string[];
  tags: string[];
  items: ComboItem[];
  equipment: string[];
  foods: string[];
}

export default function ComboDetailPage() {
  const { comboId } = useParams();
  const router = useRouter();
  const [combo, setCombo] = useState<ComboDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPeople, setSelectedPeople] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    console.log("useEffect chạy, comboId =", comboId);
    if (!comboId) return;

    const fetchCombo = async () => {
      try {
        const res = await fetch(`http://localhost:8080/apis/v1/combos/${comboId}`);
        const data = await res.json();
        console.log("Combo fetched:", data);
        setCombo(data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchCombo();
  }, [comboId]);


  const handleBooking = async () => {
    if (!selectedDate) {
      alert("Vui lòng chọn ngày khởi hành");
      return;
    }

    if (!combo) return;

    // Kiểm tra từng service trong combo
    for (const item of combo.items) {
      try {
        const res = await fetch(
          `http://localhost:8080/apis/v1/services/${item.serviceId}/availability?date=${selectedDate}`
        );
        const availability = await res.json();

        const selectedAvailability = availability.find((a: any) => a.date === selectedDate);

        if (!selectedAvailability) {
          alert(`Ngày này service "${item.serviceName}" chưa có lịch đặt`);
          return;
        }

        if (selectedAvailability.totalSlots - selectedAvailability.bookedSlots <= 0) {
          alert(`Ngày này service "${item.serviceName}" đã hết chỗ`);
          return;
        }
      } catch (err) {
        console.error(err);
        alert(`Không thể kiểm tra lịch của service "${item.serviceName}"`);
        return;
      }
    }

    // Nếu tất cả service còn chỗ, thêm combo vào giỏ
    const checkInDate = new Date(selectedDate);
    const checkOutDate = new Date(checkInDate);
    if (combo.maxDays && combo.maxDays > 0) {
      checkOutDate.setDate(checkOutDate.getDate() + combo.maxDays);
    } else {
      checkOutDate.setDate(checkOutDate.getDate() + 1);
    }

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      type: "COMBO",
      item: combo,
      quantity: 1, // Combo tính nguyên, giá không nhân số người
      totalPrice: combo.price,
      checkInDate: formatDate(checkInDate),
      checkOutDate: formatDate(checkOutDate),
      extraPeople: selectedPeople, // lưu số người tham gia
    };

    setCart(prevCart => {
      const updatedCart = [...prevCart, newItem];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });

    router.push("/cart");
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        <p>Đang tải combo...</p>
      </div>
    )
  }


  if (!combo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy combo</h1>
          <Button onClick={() => router.push("/combos")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách combo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Tent className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">OG Camping</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/services" className="text-gray-600 hover:text-green-600 transition-colors">
              Dịch vụ
            </Link>
            <Link href="/equipment" className="text-gray-600 hover:text-green-600 transition-colors">
              Thuê thiết bị
            </Link>
            <Link href="/combos" className="text-green-600 font-medium">
              Combo
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
            <Button variant="outline" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button className="bg-green-700 hover:bg-green-800" asChild>
              <Link href="/register">Đăng ký</Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push("/combos")}
            className="hover:text-green-600 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Combo
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{combo.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative mb-4">
                <img
                  src={combo.imageUrl ? `http://localhost:8080${combo.imageUrl}` : "/placeholder.svg"}
                  alt={combo.name}
                  className="w-full h-96 object-cover rounded-lg shadow-soft"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Nếu muốn hiển thị nhiều ảnh, hiện tại chỉ có 1 ảnh */}
              <div className="flex gap-2 overflow-x-auto">
                <button
                  className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-green-500"
                >
                  <img
                    src={combo.imageUrl ? `http://localhost:8080${combo.imageUrl}` : "/placeholder.svg"}
                    alt={combo.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>

            {/* Combo Info */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 text-balance">{combo.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{combo.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{combo.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Tối đa {combo.maxPeople} người</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{combo.rating}</span>
                    </div>
                    <span className="text-gray-600">({combo.reviewCount} đánh giá)</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-lg px-3 py-1">
                  Tiết kiệm {combo.discount}%
                </Badge>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{combo.description}</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="services">Dịch vụ</TabsTrigger>
                {/* <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
                <TabsTrigger value="reviews">Đánh giá</TabsTrigger> */}
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Điểm nổi bật</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {combo.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Phân tích giá combo</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tổng giá lẻ:</span>
                      <span className="line-through text-gray-500">{combo.originalPrice.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Giá combo:</span>
                      <span className="font-bold text-green-600">{combo.price.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold text-green-700">
                      <span>Tiết kiệm:</span>
                      <span>{(combo.originalPrice - combo.price).toLocaleString()}đ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* {combo.items.map((service) => (
                      <Card key={service.serviceId} className="card-hover">
                        <CardContent className="p-4">
                          <img
                            src={service.serviceId || "/placeholder.svg"}
                            alt={service.serviceName}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h4 className="font-semibold text-gray-900 mb-2">{service.serviceName}</h4>
                          <p className="text-gray-600 text-sm mb-3">{service.quantity}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-green-600 font-semibold">{service.price.toLocaleString()}đ</span>
                            <Badge variant="outline">Đã bao gồm</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))} */}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <div className="space-y-6">
                  {/* {combo.itinerary.map((day) => (
                    <Card key={day.day}>
                      <CardHeader>
                        <CardTitle className="text-green-700">{day.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {day.activities.map((activity, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="flex-shrink-0 w-16 text-sm font-medium text-green-600">
                                {activity.time}
                              </div>
                              <div className="text-gray-700">{activity.activity}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))} */}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* <div className="flex items-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{combo.rating}</div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(combo.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{combo.reviewCount} đánh giá</div>
                    </div>
                  </div> */}

                  {/* <div className="space-y-4">
                    {combo.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={review.avatar || "/placeholder.svg"}
                              alt={review.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{review.name}</span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div> */}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-soft">
              <CardHeader>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">{combo.price.toLocaleString()}đ</span>
                    <span className="text-sm text-gray-500 line-through">{combo.originalPrice.toLocaleString()}đ</span>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Tiết kiệm {(combo.originalPrice - combo.price).toLocaleString()}đ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày khởi hành</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số người tham gia</label>
                  <select
                    value={selectedPeople}
                    onChange={(e) => setSelectedPeople(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {[...(combo.minPeople && combo.maxPeople ? Array(combo.maxPeople - combo.minPeople + 1) : [1])].map((_, i) => {
                      const peopleCount = (combo.minPeople || 1) + i;
                      return (
                        <option key={peopleCount} value={peopleCount}>
                          {peopleCount} người
                        </option>
                      );
                    })}
                  </select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giá combo</span>
                    <span>{combo.price.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">{combo.price.toLocaleString()}đ</span>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  size="lg"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Đặt ngay
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <p>✓ Miễn phí hủy trong 24h</p>
                  <p>✓ Xác nhận ngay lập tức</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
