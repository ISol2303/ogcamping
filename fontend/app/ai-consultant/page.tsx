"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageCircle, Send, Bot, User, Tent, Sparkles, Zap, Settings } from "lucide-react"
import Link from "next/link"
import { login } from "../api/auth" // Import from auth.ts

interface Message {
  id: number
  type: "user" | "bot"
  content: string
  timestamp: Date
}

export default function AIConsultantPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
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

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("ai-chat-history")
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages)
      // Convert timestamp strings back to Date objects
      const messagesWithDates = parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(messagesWithDates)
    } else {
      // Default messages if no history
      setMessages([
        {
          id: 1,
          type: "bot",
          content:
            "Xin chào! Tôi là AI tư vấn của OG Camping. Tôi sẽ giúp bạn tìm ra gói dịch vụ cắm trại hoàn hảo nhất. Hãy cho tôi biết một số thông tin về chuyến đi của bạn nhé!",
          timestamp: new Date(),
        },
        {
          id: 2,
          type: "bot",
          content:
            "Để tư vấn chính xác nhất, bạn có thể cho tôi biết:\n\n• Số người tham gia?\n• Thời gian dự kiến (bao nhiêu ngày)?\n• Ngân sách dự tính?\n• Loại địa điểm yêu thích (núi, biển, rừng...)?\n• Kinh nghiệm cắm trại của bạn?",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai-chat-history", JSON.stringify(messages))
    }
  }, [messages])

  const quickQuestions = [
    "Tôi muốn đi cắm trại 2-3 ngày với gia đình",
    "Gói nào phù hợp cho người mới bắt đầu?",
    "Tư vấn thiết bị cần thiết cho cắm trại núi",
    "So sánh gói cắm trại biển và núi",
    "Gói nào có giá dưới 2 triệu?",
  ]

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newUserMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "bot" as const,
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)

    setInputMessage("")
  }

  const generateAIResponse = (userMessage: string) => {
    // Simple AI response simulation
    if (userMessage.toLowerCase().includes("gia đình")) {
      return `Tuyệt vời! Dựa trên nhu cầu cắm trại gia đình của bạn, tôi khuyên bạn nên xem xét:

🏕️ **Gói Cắm trại gia đình Đà Lạt** - 3.200.000đ
• Thời gian: 2-4 ngày
• Phù hợp: 6-10 người
• Bao gồm: Lều lớn, hoạt động trẻ em, BBQ
• Đánh giá: 4.7/5 ⭐

Gói này có nhiều hoạt động an toàn cho trẻ em và không gian rộng rãi. Bạn có muốn tôi tư vấn thêm về chi tiết không?`
    }

    if (userMessage.toLowerCase().includes("mới bắt đầu")) {
      return `Với người mới bắt đầu, tôi khuyên bạn nên chọn:

🌊 **Gói Cắm trại bãi biển Phú Quốc** - 1.800.000đ
• Thời gian: 1-2 ngày (phù hợp để làm quen)
• Có hướng dẫn viên kinh nghiệm
• Thiết bị đầy đủ, không cần chuẩn bị gì
• Hoạt động đa dạng: lặn, BBQ

Đây là lựa chọn tuyệt vời để bắt đầu hành trình cắm trại của bạn!`
    }

    return `Cảm ơn bạn đã chia sẻ! Dựa trên thông tin này, tôi sẽ phân tích và đưa ra những gợi ý phù hợp nhất. Bạn có thể cung cấp thêm thông tin về ngân sách và số người tham gia để tôi tư vấn chính xác hơn không?`
  }

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
  }

  const clearChatHistory = () => {
    localStorage.removeItem("ai-chat-history")
    setMessages([
      {
        id: 1,
        type: "bot",
        content:
          "Xin chào! Tôi là AI tư vấn của OG Camping. Tôi sẽ giúp bạn tìm ra gói dịch vụ cắm trại hoàn hảo nhất. Hãy cho tôi biết một số thông tin về chuyến đi của bạn nhé!",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <Link href="/equipment" className="text-gray-600 hover:text-green-600 transition-colors">
              Thuê thiết bị
            </Link>
            <Link href="/ai-consultant" className="text-green-600 font-medium">
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
                <Button
                  variant="outline"
                  asChild
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white border-0">
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Avatar>
              <AvatarImage src="/ai-avatar.jpg" />
              <AvatarFallback className="bg-green-700 text-black">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold text-gray-900">AI Tư vấn thông minh</h1>
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Trò chuyện với AI chuyên dụng để tìm ra gói dịch vụ cắm trại hoàn hảo nhất cho bạn
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge className="bg-green-100 text-green-800 border-0">
              <Zap className="w-3 h-3 mr-1" />
              Phản hồi tức thì
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-0">
              <MessageCircle className="w-3 h-3 mr-1" />
              Tư vấn 24/7
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Cá nhân hóa
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/ai-avatar.jpg" />
                      <AvatarFallback className="bg-green-700 text-black">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-green-900">OG Camping</CardTitle>
                      <CardDescription className="text-green-900">
                        Chuyên gia tư vấn cắm trại thông minh
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-400 text-green-900 hover:bg-green-400">Online</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChatHistory}
                      className="text-black hover:bg-green-600"
                    >
                      Xóa lịch sử
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      {message.type === "bot" ? (
                        <AvatarFallback className="bg-green-700 text-black">
                          <img src="/ai-avatar.jpg" className="h-auto w-auto rounded-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                      <div className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Input */}
              <div className="border-t p-4 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 border-gray-300 focus:border-green-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white border-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Questions */}
            <Card className="border-0 shadow-lg w-auto">
              <CardHeader>
                <CardTitle className="text-lg">Câu hỏi thường gặp</CardTitle>
                <CardDescription>Nhấp để hỏi nhanh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-auto text-left h-auto mr-3 p-1 justify-start border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    <MessageCircle className="w-auto h-4 mr-2 flex-shrink-0 text-green-600" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Tính năng AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Phân tích thông minh</h4>
                    <p className="text-sm text-gray-600">Phân tích sở thích và đưa ra gợi ý phù hợp</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Tư vấn realtime</h4>
                    <p className="text-sm text-gray-600">Kiểm tra tình trạng dịch vụ và thiết bị</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Hỗ trợ 24/7</h4>
                    <p className="text-sm text-gray-600">Luôn sẵn sàng hỗ trợ mọi lúc</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Services */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Dịch vụ phổ biến</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer border-gray-200">
                  <div className="font-medium text-sm">Cắm trại núi Sapa</div>
                  <div className="text-xs text-gray-600">2.500.000đ • 4.8⭐</div>
                </div>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer border-gray-200">
                  <div className="font-medium text-sm">Cắm trại biển Phú Quốc</div>
                  <div className="text-xs text-gray-600">1.800.000đ • 4.9⭐</div>
                </div>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer border-gray-200">
                  <div className="font-medium text-sm">Cắm trại gia đình Đà Lạt</div>
                  <div className="text-xs text-gray-600">3.200.000đ • 4.7⭐</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  asChild
                >
                  <Link href="/services">Xem tất cả</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-green-600 to-green-700 text-black border-1 shadow-2xl">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Hài lòng với tư vấn của AI?</h3>
            <p className="text-green-700 mb-6">Tiến hành đặt dịch vụ ngay để nhận ưu đãi đặc biệt</p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-green-700 text-white hover:bg-gray-100 border-0"
              >
                <Link href="/services">Xem dịch vụ</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-gray-900 border-white hover:bg-white hover:text-green-600"
                asChild
              >
                <Link href="/equipment">Thuê thiết bị</Link>
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