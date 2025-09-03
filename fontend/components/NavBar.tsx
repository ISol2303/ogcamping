"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"   // 👈 lấy AuthContext
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sparkles, Settings } from "lucide-react"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, logout } = useAuth()   // 👈 lấy dữ liệu từ context

  // 👇 helper để set class active
  const linkClass = (href: string) =>
    pathname === href
      ? "text-green-600 font-medium" // active
      : "text-gray-600 hover:text-green-600 transition-colors" // normal

  // 👇 xử lý chuyển hướng Dashboard theo role
  const handleDashboardNavigation = () => {
    if (user?.role === "ADMIN") {
      router.push("/admin")
    } else if (user?.role === "STAFF") {
      router.push("/staff")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/ai-avatar.jpg"
              className="h-12 w-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
              alt="OG Camping Logo"
            />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
          <span className="text-3xl font-bold text-green-600">OG Camping</span>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/services" className={linkClass("/services")}>
            Dịch vụ
          </Link>
          <Link href="/equipment" className={linkClass("/equipment")}>
            Thuê thiết bị
          </Link>
          <Link href="/ai-consultant" className={linkClass("/ai-consultant")}>
            Tư vấn AI
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            Về chúng tôi
          </Link>
          <Link href="/contact" className={linkClass("/contact")}>
            Liên hệ
          </Link>
        </nav>

        {/* User actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn && user ? (
            <>
              <span className="text-gray-800 font-medium">{user.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5 text-gray-800" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDashboardNavigation}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
