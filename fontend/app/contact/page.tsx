"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tent, Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, Sparkles, Settings } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    contactMethod: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Contact form submitted:", formData)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        contactMethod: "",
      })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Điện thoại",
      details: ["Hotline: 1900 1234", "Di động: 0123 456 789"],
      description: "Hỗ trợ 24/7 cho mọi thắc mắc",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@ogcamping.vn", "support@ogcamping.vn"],
      description: "Phản hồi trong vòng 2 giờ",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      details: ["123 Đường ABC, Quận 1", "TP. Hồ Chí Minh, Việt Nam"],
      description: "Văn phòng mở cửa 8:00 - 18:00",
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      details: ["Thứ 2 - Thứ 6: 8:00 - 18:00", "Thứ 7 - CN: 9:00 - 17:00"],
      description: "Hỗ trợ khẩn cấp 24/7",
    },
  ]

  const faqItems = [
    {
      question: "Làm thế nào để đặt dịch vụ cắm trại?",
      answer:
        "Bạn có thể đặt dịch vụ trực tuyến qua website hoặc gọi hotline. Chúng tôi cũng có AI tư vấn để giúp bạn chọn gói phù hợp.",
    },
    {
      question: "Có thể hủy đặt chỗ không?",
      answer: "Có, bạn có thể hủy miễn phí trong vòng 24h sau khi đặt. Sau thời gian này sẽ có phí hủy theo quy định.",
    },
    {
      question: "Thiết bị cắm trại có an toàn không?",
      answer:
        "Tất cả thiết bị đều được kiểm tra định kỳ và đảm bảo chất lượng. Chúng tôi có bảo hiểm cho mọi thiết bị cho thuê.",
    },
    {
      question: "Có hướng dẫn viên đi cùng không?",
      answer:
        "Có, tất cả các tour đều có hướng dẫn viên chuyên nghiệp đi cùng để đảm bảo an toàn và trải nghiệm tốt nhất.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-green-300 mb-8 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ để được tư vấn miễn phí về các dịch vụ cắm trại
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
              <CardDescription>Điền thông tin để nhận hỗ trợ nhanh nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Chủ đề</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chủ đề" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Tư vấn dịch vụ</SelectItem>
                      <SelectItem value="equipment">Thuê thiết bị</SelectItem>
                      <SelectItem value="support">Hỗ trợ kỹ thuật</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Tin nhắn</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Nhập tin nhắn của bạn"
                    rows={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactMethod">Phương thức liên hệ mong muốn</Label>
                  <Select
                    value={formData.contactMethod}
                    onValueChange={(value) => setFormData({ ...formData, contactMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Điện thoại</SelectItem>
                      <SelectItem value="both">Cả hai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitted}>
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Đã gửi
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi tin nhắn
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          

          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <info.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-600">{detail}</p>
                      ))}
                      <p className="text-sm text-gray-500 mt-2">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>

            {/* Map Placeholder */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Vị trí văn phòng</h3>
                  <div className="h-64 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center border-2 border-green-300">
                    <div className="text-center text-green-800">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-lg font-medium">Bản đồ văn phòng</p>
                      <p className="text-sm opacity-75">123 Đường ABC, Quận 1, TP.HCM</p>
                      <Button variant="outline" className="mt-3" size="sm">
                        Xem trên Google Maps
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          
                        

          {/* FAQ Section */}
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Câu hỏi thường gặp</CardTitle>
                <CardDescription className="text-center">Những câu hỏi phổ biến từ khách hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {faqItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">{item.question}</h4>
                      <p className="text-gray-600 text-sm">{item.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button variant="outline" asChild>
                    <Link href="/ai-consultant">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Hỏi AI tư vấn
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Emergency Contact */}
          <Card className="mt-8 bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-red-800 mb-2">Liên hệ khẩn cấp</h3>
              <p className="text-red-700 mb-4">
                Nếu bạn đang trong chuyến cắm trại và gặp tình huống khẩn cấp, hãy gọi ngay:
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="destructive" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Hotline 24/7: 1900 1234
                </Button>
              </div>
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
