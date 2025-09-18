"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tent, Mountain, Users, Calendar, MapPin, Star, Filter, Search, MessageCircle, CheckCircle, Sparkles, Settings, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { getServices, Service } from "../api/serviceApi"

export default function ServicesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const router = useRouter()
  const handleGoToCart = () => {
    router.push("/cart");
  };
  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }

  // Handle dashboard navigation based on role
  const handleDashboardNavigation = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin')
    } else if (user?.role === 'STAFF') {
      router.push('/staff')
    } else {
      router.push('/dashboard')
    }
  }
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => {
    const fetchServices = async () => {
      const data = await getServices();
      setServices(data);
    };
    fetchServices();
  }, []);
  //filter
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [people, setPeople] = useState("");
  const [price, setPrice] = useState<[number, number]>([0, 5000000]);
  function normalize(str: string) {
    return str
      .normalize("NFD") // tách chữ + dấu
      .replace(/[\u0300-\u036f]/g, "") // xoá dấu
      .toLowerCase();
  }

  // Lọc data dựa trên state filter
  const filteredServices = useMemo(() => {
    return services.filter(item => {
      function normalize(str: string) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      }

      const matchSearch =
        search === "" ||
        (() => {
          const searchNorm = normalize(search);
          const name = item.name.toLowerCase();
          const location = item.location.toLowerCase();

          // So khớp có dấu
          if (name.includes(search.toLowerCase()) || location.includes(search.toLowerCase())) {
            return true;
          }

          // So khớp không dấu
          return (
            normalize(item.name).includes(searchNorm) ||
            normalize(item.location).includes(searchNorm)
          );
        })();


      const matchLocation =
        location === "all" ||
        item.location.toLowerCase() === location.toLowerCase();

      const matchPeople =
        people === "" ||
        (() => {
          const [min, max] = people.split("-").map(Number);
          return (
            (item.minCapacity <= max && item.maxCapacity >= min)
          );
        })();

      const matchPrice = item.price >= price[0] && item.price <= price[1];

      return matchSearch && matchLocation && matchPeople && matchPrice;
    });
  }, [search, location, people, price, services]);
  const uniqueLocations = Array.from(
    new Set(services.map((s) => s.location))
  );
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dịch vụ cắm trại</h1>
          <p className="text-gray-600 text-lg">Khám phá các gói dịch vụ cắm trại đa dạng, góc nhìn ven hồ và rừng cây xanh</p>
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
              {/* Tìm kiếm */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    className="pl-10"
                    placeholder="Tìm theo tên, địa điểm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Địa điểm */}
              <div>
                <label className="text-sm font-medium mb-2 block">Địa điểm</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {uniqueLocations.map((loc) => (
                      <SelectItem key={loc} value={loc.toLowerCase()}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Số người */}
              <div>
                <label className="text-sm font-medium mb-2 block">Số người</label>
                <Select value={people} onValueChange={setPeople}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số người" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-4">2-4 người</SelectItem>
                    <SelectItem value="4-6">4-6 người</SelectItem>
                    <SelectItem value="6-10">6-10 người</SelectItem>
                    <SelectItem value="10-20">10-20 người</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Giá */}
              <div>
                <label className="text-sm font-medium mb-2 block">Giá (VND)</label>
                <Slider
                  value={price}
                  onValueChange={(val) => setPrice(val as [number, number])}
                  max={5000000}
                  step={100000}
                />

                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{price[0].toLocaleString()}</span>
                  <span>{price[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Services List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const tags = service.tag ? [service.tag] : [];
            let duration = "";
            if (service.minDays != null && service.maxDays != null) {
              duration = `${service.minDays}-${service.maxDays} ngày`;
            } else if (service.minDays != null) {
              duration = `${service.minDays} ngày trở lên`;
            } else if (service.maxDays != null) {
              duration = `Tối đa ${service.maxDays} ngày`;
            }

            let capacity = "";
            if (service.minCapacity != null && service.maxCapacity != null) {
              capacity = `${service.minCapacity}-${service.maxCapacity} người`;
            } else if (service.minCapacity != null) {
              capacity = `Tối thiểu ${service.minCapacity} người`;
            } else if (service.maxCapacity != null) {
              capacity = `Tối đa ${service.maxCapacity} người`;
            }

            const availability = service.availableSlots;

            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20">
                    <img
                      src={
                        service.imageUrl
                          ? `http://localhost:8080${service.imageUrl}`
                          : "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"
                      }
                      alt="background"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Icon phía trên bên phải dựa trên tag */}
                  {tags.includes("POPULAR") && (
                    <Mountain className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />
                  )}
                  {tags.includes("NEW") && (
                    <Tent className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />
                  )}
                  {tags.includes("DISCOUNT") && (
                    <Users className="absolute bottom-4 right-4 w-10 h-10 text-white/80" />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 text-white">
                    {/* Badge dựa trên tag */}
                    {tags.includes("POPULAR") && (
                      <Badge className="mb-2 mx-3 bg-red-500 hover:bg-red-600 text-white">
                        Phổ biến
                      </Badge>
                    )}
                    {tags.includes("NEW") && (
                      <Badge className="mb-2 mx-3 bg-blue-500 hover:bg-blue-600 text-white">
                        Mới
                      </Badge>
                    )}
                    {tags.includes("DISCOUNT") && (
                      <Badge className="mb-2 mx-3 bg-green-500 hover:bg-green-600 text-white">
                        Ưu đãi
                      </Badge>
                    )}

                    <div className="bg-black/40 p-2 w-full">
                      <h3 className="text-lg font-bold mx-3">{service.name}</h3>
                      <p className="text-sm opacity-90 mx-3">{service.location}</p>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardDescription
                    className="line-clamp-2 mb-4"
                    style={{
                      height: "48px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full min-h-[200px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{service.averageRating || 0}</span>
                      <span className="text-sm text-gray-500">
                        ({service.totalReviews || 0})
                      </span>
                    </div>
                    <Badge variant="secondary">{availability}</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="text-sm text-gray-600"
                      style={{ minHeight: "72px" }}
                    >
                      <p className={duration ? "mb-1" : "hidden"}>
                        <Calendar className="inline w-4 h-4 mr-2" />
                        {duration}
                      </p>
                      <p className={capacity ? "mb-1" : "hidden"}>
                        <Users className="inline w-4 h-4 mr-2" />
                        {capacity}
                      </p>
                      <p>
                        <MapPin className="inline w-4 h-4 mr-2" />
                        {service.location}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {service.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <Button className="w-full mt-2" asChild>
                    <Link href={`/services/${service.id}`}>Xem chi tiết</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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