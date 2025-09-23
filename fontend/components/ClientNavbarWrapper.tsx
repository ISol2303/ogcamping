"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/NavBar"
import AdminNavbar from "@/components/AdminNavbar"
import ChatBot from "@/components/chat-bot"

export default function ClientNavbarWrapper() {
  const pathname = usePathname()
  const isAdminOrStaffRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/staff")
  const isAiConsultantRoute = pathname.startsWith("/ai-consultant")

  return (
    <>
      {isAdminOrStaffRoute ? <AdminNavbar /> : <Navbar />}
      {!isAdminOrStaffRoute && !isAiConsultantRoute && <ChatBot />}
      {/* Ẩn ChatBot trong admin, staff và ai-consultant */}
    </>
  )
}
