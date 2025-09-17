"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface Service {
  id: number
  name: string
  description: string
  price: number
  tag?: string
  imageUrl?: string
  extraImages?: string[]
}

export interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  services?: Service[]
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
    try {
      const saved = localStorage.getItem("ai-chat-history")
      if (saved) {
        const parsed = JSON.parse(saved)
        setMessages(
          parsed.map((m: any) => ({
            id: m.id,
            type: m.type,
            content: m.content,
            timestamp: new Date(m.timestamp),
            services: m.services ?? undefined,
          }))
        )
        return
      }
    } catch (err) {
      console.error("Failed to load chat history:", err)
    }

    // mặc định tin nhắn chào
    setMessages([
      {
        id: crypto.randomUUID(),
        type: "bot",
        content:
          "Xin chào! Tôi là AI tư vấn của OG Camping. Tôi sẽ giúp bạn tìm ra gói dịch vụ cắm trại hoàn hảo nhất.",
        timestamp: new Date(),
      },
    ])
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
