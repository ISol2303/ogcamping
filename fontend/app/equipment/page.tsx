"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tent, Package, Search, Filter, ShoppingCart, Star, CheckCircle, Zap } from "lucide-react"
import Link from "next/link"
import { login } from "../api/auth" // Import from auth.ts

export default function EquipmentPage() {
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [priceRange, setPriceRange] = useState([0, 500000])
  const router = useRouter()

  const equipment = [
    {
      id: 1,
      name: "Lều cắm trại 2 người Coleman",
      category: "Lều",
      price: 120000,
      originalPrice: 150000,
      rating: 4.8,
      reviews: 156,
      available: 12,
      total: 15,
      image: "tent-2p",
      features: ["Chống nước", "Dễ dựng", "Nhẹ"],
      description: "Lều 2 người chất lượng cao, chống nước tuyệt đối, dễ dàng lắp đặt trong 5 phút.",
      isPopular: true,
    },
    {
      id: 2,
      name: "Lều cắm trại 4 người Premium",
      category: "Lều",
      price: 180000,
      originalPrice: 220000,
      rating: 4.9,
      reviews: 203,
      available: 8,
      total: 12,
      image: "tent-4p",
      features: ["Rộng rãi", "Chống UV", "Thông gió tốt"],
      description: "Lều gia đình 4 người với không gian rộng rãi, hệ thống thông gió hiện đại.",
      isNew: true,
    },
    {
      id: 3,
      name: "Bếp gas mini portable",
      category: "Nấu ăn",
      price: 80000,
      originalPrice: 100000,
      rating: 4.7,
      reviews: 89,
      available: 20,
      total: 25,
      image: "stove",
      features: ["Tiết kiệm gas", "An toàn", "Compact"],
      description: "Bếp gas mini tiện lợi, tiết kiệm nhiên liệu, phù hợp cho mọi chuyến đi.",
    },
    {
      id: 4,
      name: "Bộ nồi cắm trại titanium",
      category: "Nấu ăn",
      price: 150000,
      originalPrice: 180000,
      rating: 4.6,
      reviews: 67,
      available: 15,
      total: 20,
      image: "cookset",
      features: ["Siêu nhẹ", "Chống dính", "Bền bỉ"],
      description: "Bộ nồi titanium cao cấp, siêu nhẹ và bền bỉ, lý tưởng cho trekking.",
    },
    {
      id: 5,
      name: "Đèn pin LED siêu sáng",
      category: "Chiếu sáng",
      price: 50000,
      originalPrice: 70000,
      rating: 4.5,
      reviews: 234,
      available: 30,
      total: 35,
      image: "flashlight",
      features: ["Siêu sáng", "Pin lâu", "Chống nước"],
      description: "Đèn pin LED công suất cao, pin sử dụng lên đến 20 giờ liên tục.",
    },
    {
      id: 6,
      name: "Đèn lồng cắm trại solar",
      category: "Chiếu sáng",
      price: 90000,
      originalPrice: 120000,
      rating: 4.8,
      reviews: 145,
      available: 18,
      total: 22,
      image: "lantern",
      features: ["Năng lượng mặt trời", "Sạc USB", "Chống nước"],
      description: "Đèn lồng năng lượng mặt trời, có thể sạc điện thoại, hoàn toàn thân thiện môi trường.",
      isEco: true,
    },
    {
      id: 7,
      name: "Túi ngủ mùa hè",
      category: "Ngủ nghỉ",
      price: 100000,
      originalPrice: 130000,
      rating: 4.4,
      reviews: 98,
      available: 25,
      total: 30,
      image: "sleeping-summer",
      features: ["Thoáng mát", "Nhẹ", "Dễ gấp"],
      description: "Túi ngủ mùa hè thoáng mát, phù hợp cho thời tiết từ 15-25°C.",
    },
    {
      id: 8,
      name: "Túi ngủ mùa đông cao cấp",
      category: "Ngủ nghỉ",
      price: 200000,
      originalPrice: 250000,
      rating: 4.9,
      reviews: 167,
      available: 10,
      total: 15,
      image: "sleeping-winter",
      features: ["Siêu ấm", "Chống ẩm", "Compact"],
      description: "Túi ngủ cao cấp chịu được nhiệt độ -10°C, lý tưởng cho cắm trại mùa đông.",
      isPremium: true,
    },
  ]

  const categories = ["Tất cả", "Lều", "Nấu ăn", "Chiếu sáng", "Ngủ nghỉ", "Nội thất", "An toàn"]

  const addToCart = (item: any) => {
    const existing = selectedItems.find((selected) => selected.id === item.id)
    if (existing) {
      setSelectedItems((prev) =>
        prev.map((selected) => (selected.id === item.id ? { ...selected, quantity: selected.quantity + 1 } : selected)),
      )
    } else {
      setSelectedItems((prev) => [...prev, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (id: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, change: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.id === item.id) {
            const newQuantity = item.quantity + change
            if (newQuantity <= 0) return null
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean),
    )
  }

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thuê thiết bị cắm trại</h1>
          <p className="text-gray-600 text-lg">Chọn thiết bị chất lượng cao cho chuyến đi của bạn</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Bộ lọc tìm kiếm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input className="pl-10" placeholder="Tìm theo tên, loại thiết bị..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Danh mục</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Giá (VND/ngày)</label>
                    <Slider
                      defaultValue={[0, 500000]}
                      max={500000}
                      step={10000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{priceRange[0].toLocaleString("vi-VN")}</span>
                      <span>{priceRange[1].toLocaleString("vi-VN")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <Package className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />
                    <div className="absolute bottom-4 left-4 text-white">
                      {item.isPopular && (
                        <Badge className="mb-2 bg-red-500 hover:bg-red-600 text-white">Phổ biến</Badge>
                      )}
                      {item.isNew && (
                        <Badge className="mb-2 bg-blue-500 hover:bg-blue-600 text-white">Mới</Badge>
                      )}
                      {item.isEco && (
                        <Badge className="mb-2 bg-green-500 hover:bg-green-600 text-white">Thân thiện môi trường</Badge>
                      )}
                      {item.isPremium && (
                        <Badge className="mb-2 bg-purple-500 hover:bg-purple-600 text-white">Cao cấp</Badge>
                      )}
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <p className="text-sm opacity-90">{item.category}</p>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{item.rating}</span>
                        <span className="text-sm text-gray-500">({item.reviews})</span>
                      </div>
                      <Badge variant="secondary">
                        Còn {item.available}/{item.total}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{item.price.toLocaleString("vi-VN")}đ</p>
                        <p className="text-sm text-gray-500 line-through">
                          {item.originalPrice.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 mb-4 space-y-1">
                      {item.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      onClick={() => addToCart(item)}
                      disabled={item.available === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.available === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Giỏ hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItems.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.price.toLocaleString("vi-VN")}đ x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-6 w-6 p-0"
                          >
                            -
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-6 w-6 p-0"
                            disabled={item.quantity >= item.available}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Tổng cộng:</span>
                        <span className="font-bold text-green-600">{getTotalPrice().toLocaleString("vi-VN")}đ</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">*Giá thuê theo ngày</p>

                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Thuê ngay
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Ưu đãi đặc biệt</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Thuê từ 3 ngày giảm 10%</li>
                    <li>• Thuê từ 7 ngày giảm 20%</li>
                    <li>• Miễn phí giao nhận trong nội thành</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Consultant CTA */}
        <Card className="mt-12 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-black border-0 shadow-2xl">
          <CardContent className="text-center py-12">
            <Zap className="w-16 h-16 mx-auto mb-6 text-lime-300 drop-shadow-lg" />
            <h3 className="text-3xl font-bold mb-4 drop-shadow-md">Không biết chọn thiết bị nào?</h3>
            <p className="text-xl text-lime-300 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              AI tư vấn thông minh sẽ giúp bạn chọn thiết bị phù hợp nhất dựa trên loại hình cắm trại và ngân sách
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-white text-gray-900 hover:bg-gray-100 border-0 shadow-lg"
            >
              <Link href="/ai-consultant">
                <Zap className="w-5 h-5 mr-2" />
                Tư vấn AI miễn phí
              </Link>
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