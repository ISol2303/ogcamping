"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tent, Package, Search, Filter, ShoppingCart, Star, CheckCircle, Zap, Sparkles, Settings } from "lucide-react"
import Link from "next/link"
import { fetchEquipment, Equipment } from "../api/equipment" // Import API
import Image from "next/image"


export default function EquipmentPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [filteredEquipment, setFilteredEquipment] = useState(equipment);
  // Thêm state filters
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    minPrice: "",
    maxPrice: ""
  });
  // Lấy danh sách thiết bị từ API
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchEquipment()
        setEquipment(data)
      } catch (err) {
        console.error("Lỗi khi tải thiết bị:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }

  const handleDashboardNavigation = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin')
    } else if (user?.role === 'STAFF') {
      router.push('/staff')
    } else {
      router.push('/dashboard')
    }
  }

  const addToCart = (item: any) => {
    const existing = selectedItems.find((selected) => selected._id === item._id)
    if (existing) {
      setSelectedItems((prev) =>
        prev.map((selected) =>
          selected._id === item._id
            ? { ...selected, quantity: selected.quantity + 1 }
            : selected
        )
      )
    } else {
      setSelectedItems((prev) => [...prev, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item._id !== id))
  }

  const updateQuantity = (id: string, change: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item._id === id) {
            const newQuantity = item.quantity + change
            if (newQuantity <= 0) return null
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean)
    )
  }
  
  useEffect(() => {
    let result = equipment;

    // Filter theo tên
    if (filters.name) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter theo category
    if (filters.category) {
      result = result.filter((item) => item.category === filters.category);
    }

    // Filter theo price
    if (filters.minPrice) {
      result = result.filter((item) => item.price_per_day >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter((item) => item.price_per_day <= Number(filters.maxPrice));
    }

    setFilteredEquipment(result);
  }, [filters, equipment]);


  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.price_per_day * item.quantity, 0)
  }

  const categories = ["Tất cả", "Lều", "Nấu ăn", "Chiếu sáng", "Ngủ nghỉ", "Nội thất", "An toàn"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
            <Link href="/services" className="text-gray-600 hover:text-green-600 transition-colors">
              Dịch vụ
            </Link>
            <Link href="/equipment" className="text-green-600 font-medium">
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thuê thiết bị cắm trại</h1>
          <p className="text-gray-600 text-lg">Chọn thiết bị chất lượng cao cho chuyến đi của bạn</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
           {/* Bộ lọc */}
        <div className="mb-6 p-4 border rounded-lg space-y-2">
          <input
            type="text"
            placeholder="Tìm theo tên..."
            className="border rounded px-2 py-1 w-full"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Tìm theo category..."
            className="border rounded px-2 py-1 w-full"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Giá từ"
              className="border rounded px-2 py-1 w-full"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <input
              type="number"
              placeholder="Giá đến"
              className="border rounded px-2 py-1 w-full"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
        </div>
            {loading ? (
              <p className="text-center text-gray-500">Đang tải thiết bị...</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.map((item) => (
                  <Card key={item._id} className="hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative overflow-hidden">
                      {item.image_url ? (
                     <Image
                          src={`http://localhost:8080/${item.image_url.replace(/^\/+/, '')}`}
                          alt={item.name}
                          width={400}
                          height={300}
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                          <Package className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <p className="text-sm opacity-90">{item.category}</p>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">
                        Còn {item.available}/{item.quantity_in_stock}
                      </Badge>
                      <div className="mt-2">
                        <p className="text-2xl font-bold text-green-600">
                          {typeof item.price_per_day === 'number'
                            ? item.price_per_day.toLocaleString("vi-VN") + 'đ'
                            : 'N/A'}
                        </p>

                      </div>
                      <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                      <Button
                        className="w-full mt-4"
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
            )}
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