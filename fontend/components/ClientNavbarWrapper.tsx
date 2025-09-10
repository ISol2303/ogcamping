"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/NavBar"
import AdminNavbar from "@/components/AdminNavbar"
import ChatBot from "@/components/chat-bot"

export default function ClientNavbarWrapper() {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      {!isAdminRoute && <ChatBot />}{/* Ẩn ChatBot trong admin */}
    </>
  )
}
