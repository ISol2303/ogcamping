"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tent, Users, Calendar, MapPin, Star, Filter, Search, Package, CheckCircle, Sparkles, ArrowRight, MessageCircle } from "lucide-react"
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
  minPeople: number;
  maxPeople: number;
  minDays: number;
  maxDays: number;
}


export default function CombosPage() {
  const [filters, setFilters] = useState({
    location: "all",
    people: "",
    days: "",
    search: "", // thêm search
  })
  const [priceRange, setPriceRange] = useState([500000, 10000000])
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
          minPeople: combo.minPeople || 0,
          maxPeople: combo.maxPeople || 0,
          minDays: combo.minDays || 0,
          maxDays: combo.maxDays || 0
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
  //filter
  const locationOptions = Array.from(
    new Set(combos.map(c => c.location).filter(Boolean)) // lọc unique và bỏ null
  );
  const minPeople = Math.min(...combos.map(c => c.minPeople || 1));
  const maxPeople = Math.max(...combos.map(c => c.maxPeople || 1));
  const peopleOptions = Array.from({ length: maxPeople - minPeople + 1 }, (_, i) => minPeople + i);
  const minDays = Math.min(...combos.map(c => c.minDays || 1));
  const maxDays = Math.max(...combos.map(c => c.maxDays || 1));
  const dayOptions = [];
  for (let i = minDays; i <= maxDays; i++) {
    dayOptions.push(i);
  }

  if (loading) return <p>Đang tải combos...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  // Filter logic
  const filteredCombos = combos.filter((combo) => {
    // Kiểm tra khoảng giá
    const inPriceRange =
      combo.comboPrice >= priceRange[0] && combo.comboPrice <= priceRange[1];

    // Kiểm tra địa điểm
    const matchLocation =
      filters.location === "all" ||
      combo.location?.toLowerCase().includes(filters.location.toLowerCase());

    let matchPeople = true;
    if (filters.people && filters.people !== "all") {
      const selectedPeople = parseInt(filters.people, 10);
      matchPeople =
        selectedPeople >= (combo.minPeople || 1) &&
        selectedPeople <= (combo.maxPeople || 999);
    }


    // Kiểm tra số ngày
    let matchDays = true;
    if (filters.days && filters.days !== "all") {
      const selectedDays = parseInt(filters.days, 10);
      matchDays =
        selectedDays >= (combo.minDays || 1) &&
        selectedDays <= (combo.maxDays || 999);
    }



    // Kiểm tra tên
    const matchName =
      !filters.search ||
      combo.name.toLowerCase().includes(filters.search.toLowerCase());

    return (
      inPriceRange &&
      matchLocation &&
      matchPeople &&
      matchDays &&
      matchName
    );
  });


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
    

      {/* Hero Section */}
      <section className="relative h-80 bg-gradient-to-br from-green-600 via-green-700 to-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-green-700"></div>
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
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black-400 w-5 h-5" />
              <Input
                placeholder="Tìm combo theo tên..."
                value={filters.search} // gắn value
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                } // cập nhật state
                className="pl-12 py-3 text-lg bg-white/90 backdrop-blur-sm border-0 text-black"
              />
            </div>

          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Filter className="w-5 h-5" />
              Bộ lọc tìm kiếm combo
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {/* Địa điểm */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">
                  Địa điểm
                </label>
                <Select
                  value={filters.location}
                  onValueChange={(val) => setFilters({ ...filters, location: val })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {locationOptions.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">
                  Số người
                </label>
                <Select
                  value={filters.people}
                  onValueChange={(val) => setFilters({ ...filters, people: val })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Chọn số người" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {peopleOptions.map(p => (
                      <SelectItem key={p} value={String(p)}>
                        {p} người
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Thời gian */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">
                  Thời gian
                </label>
                <Select
                  value={filters.days}
                  onValueChange={(val) => setFilters({ ...filters, days: val })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Chọn số ngày" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {dayOptions.map(d => (
                      <SelectItem key={d} value={String(d)}>
                        {d} ngày
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>
            </div>

            {/* Khoảng giá */}
            <div className="mt-6">
              <label className="text-sm font-semibold mb-3 block text-gray-700">
                Khoảng giá: {priceRange[0].toLocaleString("vi-VN")}đ - {priceRange[1].toLocaleString("vi-VN")}đ
              </label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000000}
                  min={500000}
                  step={100000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>500.000đ</span>
                  <span>10.000.000đ</span>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3 mt-6">
              <Button className="bg-green-700 hover:bg-green-800">
                Áp dụng bộ lọc
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 bg-transparent"
                onClick={() => {
                  setFilters({ location: "all", people: "", days: "", search: "" });
                  setPriceRange([500000, 10000000]);
                }}
              >
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
        {/* <Card className="mt-12 bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white overflow-hidden relative">
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
        </Card> */}

      </div>
      <section className="py-20 px-4 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-8">
            <MessageCircle className="w-10 h-10 text-green-200" />
          </div>
          <h2 className="text-4xl font-bold mb-6">Không biết chọn gói nào phù hợp?</h2>
          <p className="text-xl text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            AI tư vấn thông minh của chúng tôi sẽ giúp bạn tìm ra gói dịch vụ hoàn hảo dựa trên sở thích, ngân sách và
            kinh nghiệm của bạn
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-gray-900 hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl h-14 px-8 text-lg font-semibold transition-all"
            asChild
          >
            <Link href="/ai-consultant">
              <MessageCircle className="w-5 h-5 mr-2" />
              Bắt đầu tư vấn miễn phí
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

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
            <p>&copy; 2025 OG Camping Private. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
