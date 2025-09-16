"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, logout } = useAuth()

  // helper để set class active
  const linkClass = (href: string) =>
    pathname === href
      ? "text-green-600 font-medium"
      : "text-gray-600 hover:text-green-600 transition-colors"

  // xử lý chuyển hướng Dashboard theo role
  const handleDashboardNavigation = () => {
    const role = user?.role?.toUpperCase()
    if (role === "ADMIN") {
      router.push("/admin")
    } else if (role === "STAFF") {
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
              {/* Avatar + tên */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || ""} alt={user.name || "User"} />
                <AvatarFallback>
                  {(user.name?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="text-gray-800 font-medium">
                {user.name || user.email}
              </span>

              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    ☰
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDashboardNavigation}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    Đăng xuất
                  </DropdownMenuItem>
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
