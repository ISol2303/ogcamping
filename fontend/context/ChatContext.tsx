"use client"
import { createContext, useContext, useState, useEffect } from "react"

export interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface ChatContextType {
  messages: Message[]
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => void
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])

  // load từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai-chat-history")
    if (saved) {
      const parsed = JSON.parse(saved)
      setMessages(
        parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      )
    } else {
      setMessages([
        {
          id: crypto.randomUUID(),
          type: "bot",
          content:
            "Xin chào! Tôi là AI tư vấn của OG Camping. Tôi sẽ giúp bạn tìm ra gói dịch vụ cắm trại hoàn hảo nhất.",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // save vào localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai-chat-history", JSON.stringify(messages))
    }
  }, [messages])

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMsg])
  }

  const clearMessages = () => {
    localStorage.removeItem("ai-chat-history")
    setMessages([
      {
        id: crypto.randomUUID(),
        type: "bot",
        content:
          "Xin chào! Tôi là AI tư vấn của OG Camping. Tôi sẽ giúp bạn tìm ra gói dịch vụ cắm trại hoàn hảo nhất.",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat phải nằm trong ChatProvider")
  return ctx
}
