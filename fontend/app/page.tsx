"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tent, Mountain, Users, Star, MessageCircle, Calendar, Shield, Zap, ArrowRight, Sparkles, Settings, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
interface Service {
  id: number
  name: string
  description: string
  duration?: string
  capacity?: string
  tag?: "NEW" | "POPULAR" | "DISCOUNT" | null
  price: number
  averageRating?: number
  totalReviews?: number
  imageUrl?: string | null
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const [services, setServices] = useState<Service[]>([]) // lưu dịch vụ từ API
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // Kiểm tra login và fetch service
  useEffect(() => {
    // check login từ localStorage
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }

    // fetch services từ API
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:8080/apis/v1/services")
        const data: Service[] = await res.json()
        setServices(data.slice(-3)) // lấy 3 dịch vụ cuối cùng
      } catch (err) {
        console.error("Lỗi khi fetch services:", err)
      }
    }
    fetchServices()
  }, [])

  // Style cho tag
  const tagStyles: Record<string, { text: string; className: string }> = {
    POPULAR: { text: "Phổ biến", className: "bg-red-500 hover:bg-red-600" },
    NEW: { text: "Mới", className: "bg-green-500 hover:bg-green-600" },
    DISCOUNT: { text: "Khuyến mãi", className: "bg-yellow-500 hover:bg-yellow-600" },
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUser(null)
  }
  const handleGoToCart = () => {
    router.push("/cart");
  };
  // Chuyển dashboard theo role
  const handleDashboardNavigation = () => {
    if (user?.role === "ADMIN") {
      router.push("/admin")
    } else if (user?.role === "STAFF") {
      router.push("/staff")
    } else {
      router.push("/dashboard")
    }
  }
  //BLOGS
  const handleBlogsNavigation = () => {
    if (user?.role === "ADMIN") {
      router.push("/admin/blogs");
    } else if (user?.role === "STAFF") {
      router.push("/staff/blogs");
    } else if (user?.role === "CUSTOMER") {
      router.push("/blogs");
    } else {
      router.push("/blogs"); // GUEST cũng về trang blogs chung
    }
  };
  useEffect(() => {
    fetch("http://localhost:8080/apis/blogs/public")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlogs(data);
        else if (Array.isArray(data.content)) setBlogs(data.content);
        else setBlogs([]);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setBlogs([]);
      });
  }, []);

  // Format duration + capacity
  function formatDurationCapacity(duration?: string, capacity?: string) {
    const validDuration = duration && duration !== "null-null ngày" ? duration : null
    const validCapacity = capacity && capacity !== "null-null người" ? capacity : null
    if (!validDuration && !validCapacity) return null
    return [validDuration, validCapacity].filter(Boolean).join(" | ")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-green-100 to-green-200 text-white hover:from-green-200 hover:to-green-300 border-0 px-6 py-2 text-sm font-semibold">
            <Zap className="w-4 h-4 mr-2" />
            Tư vấn AI thông minh
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 bg-clip-text">
              Trải nghiệm cắm trại
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 bg-clip-text">
              hoàn hảo
            </span>
          </h1>
          <p className="text-xl text-gray-800 mb-10 max-w-3xl mx-auto leading-relaxed">
            Khám phá thiên nhiên với dịch vụ cắm trại chuyên nghiệp và AI tư vấn thông minh. Tạo gói dịch vụ theo sở
            thích, thuê thiết bị chất lượng cao.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all h-14 px-8 text-lg font-semibold"
              asChild
            >
              <Link href="/services">
                <Calendar className="w-5 h-5 mr-2" />
                Đặt dịch vụ ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 h-14 px-8 text-lg font-semibold transition-all"
              asChild
            >
              <Link href="/ai-consultant">
                <MessageCircle className="w-5 h-5 mr-2" />
                Tư vấn AI miễn phí
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text mb-6">
              Tại sao chọn OG Camping?
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi mang đến trải nghiệm cắm trại hoàn hảo với công nghệ hiện đại và dịch vụ chuyên nghiệp
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">AI Tư vấn thông minh</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-800 leading-relaxed">
                  AI chuyên dụng tư vấn gói dịch vụ phù hợp nhất dựa trên sở thích và ngân sách của bạn
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Tent className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Gói dịch vụ linh hoạt</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-800 leading-relaxed">
                  Tùy chỉnh gói cắm trại theo ý muốn: địa điểm, thời gian, số người, hoạt động giải trí
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Thiết bị chất lượng</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-800 leading-relaxed">
                  Cho thuê thiết bị cắm trại chất lượng cao, kiểm tra tình trạng realtime
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Hỗ trợ 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-800 leading-relaxed">
                  Đội ngũ chuyên nghiệp hỗ trợ khách hàng mọi lúc, mọi nơi trong suốt hành trình
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-green-100">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text mb-6">
              Dịch vụ nổi bật
            </h2>
            <p className="text-xl text-gray-800 leading-relaxed">
              Khám phá các gói dịch vụ cắm trại được yêu thích nhất
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm group"
              >
                {/* Hình ảnh nền */}
                <div className="h-56 bg-gradient-to-br from-green-400 to-green-600 relative overflow-hidden">
                  {/* Ảnh nền */}
                  <Image
                    src={service.imageUrl ? `http://localhost:8080${service.imageUrl}` : "/default.jpg"}
                    alt={service.name}
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  <Mountain className="absolute bottom-4 right-4 w-10 h-10 text-white/80 group-hover:scale-110 transition-transform duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 h-24">
                    {/* Overlay full width */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Text bên trên overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white min-h-[60px] flex-col justify-end gap-1">
                      {/* Badge */}
                      {service.tag ? (
                        <Badge
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full
              ${tagStyles[service.tag]?.className || "bg-gray-500"} text-white border-0`}
                        >
                          {tagStyles[service.tag]?.text || service.tag}
                        </Badge>

                      ) : (
                        <div className="h-5"></div> // placeholder giữ layout nếu không có tag
                      )}


                      {/* Name */}
                      <h3 className="text-xl font-bold">{service.name || <span className="invisible">placeholder</span>}</h3>

                      {/* Duration / Capacity */}
                      {formatDurationCapacity(service.duration, service.capacity) ? (
                        <p className="text-sm opacity-90">{formatDurationCapacity(service.duration, service.capacity)}</p>
                      ) : (
                        <div className="h-4"></div>
                      )}
                    </div>

                  </div>

                </div>

                <CardHeader>
                  <CardDescription className=" min-h-[80px] text-gray-800 line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>


                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{service.averageRating || 0}</span>
                      <span className="text-sm text-gray-700">({service.totalReviews || 0})</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{service.price.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0"
                    asChild
                  >
                    <Link href={`/services/${service.id}`}>Tham khảo</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 px-8 py-3 text-lg font-semibold"
              asChild
            >
              <Link href="/services">
                Xem tất cả dịch vụ
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blogs Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text mb-6">
              Blogs mới nhất
            </h2>
            <p className="text-xl text-gray-800 leading-relaxed">
              Cập nhật những bài viết mới nhất từ OG Camping – mẹo, kinh nghiệm và review địa điểm cắm trại
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogs.slice(0, 3).map((blog) => (
              <Card
                key={blog.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm group"
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {(blog.imageUrl || blog.thumbnail) && (
                    <div className="mb-6">
                      <img
                        src={blog.imageUrl ? `http://localhost:8080${blog.imageUrl}` : `http://localhost:8080/uploads/${blog.thumbnail}`}
                        alt={blog.title}
                        className="w-full h-72 object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{blog.title}</CardTitle>
                  <CardDescription className="text-gray-800">
                    {(blog.content || "").substring(0, 120)}...
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button
                    className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0"
                    asChild
                  >
                    <Link href={`/blogs/${blog.id}`}>Đọc thêm</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 px-8 py-3 text-lg font-semibold"
              asChild
            >
              <Link href="/blogs">
                Xem tất cả Blogs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Consultant CTA */}
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

      {/* Testimonials */}
      <section className="py-20 px-4 bg-green-500/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text mb-6">
              Khách hàng nói gì về chúng tôi
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-green-600 text-lg">AN</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Anh Nguyễn</CardTitle>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 leading-relaxed">
                  "AI tư vấn rất thông minh, đã giúp tôi chọn được gói cắm trại hoàn hảo cho gia đình. Thiết bị chất
                  lượng, dịch vụ tuyệt vời!"
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600 text-lg">ML</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Chị Mai Linh</CardTitle>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 leading-relaxed">
                  "Lần đầu đi cắm trại nhưng được hỗ trợ rất tận tình. Gói dịch vụ được tùy chỉnh theo nhu cầu, giá cả
                  hợp lý."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-purple-600 text-lg">DH</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Anh Đức Huy</CardTitle>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 leading-relaxed">
                  "Hệ thống đặt chỗ rất tiện lợi, có thể kiểm tra tình trạng thiết bị realtime. Trải nghiệm cắm trại
                  tuyệt vời!"
                </p>
              </CardContent>
            </Card>
          </div>
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
                <li>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleBlogsNavigation()
                    }}
                    className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium relative group cursor-pointer"
                  >
                    Blogs
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
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