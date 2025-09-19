"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, Bot, User, Tent, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { useChat } from "@/context/ChatContext"
import { useAuth } from "@/context/AuthContext"

export default function AIConsultantPage() {
  const { messages, addMessage, clearMessages } = useChat()
  const { user } = useAuth()
  
  const [inputMessage, setInputMessage] = useState("")
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);

  const quickQuestions = [
    "Tôi muốn đi cắm trại 2-3 ngày với gia đình",
    "Gói nào phù hợp cho người mới bắt đầu?",
    "Tư vấn thiết bị cần thiết cho cắm trại núi",
    "So sánh gói cắm trại biển và núi",
    "Gói nào có giá dưới 2 triệu?",
  ]

  // helper tính slot còn lại
  const getAvailableSlots = (service: any) => {
    if (!service.availability) return 0
    return service.availability.reduce(
      (acc: number, a: any) => acc + (a.totalSlots - a.bookedSlots),
      0
    )
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    const userText = inputMessage

    // thêm tin nhắn user vào state ngay
    addMessage({ type: "user", content: userText })
    setInputMessage("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { type: "user", content: userText }],
        }),
      })

      const data = await res.json()

      // bot trả lời
      addMessage({
        type: "bot",
        content: data.reply || "",
        services: data.services || [],
      })
    } catch (err) {
      addMessage({
        type: "bot",
        content: "Xin lỗi, AI hiện không phản hồi.",
      })
    }
  }

  const handleQuickQuestion = (q: string) => {
    setInputMessage(q)
  }

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])
  
  //Load popular services
  useEffect(() => {
  let mounted = true;
  async function loadPopular() {
    setLoadingPopular(true);
    try {
      // gọi API (thay bằng URL BE nếu cần, ví dụ http://localhost:8080/apis/v1/services)
      const res = await fetch("http://localhost:8080/apis/v1/services", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch services");
      const all = await res.json();
      if (!mounted) return;

      // filter tag = "POPULAR" (so sánh in hoa/thoáng)
      const popular = Array.isArray(all)
        ? all.filter((s: any) => String(s.tag ?? "").toUpperCase() === "POPULAR")
        : [];

      setPopularServices(popular);
    } catch (err) {
      console.error("Load popular services error:", err);
      setPopularServices([]);
    } finally {
      if (mounted) setLoadingPopular(false);
    }
  }

  loadPopular();
  return () => {
    mounted = false;
  };
}, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
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
            Trò chuyện với AI để tìm ra gói dịch vụ cắm trại phù hợp nhất cho bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat */}
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
                      <CardDescription className="text-green-900">Chuyên gia tư vấn cắm trại thông minh</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearMessages} className="text-black hover:bg-green-600">
                    Xóa lịch sử
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={messagesContainerRef}>
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                    {message.type === "bot" ? (
                      // bot vẫn dùng image (hoặc fallback)
                      <AvatarImage src="/ai-avatar.jpg" alt="OG AI" />
                    ) : (
                      // user avatar: lấy user từ context
                      (user?.avatar) ? (
                        <AvatarImage src={user?.avatar} alt="Bạn" className="rounded-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      )
                    )}
                  </Avatar>

                    <div className={`max-w-[80%] rounded-lg p-3 ${message.type === "user" ? "bg-blue-500 text-white" : "bg-white text-gray-900 border border-gray-200"}`}>
                      {/* Try parse message.content if it's JSON string */}
                      {(() => {
                        let parsed: any = null;
                        try {
                          parsed = typeof message.content === "string" ? JSON.parse(message.content) : message.content;
                        } catch (e) {
                          parsed = null;
                        }

                        // If it's structured service_request/combo_request, render nicely
                        if (parsed && (parsed.type === "service_request" || parsed.type === "combo_request")) {
                          return (
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-gray-800">{parsed.reply}</div>

                              {/* criteria */}
                              {parsed.criteria && (
                                <div className="text-xs text-gray-600 border rounded-lg p-2 bg-gray-50">
                                  {parsed.criteria.location && (
                                    <p>
                                      <b>Địa điểm:</b> {parsed.criteria.location}
                                    </p>
                                  )}
                                  {parsed.criteria.days && (
                                    <p>
                                      <b>Số ngày:</b> {parsed.criteria.days}
                                    </p>
                                  )}
                                  {parsed.criteria.tag && (
                                    <p>
                                      <b>Tag:</b> {parsed.criteria.tag}
                                    </p>
                                  )}
                                  {parsed.criteria.minPrice !== undefined || parsed.criteria.maxPrice !== undefined ? (
                                    <p>
                                      <b>Giá:</b>{" "}
                                      {(parsed.criteria.minPrice ?? 0).toLocaleString("vi-VN")}đ -{" "}
                                      {(parsed.criteria.maxPrice ?? 99999999).toLocaleString("vi-VN")}đ
                                    </p>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // default: plain text
                        return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
                      })()}

                      {/* render services passed as field on message */}
                      {message.services?.length ? (
                        <div className="space-y-2 mt-3">
                          {message.services.map((s: any) => {
                            const availableSlots = getAvailableSlots(s);
                            return (
                              <Link key={s.id} href={`/services/${s.id}`} className="block p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{s.name}</div>
                                  <div className="text-xs text-gray-500">{s.tag ?? ""}</div>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">{s.price?.toLocaleString("vi-VN")}đ</div>
                                <div className={`text-xs mt-1 ${availableSlots > 0 ? "text-green-600" : "text-red-500"}`}>
                                  {availableSlots > 0 ? `Còn ${availableSlots} chỗ` : "Hết chỗ"}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* render combos if any */}
                      {message.combos?.length ? (
                        <div className="space-y-2 mt-3">
                          {message.combos.map((c: any) => (
                            <Link key={c.id} href={`/combos/${c.id}`} className="block p-3 border rounded-lg hover:bg-gray-50">
                              <div className="font-medium">{c.name}</div>
                              <div className="text-sm text-gray-600">{c.price?.toLocaleString("vi-VN")}đ</div>
                            </Link>
                          ))}
                        </div>
                      ) : null}

                      <div className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp?.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Input */}
              <div className="border-t p-4 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Nhập câu hỏi của bạn..." onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} className="flex-1 border-gray-300 focus:border-green-500" />
                  <Button onClick={handleSendMessage} disabled={!inputMessage.trim()} className="bg-green-500 hover:bg-green-600 text-white border-0">
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
                  <Button key={index} variant="outline" className="w-auto text-left h-auto mr-3 p-1 justify-start border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300" onClick={() => handleQuickQuestion(question)}>
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
              </CardContent>
            </Card>

            {/* Popular Services */}
            <Card className="border-0 shadow-lg">
  <CardHeader>
    <CardTitle className="text-lg">Dịch vụ phổ biến</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {loadingPopular ? (
      <div className="p-3 text-sm text-gray-500">Đang tải...</div>
    ) : popularServices.length === 0 ? (
      <div className="p-3 text-sm text-gray-500">Chưa có dịch vụ phổ biến.</div>
    ) : (
      popularServices.map((s: any) => {
        const availableSlots = (s.availability ?? []).reduce(
          (acc: number, a: any) => acc + (a.totalSlots - (a.bookedSlots ?? 0)),
          0
        );
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
        const getImgUrl = (path?: string) => {
          if (!path) return "/placeholder-service.jpg";
          if (/^https?:\/\//i.test(path)) return path; // nếu backend trả sẵn full URL
          return `${API_BASE}${path}`;
        };
        return (
          <Link
            key={s.id}
            href={`/services/${s.id}`}
            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer border-gray-200 flex items-center gap-3"
          >
            {/* thumbnail */}
            <div className="w-16 h-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              <img src={getImgUrl(s.imageUrl ?? s.image)} alt={s.name} className="w-full h-full object-cover" />
            </div>

            {/* info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{s.name}</div>
              <div className="text-xs text-gray-600 mt-1">
                {(s.price ?? 0).toLocaleString("vi-VN")}đ • {(s.averageRating ?? 0).toFixed(1)}⭐
              </div>
            </div>

            {/* badge */}
            <div className="text-right">
              <div className={`text-xs ${availableSlots > 0 ? "text-green-600" : "text-red-500"}`}>
                {availableSlots > 0 ? `${availableSlots} chỗ` : "Hết chỗ"}
              </div>
            </div>
          </Link>
        );
      })
    )}

    <Button variant="outline" size="sm" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
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
