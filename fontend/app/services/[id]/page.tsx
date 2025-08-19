"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, Star, Clock, Shield, Utensils, Tent, Camera, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ServiceDetailPage() {
  const params = useParams()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedPeople, setSelectedPeople] = useState(4)

  // Mock data - would come from API
  const service = {
    id: 1,
    name: "Cắm trại núi cao Sapa",
    location: "Sapa, Lào Cai",
    duration: "2-3 ngày",
    capacity: "4-6 người",
    price: 2500000,
    rating: 4.8,
    reviews: 124,
    availability: "Còn 3 slot",
    description:
      "Trải nghiệm cắm trại trên núi cao với view tuyệt đẹp, bao gồm lều, thực phẩm và hướng dẫn viên chuyên nghiệp. Khám phá vẻ đẹp hoang sơ của núi rừng Tây Bắc.",
    highlights: [
      "View núi non hùng vĩ",
      "Hướng dẫn viên chuyên nghiệp",
      "Thiết bị cắm trại đầy đủ",
      "Thực phẩm địa phương",
      "Hoạt động trekking",
      "Chụp ảnh sunrise/sunset",
    ],
    included: [
      "Lều cắm trại chất lượng cao",
      "Túi ngủ và đệm",
      "Bữa ăn (3 bữa/ngày)",
      "Hướng dẫn viên",
      "Thiết bị an toàn",
      "Bảo hiểm du lịch",
    ],
    itinerary: [
      {
        day: "Ngày 1",
        title: "Khởi hành và setup camp",
        activities: [
          "06:00 - Tập trung tại điểm hẹn",
          "08:00 - Khởi hành đến Sapa",
          "14:00 - Đến điểm cắm trại, setup lều",
          "16:00 - Trekking khám phá xung quanh",
          "19:00 - BBQ và giao lưu",
        ],
      },
      {
        day: "Ngày 2",
        title: "Khám phá và trải nghiệm",
        activities: [
          "05:30 - Ngắm sunrise trên đỉnh núi",
          "07:00 - Ăn sáng",
          "09:00 - Trekking đến thác nước",
          "12:00 - Ăn trưa picnic",
          "15:00 - Hoạt động team building",
          "20:00 - Đêm lửa trại",
        ],
      },
      {
        day: "Ngày 3",
        title: "Kết thúc chuyến đi",
        activities: [
          "06:00 - Ăn sáng và dọn dẹp",
          "08:00 - Trekking về điểm xuất phát",
          "12:00 - Ăn trưa và nghỉ ngơi",
          "14:00 - Khởi hành về thành phố",
          "19:00 - Về đến điểm tập trung",
        ],
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Nguyễn Văn A",
        rating: 5,
        date: "15/11/2024",
        comment: "Chuyến đi tuyệt vời! Hướng dẫn viên rất nhiệt tình, cảnh đẹp không thể tả. Sẽ quay lại lần nữa!",
      },
      {
        id: 2,
        user: "Trần Thị B",
        rating: 5,
        date: "10/11/2024",
        comment: "Dịch vụ chuyên nghiệp, thiết bị đầy đủ. Đặc biệt ấn tượng với bữa ăn địa phương.",
      },
      {
        id: 3,
        user: "Lê Văn C",
        rating: 4,
        date: "05/11/2024",
        comment: "Trải nghiệm tốt, chỉ có điều thời tiết hơi lạnh. Nhưng nhìn chung rất hài lòng.",
      },
    ],
  }
const today = new Date().toISOString().split("T")[0];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Tent className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">OG Camping</span>
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
            <Button variant="outline" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Đăng ký</Link>
            </Button>
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
              <div className="absolute inset-0 bg-black/20"></div>
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
                <Badge className="bg-green-500 text-white">{service.availability}</Badge>
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
                      {service.itinerary.map((day, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <h3 className="font-semibold text-lg text-green-700">{day.day}</h3>
                          <h4 className="font-medium mb-3">{day.title}</h4>
                          <div className="space-y-2">
                            {day.activities.map((activity, actIndex) => (
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
                      {service.included.map((item, index) => (
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

              <TabsContent value="reviews">
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Đặt dịch vụ</span>
                  <Badge variant="secondary">{service.availability}</Badge>
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-green-600">{service.price.toLocaleString("vi-VN")}đ</span>
                  <span className="text-gray-500">/gói</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ngày khởi hành</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                     min={today}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Số người tham gia</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={selectedPeople}
                    onChange={(e) => setSelectedPeople(Number(e.target.value))}
                  >
                    <option value={2}>2 người</option>
                    <option value={3}>3 người</option>
                    <option value={4}>4 người</option>
                    <option value={5}>5 người</option>
                    <option value={6}>6 người</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Giá gói:</span>
                    <span>{service.price.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Phụ thu ({selectedPeople > 4 ? selectedPeople - 4 : 0} người):</span>
                    <span>{selectedPeople > 4 ? ((selectedPeople - 4) * 200000).toLocaleString("vi-VN") : 0}đ</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">
                      {(service.price + (selectedPeople > 4 ? (selectedPeople - 4) * 200000 : 0)).toLocaleString(
                        "vi-VN",
                      )}
                      đ
                    </span>
                  </div>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link href={`/booking/${service.id}?date=${selectedDate}&people=${selectedPeople}`}>Đặt ngay</Link>
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
    </div>
  )
}
