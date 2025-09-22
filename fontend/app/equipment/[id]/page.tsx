"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  MapPin, 
  Package, 
  CheckCircle, 
  XCircle,
  Calendar,
  Users,
  Clock,
  Shield,
  Truck,
  RotateCcw
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Gear {
  id: string
  name: string
  description: string
  category: string
  area: string
  pricePerDay: number
  quantityInStock: number
  available: number
  status: "AVAILABLE" | "OUT_OF_STOCK"
  imageUrl?: string
  createdAt?: string
}

export default function EquipmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [gear, setGear] = useState<Gear | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [rentalDays, setRentalDays] = useState(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    const fetchGear = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching gear with ID:', params.id)
        const response = await fetch(`http://localhost:8080/apis/v1/gears/${params.id}`)
        console.log('🔍 Response status:', response.status)
        
        if (!response.ok) {
          console.error('🔍 Response not OK:', response.status, response.statusText)
          throw new Error('Gear not found')
        }
        const gearData = await response.json()
        console.log('🔍 Gear data received:', gearData)
        
        setGear({
          id: gearData.id || gearData._id || '',
          name: gearData.name || '',
          description: gearData.description || '',
          category: gearData.category || '',
          area: gearData.area || '',
          pricePerDay: gearData.pricePerDay || gearData.price_per_day || 0,
          quantityInStock: gearData.quantityInStock || gearData.quantity_in_stock || 0,
          available: gearData.available || 0,
          status: gearData.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "AVAILABLE",
          imageUrl: gearData.image || gearData.image_url,
          createdAt: gearData.createdAt
        })
      } catch (error) {
        console.error("Error fetching gear:", error)
        router.push('/store')
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchGear()
    }
  }, [params.id, router])

  const getAreaDisplayName = (area: string) => {
    const areaMap: { [key: string]: string } = {
      'TRONG_LEU': 'Trong lều',
      'NGOAI_LEU': 'Ngoài lều',
      'AN_TOAN': 'An toàn',
      'GIAI_TRI': 'Giải trí',
      'AN_UONG': 'Ăn uống'
    }
    return areaMap[area] || area
  }

  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'TRONG_LEU':
        return <Package className="w-5 h-5" />
      case 'NGOAI_LEU':
        return <MapPin className="w-5 h-5" />
      case 'AN_TOAN':
        return <Shield className="w-5 h-5" />
      case 'GIAI_TRI':
        return <Users className="w-5 h-5" />
      case 'AN_UONG':
        return <Package className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  const handleAddToCart = () => {
    if (!gear) return

    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để thêm vào giỏ hàng")
      router.push('/login')
      return
    }

    const cartItem = {
      id: `equipment-${gear.id}-${Date.now()}`,
      type: "EQUIPMENT" as const,
      item: {
        id: gear.id,
        name: gear.name,
        description: gear.description,
        price: gear.pricePerDay,
        imageUrl: gear.imageUrl,
        category: gear.category,
        area: gear.area,
        available: gear.available,
        quantityInStock: gear.quantityInStock
      },
      quantity: quantity,
      rentalDays: rentalDays,
      totalPrice: gear.pricePerDay * quantity * rentalDays
    }

    addToCart(cartItem)
    alert(`Đã thêm ${gear.name} vào giỏ hàng!`)
  }

  const handleRentNow = () => {
    if (!gear) return

    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để thuê thiết bị")
      router.push('/login')
      return
    }

    // Thêm vào giỏ hàng và chuyển đến checkout
    handleAddToCart()
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thiết bị...</p>
        </div>
      </div>
    )
  }

  if (!gear) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy thiết bị</h1>
          <p className="text-gray-600 mb-6">Thiết bị bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button asChild>
            <Link href="/store">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại cửa hàng
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalPrice = gear.pricePerDay * quantity * rentalDays

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/store">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại cửa hàng
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/store" className="hover:text-green-600">Cửa hàng</Link>
              <span>/</span>
              <span className="text-gray-900">{gear.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {gear.imageUrl ? (
                <Image
                  src={gear.imageUrl.startsWith('http') ? gear.imageUrl : `http://localhost:8080${gear.imageUrl}`}
                  alt={gear.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Yêu thích
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500 text-white">
                  {gear.status === 'AVAILABLE' ? 'Còn hàng' : 'Hết hàng'}
                </Badge>
                <Badge variant="outline">{gear.category}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{gear.name}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  {getAreaIcon(gear.area)}
                  <span>{getAreaDisplayName(gear.area)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (24 đánh giá)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-green-600">
                  {gear.pricePerDay.toLocaleString('vi-VN')}đ/ngày
                </span>
                <div className="text-sm text-gray-600">
                  Còn {gear.available}/{gear.quantityInStock} sản phẩm
                </div>
              </div>
              <p className="text-sm text-gray-600">
                * Giá thuê theo ngày, thanh toán khi nhận thiết bị
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
              <p className="text-gray-600 leading-relaxed">{gear.description}</p>
            </div>

            {/* Rental Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Tùy chọn thuê</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Số lượng</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center"
                      min="1"
                      max={gear.available}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(gear.available, quantity + 1))}
                      disabled={quantity >= gear.available}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rentalDays">Số ngày thuê</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRentalDays(Math.max(1, rentalDays - 1))}
                      disabled={rentalDays <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="rentalDays"
                      type="number"
                      value={rentalDays}
                      onChange={(e) => setRentalDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRentalDays(rentalDays + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {quantity} thiết bị × {rentalDays} ngày × {gear.pricePerDay.toLocaleString('vi-VN')}đ/ngày
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRentNow}
                disabled={gear.status === 'OUT_OF_STOCK' || gear.available === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thuê ngay
              </Button>
              
              <Button
                onClick={handleAddToCart}
                variant="outline"
                disabled={gear.status === 'OUT_OF_STOCK' || gear.available === 0}
                className="w-full h-12 text-lg"
              >
                <Package className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Giao hàng miễn phí</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4 text-green-600" />
                <span>Đổi trả trong 24h</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Bảo hành 100%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-green-600" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 space-y-8">
          <Separator />
          
          {/* Specifications */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Thông số kỹ thuật</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="font-medium">{gear.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khu vực sử dụng:</span>
                    <span className="font-medium">{getAreaDisplayName(gear.area)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`font-medium ${gear.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}`}>
                      {gear.status === 'AVAILABLE' ? 'Có sẵn' : 'Hết hàng'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượng còn lại:</span>
                    <span className="font-medium">{gear.available}/{gear.quantityInStock}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin thuê</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá thuê/ngày:</span>
                    <span className="font-medium text-green-600">
                      {gear.pricePerDay.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian thuê tối thiểu:</span>
                    <span className="font-medium">1 ngày</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian thuê tối đa:</span>
                    <span className="font-medium">30 ngày</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí giao hàng:</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
