"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tent, Users, Calendar, MapPin, Star, Filter, Search, Package, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"
interface ComboItem {
  serviceId: number;
  serviceName: string;
  quantity: number;
  price: number;
}

interface ComboAPI {
  id: number;
  name: string;
  description: string;
  location?: string;
  minDays?: number;
  maxDays?: number;
  minPeople?: number;
  maxPeople?: number;
  originalPrice?: number | null;
  price: number;
  discount?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  imageUrl?: string | null;
  tags?: string[];
  highlights?: string[];
  items?: ComboItem[];
}

interface Combo {
  id: number;
  name: string;
  description: string;
  location: string;
  duration: string;
  capacity: string;
  originalPrice: number;
  comboPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image?: string;       // giữ cho legacy gradient
  imageUrl?: string;    // optional vì không phải lúc nào cũng có
  tags: string[];
  includes: string[];
  highlights: string[];
}


export default function CombosPage() {
  const [priceRange, setPriceRange] = useState([2000000, 8000000])

  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await fetch("http://localhost:8080/apis/v1/combos");
        if (!res.ok) throw new Error("Không thể fetch combos");

        const data: ComboAPI[] = await res.json();

        const formatted: Combo[] = data.map((combo: ComboAPI) => ({
          id: combo.id,
          name: combo.name,
          description: combo.description,
          location: combo.location || "Chưa có",
          duration: combo.minDays && combo.maxDays ? `${combo.minDays}-${combo.maxDays} ngày` : "Chưa có",
          capacity: combo.maxPeople ? `Tối đa ${combo.maxPeople} người` : "Chưa có",
          originalPrice: combo.originalPrice || 0,
          comboPrice: combo.price,
          discount: combo.discount || 0,
          rating: combo.rating || 0,
          reviews: combo.reviewCount || 0,
          image: combo.imageUrl || "placeholder",
          tags: combo.tags?.length ? combo.tags : [`Tiết kiệm ${combo.discount || 0}%`],
          includes: combo.items?.map((item: ComboItem) => `${item.serviceName} (${item.price.toLocaleString()}đ)`) || [],
          highlights: combo.highlights || [],
        }));

        setCombos(formatted);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Lỗi không xác định");
        }
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);


  if (loading) return <p>Đang tải combos...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  const filteredCombos = combos.filter(
    (combo) => combo.comboPrice >= priceRange[0] && combo.comboPrice <= priceRange[1],
  )

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

      {/* Hero Section */}
      <section className="relative h-80 bg-gradient-to-br from-green-600 via-green-700 to-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="w-12 h-12" />
              <h1 className="text-5xl font-black">Combo Cắm Trại</h1>
              <Sparkles className="w-12 h-12" />
            </div>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Khám phá các gói combo tiết kiệm với dịch vụ trọn gói - từ cắm trại đến thiết bị và hoạt động đặc biệt
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm combo theo địa điểm..."
                className="pl-12 py-3 text-lg bg-white/90 backdrop-blur-sm border-0"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8 border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Filter className="w-5 h-5" />
              Bộ lọc tìm kiếm combo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Loại địa điểm</label>
                <Select>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="mountain">Núi</SelectItem>
                    <SelectItem value="beach">Biển</SelectItem>
                    <SelectItem value="forest">Rừng</SelectItem>
                    <SelectItem value="desert">Sa mạc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Số người</label>
                <Select>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Chọn số người" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 người</SelectItem>
                    <SelectItem value="3-4">3-4 người</SelectItem>
                    <SelectItem value="5-6">5-6 người</SelectItem>
                    <SelectItem value="7+">7+ người</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Thời gian</label>
                <Select>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 ngày</SelectItem>
                    <SelectItem value="3-4">3-4 ngày</SelectItem>
                    <SelectItem value="5+">5+ ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Mức độ</label>
                <Select>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Cơ bản</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold mb-3 block text-gray-700">
                Khoảng giá: {priceRange[0].toLocaleString("vi-VN")}đ - {priceRange[1].toLocaleString("vi-VN")}đ
              </label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000000}
                  min={1000000}
                  step={100000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>1.000.000đ</span>
                  <span>10.000.000đ</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="bg-green-700 hover:bg-green-800">Áp dụng bộ lọc</Button>
              <Button variant="outline" className="border-gray-300 bg-transparent">
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Combos Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {filteredCombos.map((combo) => (
            <Card
              key={combo.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white"
            >
              {/* Header with image and basic info */}
              <div className="relative h-48 overflow-hidden">
                {combo.image ? (
                  <img
                    src={`http://localhost:8080${combo.image}`} // prepend base URL
                    alt={combo.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  // Nếu không có imageUrl, dùng placeholder
                  <img
                    src="/placeholder.svg"
                    alt="Placeholder"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {combo.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      className={`text-xs font-semibold ${tag.includes("Tiết kiệm")
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : tag === "Premium" || tag === "Luxury"
                          ? "bg-purple-500 hover:bg-purple-600 text-white"
                          : "bg-white/90 text-gray-800 hover:bg-white"
                        }`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Combo info */}
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <h3 className="text-xl font-bold mb-1 text-white">{combo.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/90">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{combo.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{combo.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{combo.capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Rating and description */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{combo.rating}</span>
                    <span className="text-sm text-gray-500">({combo.reviews} đánh giá)</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Tiết kiệm {combo.discount}%
                  </Badge>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{combo.description}</p>

                {/* Highlights */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2 text-gray-800">Điểm nổi bật:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {combo.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Includes */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2 text-gray-800">Bao gồm:</h4>
                  <div className="space-y-1">
                    {combo.includes.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                    {combo.includes.length > 3 && (
                      <div className="text-xs text-green-600 font-medium">
                        +{combo.includes.length - 3} dịch vụ khác
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing and actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">
                        {combo.originalPrice.toLocaleString("vi-VN")}đ
                      </span>
                      <Badge className="bg-red-100 text-red-800 text-xs">-{combo.discount}%</Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-green-600">
                        {combo.comboPrice.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-gray-500 text-sm">/combo</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hover:bg-gray-50 hover:bg-green-400 bg-transparent" asChild>
                      <Link href={`/combos/${combo.id}`}>Chi tiết</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Custom Combo CTA */}
        <Card className="mt-12 bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10" />
          <CardContent className="relative text-center py-12">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Package className="w-10 h-10" />
                <h3 className="text-3xl font-bold">Tạo combo riêng của bạn</h3>
                <Sparkles className="w-10 h-10" />
              </div>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Kết hợp các dịch vụ yêu thích để tạo combo độc đáo với mức giá ưu đãi nhất
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
                  <Link href="/custom-service">
                    <Package className="w-5 h-5 mr-2" />
                    Tạo combo ngay
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-gray-900 border-white hover:bg-white hover:text-gray-900"
                  asChild
                >
                  <Link href="/ai-consultant">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Tư vấn AI
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mt-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Tiết kiệm đến 25%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Tự chọn dịch vụ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Linh hoạt thời gian</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
