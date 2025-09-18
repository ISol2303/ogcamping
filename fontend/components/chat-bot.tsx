"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2 } from "lucide-react"
import Link from "next/link"
import { useChat } from "@/context/ChatContext"

export default function ChatBot() {
  const { messages, addMessage } = useChat()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickQuestions = [
    "Tôi muốn đi cắm trại 2-3 ngày với gia đình",
    "Gói nào phù hợp cho người mới bắt đầu?",
    "Tư vấn thiết bị cần thiết cho cắm trại núi",
    "So sánh gói cắm trại biển và núi",
    "Gói nào có giá dưới 2 triệu?",
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // user msg
    addMessage({ type: "user", content: inputMessage })
    const userText = inputMessage
    setInputMessage("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      })
      const data = await res.json()

      addMessage({
        type: "bot",
        content: data.reply || "",
        services: data.services || [],
      })
    } catch (err) {
      addMessage({ type: "bot", content: "Xin lỗi, AI hiện không phản hồi." })
    } finally {
      setIsTyping(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 shadow-2xl border-0 ${isMinimized ? "h-16" : "h-96"} transition-all duration-300`}>
        <CardHeader className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-black rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/ai-avatar.jpg" />
                <AvatarFallback className="bg-green-700 text-black">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">OG Camping</CardTitle>
                <Badge className="bg-green-400 text-green-900 text-xs">Online</Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-black hover:bg-green-600"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-black hover:bg-green-600"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 h-64 overflow-y-auto bg-gray-50">
              <div className="p-3 space-y-3">
                {messages.map((message) => (
  <div
    key={message.id}
    className={`flex gap-2 ${message.type === "user" ? "flex-row-reverse" : ""}`}
  >
    <Avatar className="w-6 h-6 flex-shrink-0">
      {message.type === "bot" ? (
        <AvatarFallback className="bg-green-100 text-green-600">
          <img
            src="/ai-avatar.jpg"
            className="h-auto w-auto rounded-full object-cover"
          />
        </AvatarFallback>
      ) : (
        <AvatarFallback className="bg-blue-100 text-blue-600">
          <User className="w-3 h-3" />
        </AvatarFallback>
      )}
    </Avatar>

    <div
      className={`max-w-[80%] rounded-lg p-2 text-xs ${
        message.type === "user"
          ? "bg-blue-500 text-white"
          : "bg-white text-gray-800 border border-gray-200"
      }`}
    >
      <div className="whitespace-pre-wrap break-words">
        {message.content}
      </div>

      {/* Nếu bot trả kèm danh sách service thì render card */}
      {message.type === "bot" && Array.isArray(message.services) && message.services.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.services.map((s: any) => (
            <Link
              key={s.id}
              href={`/services/${s.id}`}
              className="block p-2 border rounded-lg hover:bg-gray-50 cursor-pointer border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.tag ?? ""}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {s.price?.toLocaleString("vi-VN")}đ • {s.averageRating ?? 0}⭐
              </div>
              <div
                className={`text-xs mt-1 ${
                  s.availableSlots > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {s.availableSlots > 0 ? "Còn chỗ" : "Hết chỗ"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  </div>
))}


                {isTyping && (
                  <div className="flex gap-2">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className="bg-green-100 text-green-600">
                        <img src="/ai-avatar.jpg" className="h-auto w-auto rounded-full object-cover" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border border-gray-200 rounded-lg p-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="p-3 border-t bg-white">
                <div className="text-xs text-gray-500 mb-2">Câu hỏi nhanh:</div>
                <div className="flex flex-wrap gap-1">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(question)}
                      className="text-xs h-6 px-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>

            <div className="p-3 border-t bg-white rounded-b-lg">
              <div className="flex gap-2 mb-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="text-xs h-8 border-gray-300 focus:border-green-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  size="sm"
                  className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white border-0"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-center">
                <Button variant="link" size="sm" asChild className="text-xs text-green-600 hover:text-green-700 p-0 h-auto">
                  <Link href="/ai-consultant">Mở trang tư vấn đầy đủ</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
