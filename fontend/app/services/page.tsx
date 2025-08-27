"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tent, Mountain, Users, Calendar, MapPin, Star, Filter, Search, MessageCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { login } from "../api/auth" // Import from auth.ts

export default function ServicesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const router = useRouter()

  const services = [
    {
      id: 1,
      name: "Cắm trại núi cao Sapa",
      location: "Sapa, Lào Cai",
      duration: "2-3 ngày",
      capacity: "4-6 người",
      price: 2500000,
      rating: 4.8,
      reviews: 124,
      image: "mountain",
      tags: ["Núi", "Trekking", "Phổ biến"],
      availability: "Còn 3 slot",
      description:
        "Trải nghiệm cắm trại trên núi cao với view tuyệt đẹp, bao gồm lều, thực phẩm và hướng dẫn viên chuyên nghiệp",
    },
    {
      id: 2,
      name: "Cắm trại bãi biển Phú Quốc",
      location: "Phú Quốc, Kiên Giang",
      duration: "1-2 ngày",
      capacity: "2-4 người",
      price: 1800000,
      rating: 4.9,
      reviews: 89,
      image: "beach",
      tags: ["Biển", "Lặn", "Mới"],
      availability: "Còn 5 slot",
      description: "Cắm trại bên bờ biển với hoạt động lặn ngắm san hô, BBQ hải sản tươi ngon",
    },
    {
      id: 3,
      name: "Cắm trại gia đình Đà Lạt",
      location: "Đà Lạt, Lâm Đồng",
      duration: "2-4 ngày",
      capacity: "6-10 người",
      price: 3200000,
      rating: 4.7,
      reviews: 156,
      image: "family",
      tags: ["Gia đình", "Trẻ em", "Ưu đãi"],
      availability: "Còn 2 slot",
      description: "Gói dành cho gia đình với nhiều hoạt động vui chơi, an toàn cho trẻ em",
    },
    {
      id: 4,
      name: "Cắm trại rừng Cát Tiên",
      location: "Cát Tiên, Đồng Nai",
      duration: "3-4 ngày",
      capacity: "4-8 người",
      price: 2800000,
      rating: 4.6,
      reviews: 78,
      image: "forest",
      tags: ["Rừng", "Động vật", "Khám phá"],
      availability: "Hết chỗ",
      description: "Khám phá thiên nhiên hoang dã, quan sát động vật trong môi trường tự nhiên",
    },
    {
      id: 5,
      name: "Cắm trại thác Sekumpul",
      location: "Bali, Indonesia",
      duration: "3-5 ngày",
      capacity: "2-6 người",
      price: 4500000,
      rating: 4.9,
      reviews: 203,
      image: "waterfall",
      tags: ["Thác nước", "Quốc tế", "Premium"],
      availability: "Còn 4 slot",
      description: "Tour quốc tế đến thác nước nổi tiếng Bali với dịch vụ cao cấp",
    },
    {
      id: 6,
      name: "Cắm trại sa mạc Mũi Né",
      location: "Mũi Né, Bình Thuận",
      duration: "1-2 ngày",
      capacity: "2-4 người",
      price: 1500000,
      rating: 4.5,
      reviews: 67,
      image: "desert",
      tags: ["Sa mạc", "Hoàng hôn", "Độc đáo"],
      availability: "Còn 6 slot",
      description: "Trải nghiệm cắm trại trên đồi cát với hoàng hôn tuyệt đẹp",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dịch vụ cắm trại</h1>
          <p className="text-gray-600 text-lg">Khám phá các gói dịch vụ cắm trại đa dạng, từ núi cao đến bãi biển</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input className="pl-10" placeholder="Tìm theo tên, địa điểm..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Địa điểm</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="sapa">Sapa</SelectItem>
                    <SelectItem value="phuquoc">Phú Quốc</SelectItem>
                    <SelectItem value="dalat">Đà Lạt</SelectItem>
                    <SelectItem value="cattien">Cát Tiên</SelectItem>
                    <SelectItem value="bali">Bali</SelectItem>
                    <SelectItem value="muine">Mũi Né</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Số người</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số người" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-4">2-4 người</SelectItem>
                    <SelectItem value="4-6">4-6 người</SelectItem>
                    <SelectItem value="6-10">6-10 người</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Giá (VND)</label>
                <Slider defaultValue={[0, 5000000]} max={5000000} step={100000} />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>0</span>
                  <span>5,000,000</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                {service.image === "mountain" && <Mountain className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />}
                {service.image === "beach" && <Tent className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />}
                {service.image === "family" && <Users className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />}
                {service.image === "forest" && <Tent className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />}
                {service.image === "waterfall" && <Tent className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />}
                {service.image === "desert" && <Tent className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />}
                <div className="absolute bottom-4 left-4 text-white">
                  {service.tags.includes("Phổ biến") && (
                    <Badge className="mb-2 bg-red-500 hover:bg-red-600 text-white">Phổ biến</Badge>
                  )}
                  {service.tags.includes("Mới") && (
                    <Badge className="mb-2 bg-blue-500 hover:bg-blue-600 text-white">Mới</Badge>
                  )}
                  {service.tags.includes("Ưu đãi") && (
                    <Badge className="mb-2 bg-green-500 hover:bg-green-600 text-white">Ưu đãi</Badge>
                  )}
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <p className="text-sm opacity-90">{service.location}</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.reviews})</span>
                  </div>
                  <Badge variant="secondary">{service.availability}</Badge>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    <p><Calendar className="inline w-4 h-4 mr-2" />{service.duration}</p>
                    <p><Users className="inline w-4 h-4 mr-2" />{service.capacity}</p>
                    <p><MapPin className="inline w-4 h-4 mr-2" />{service.location}</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{service.price.toLocaleString("vi-VN")}đ</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/services/${service.id}`}>Xem chi tiết</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Service CTA */}
        <Card className="mt-12 bg-gradient-to-r from-green-600 to-green-700 text-back border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Tent className="w-8 h-8" />
              <h3 className="text-3xl font-bold">Tạo gói dịch vụ riêng</h3>
              <Star className="w-8 h-8" />
            </div>
            <p className="text-xl text-back/90 mb-8 leading-relaxed">
              Không tìm thấy gói phù hợp? Hãy tự thiết kế chuyến cắm trại hoàn hảo theo sở thích của bạn với thiết bị
              và dịch vụ tùy chọn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
                <Link href="/custom-service">
                  <Tent className="w-5 h-5 mr-2" />
                  Tạo gói riêng ngay
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="text-gray-900 border-white hover:bg-white hover:text-gray-900"
                asChild
              >
                <Link href="/ai-consultant">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Tư vấn với AI
                </Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Tự chọn thiết bị</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Linh hoạt thời gian</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Giá cả minh bạch</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Consultant CTA */}
        <Card className="mt-8 bg-gradient-to-r from-green-600 to-green-700 text-back">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Không tìm thấy gói phù hợp?</h3>
            <p className="text-back/90 mb-8">
              Để AI tư vấn giúp bạn tìm gói dịch vụ hoàn hảo dựa trên sở thích và ngân sách
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/ai-consultant">Tư vấn với AI ngay</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tent className="h-8 w-8 text-green-400" />
                <span className="text-2xl font-bold">OG Camping</span>
              </div>
              <p className="text-gray-400">Mang đến trải nghiệm cắm trại hoàn hảo với công nghệ AI tiên tiến</p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Dịch vụ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Cắm trại núi
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Cắm trại biển
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Cắm trại gia đình
                  </Link>
                </li>
                <li>
                  <Link href="/equipment" className="hover:text-white transition-colors">
                    Thuê thiết bị
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/ai-consultant" className="hover:text-white transition-colors">
                    Tư vấn AI
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/policy" className="hover:text-white transition-colors">
                    Chính sách
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📞 1900 1234</li>
                <li>📧 info@ogcamping.vn</li>
                <li>📍 123 Đường ABC, TP.HCM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OG Camping Private. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}