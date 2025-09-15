import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ChatBot from "@/components/chat-bot"
import { AuthProvider } from "@/context/AuthContext"
import Navbar from "@/components/NavBar"
import { ChatProvider } from "@/context/ChatContext"
import AdminNavbar from "@/components/AdminNavbar"
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "OG Camping Private - Hệ thống cắm trại thông minh",
  description: "Dịch vụ cắm trại và cho thuê thiết bị với AI tư vấn chuyên dụng",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
     <html lang="vi" className="mdl-js">
      <body className={`${inter.variable} ${inter.className}`} suppressHydrationWarning>
        <AuthProvider>
          <ChatProvider>
            <ClientNavbarWrapper />
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
