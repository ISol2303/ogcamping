"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye,
  Mountain,
  Tent,
  Users,
  Package,
  ArrowRight,
  Grid3X3,
  List,
  MapPin,
  Clock,
  CheckCircle,
  XCircle
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

interface Category {
  id: string
  name: string
  count: number
}

interface Area {
  id: string
  name: string
  count: number
}

export default function StorePage() {
  const [gears, setGears] = useState<Gear[]>([])
  const [filteredGears, setFilteredGears] = useState<Gear[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedArea, setSelectedArea] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { addToCart } = useCart()

  // Fetch gears from API
  useEffect(() => {
    const fetchGears = async () => {
      try {
        setLoading(true)
        
        // Fetch gears from API
        const response = await fetch("http://localhost:8080/apis/v1/gears")
        const gearsData = await response.json()
        
        // Transform data to Gear format
        const gearsList: Gear[] = gearsData.map((gear: any) => ({
          id: gear.id || gear._id || '',
          name: gear.name || '',
          description: gear.description || '',
          category: gear.category || '',
          area: gear.area || '',
          pricePerDay: gear.pricePerDay || gear.price_per_day || 0,
          quantityInStock: gear.quantityInStock || gear.quantity_in_stock || 0,
          available: gear.available || 0,
          status: gear.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "AVAILABLE",
          imageUrl: gear.image || gear.image_url,
          createdAt: gear.createdAt
        }))
        
        setGears(gearsList)
        setFilteredGears(gearsList)
        
        // Generate categories
        const categoryMap = new Map<string, number>()
        const areaMap = new Map<string, number>()
        
        gearsList.forEach(gear => {
          // Count categories
          const categoryCount = categoryMap.get(gear.category) || 0
          categoryMap.set(gear.category, categoryCount + 1)
          
          // Count areas
          const areaCount = areaMap.get(gear.area) || 0
          areaMap.set(gear.area, areaCount + 1)
        })
        
        const categoriesList: Category[] = [
          { id: "all", name: "Tất cả danh mục", count: gearsList.length },
          ...Array.from(categoryMap.entries()).map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            count
          }))
        ]
        
        const areasList: Area[] = [
          { id: "all", name: "Tất cả khu vực", count: gearsList.length },
          ...Array.from(areaMap.entries()).map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: getAreaDisplayName(name),
            count
          }))
        ]
        
        setCategories(categoriesList)
        setAreas(areasList)
      } catch (error) {
        console.error("Error fetching gears:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchGears()
  }, [])

  // Helper function to get display name for area
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

  // Filter and search gears
  useEffect(() => {
    let filtered = [...gears]
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(gear =>
        gear.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gear.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gear.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gear.area.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(gear => 
        gear.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      )
    }
    
    // Filter by area
    if (selectedArea !== "all") {
      filtered = filtered.filter(gear => 
        gear.area.toLowerCase().replace(/\s+/g, '-') === selectedArea
      )
    }
    
    // Sort gears
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.pricePerDay - b.pricePerDay)
        break
      case "price-high":
        filtered.sort((a, b) => b.pricePerDay - a.pricePerDay)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case "available":
        filtered.sort((a, b) => b.available - a.available)
        break
      case "popular":
      default:
        filtered.sort((a, b) => b.quantityInStock - a.quantityInStock)
        break
    }
    
    setFilteredGears(filtered)
  }, [gears, searchTerm, selectedCategory, selectedArea, sortBy])

  const handleAddToCart = (gear: Gear) => {
    const cartItem = {
      id: `equipment-${gear.id}`, // Remove Date.now() to allow proper duplicate detection
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
      quantity: 1,
      rentalDays: 1,
      totalPrice: gear.pricePerDay
    }

    addToCart(cartItem)
    alert(`Đã thêm ${gear.name} vào giỏ hàng!`)
  }

  const handleViewDetails = (gear: Gear) => {
    router.push(`/equipment/${gear.id}`)
  }

  const getGearIcon = (gear: Gear) => {
    switch (gear.area) {
      case 'TRONG_LEU':
        return <Tent className="w-5 h-5" />
      case 'NGOAI_LEU':
        return <Mountain className="w-5 h-5" />
      case 'AN_TOAN':
        return <CheckCircle className="w-5 h-5" />
      case 'GIAI_TRI':
        return <Users className="w-5 h-5" />
      case 'AN_UONG':
        return <Package className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  const getGearBadge = (gear: Gear) => {
    if (gear.status === "OUT_OF_STOCK") {
      return <Badge className="bg-red-500 text-white">Hết hàng</Badge>
    }
    if (gear.available < 5) {
      return <Badge className="bg-yellow-500 text-white">Sắp hết</Badge>
    }
    return <Badge className="bg-green-500 text-white">Còn hàng</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cửa hàng thiết bị cắm trại</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá các thiết bị cắm trại chất lượng cao với giá thuê hợp lý theo ngày
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm thiết bị..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Area Filter */}
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Chọn khu vực" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name} ({area.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Phổ biến</SelectItem>
                <SelectItem value="price-low">Giá thấp → cao</SelectItem>
                <SelectItem value="price-high">Giá cao → thấp</SelectItem>
                <SelectItem value="name">Tên A-Z</SelectItem>
                <SelectItem value="available">Còn nhiều nhất</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Hiển thị {filteredGears.length} thiết bị
          </p>
        </div>

        {/* Gears Grid/List */}
        {filteredGears.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thiết bị</h3>
            <p className="text-gray-600 mb-6">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            <Button onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
              setSelectedArea("all")
            }}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredGears.map((gear) => (
              <Card key={gear.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  {/* Gear Image */}
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {gear.imageUrl ? (
                      <Image
                        src={gear.imageUrl.startsWith('http') ? gear.imageUrl : `http://localhost:8080${gear.imageUrl}`}
                        alt={gear.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        {getGearIcon(gear)}
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <div className="absolute top-2 left-2">
                    {getGearBadge(gear)}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    {/* Category & Area */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{gear.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {getAreaDisplayName(gear.area)}
                      </span>
                    </div>

                    {/* Gear Name */}
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {gear.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {gear.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-600">
                        {gear.pricePerDay.toLocaleString('vi-VN')}đ/ngày
                      </span>
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>Tổng: {gear.quantityInStock}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${gear.available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {gear.available > 0 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span>Còn: {gear.available}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`flex items-center gap-1 ${gear.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-500'}`}>
                        {gear.status === 'AVAILABLE' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span>{gear.status === 'AVAILABLE' ? 'Có sẵn' : 'Hết hàng'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(gear)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem chi tiết
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(gear)}
                        disabled={gear.status === 'OUT_OF_STOCK' || gear.available === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Thuê ngay
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
