"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShoppingCart, Sparkles, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, logout } = useAuth()
  const { cartCount } = useCart()

  // dropdown open states with delayed close to avoid accidental closing
  const [shopOpen, setShopOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const shopTimer = useRef<number | null>(null)
  const infoTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (shopTimer.current) window.clearTimeout(shopTimer.current)
      if (infoTimer.current) window.clearTimeout(infoTimer.current)
    }
  }, [])

  const openShop = () => {
    if (shopTimer.current) window.clearTimeout(shopTimer.current)
    setShopOpen(true)
  }
  const closeShopDelayed = () => {
    // small delay so user can move into dropdown without it closing
    shopTimer.current = window.setTimeout(() => setShopOpen(false), 300)
  }

  const openInfo = () => {
    if (infoTimer.current) window.clearTimeout(infoTimer.current)
    setInfoOpen(true)
  }
  const closeInfoDelayed = () => {
    infoTimer.current = window.setTimeout(() => setInfoOpen(false), 300)
  }

  const linkClass = (href: string) =>
    pathname === href
      ? "text-green-600 font-medium"
      : "text-gray-600 hover:text-green-600 transition-colors"

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
  const handleGoToCart = () => {
    router.push("/cart")
  }

  const handleGoToCartBooking = () => {
    router.push("/cartBooking")
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center">
        {/* Left: Logo */}
        <div className="flex items-center flex-shrink-0">
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
        </div>

        {/* Center: Nav (kept centered) */}
        <nav className="hidden md:flex items-center gap-6 mx-auto">
          {/* Shop dropdown (ghép Cửa hàng + Thuê thiết bị + Combo) */}
          <div
            className="relative inline-block"
            onMouseEnter={openShop}        // wrapper nhận sự kiện
            onMouseLeave={closeShopDelayed}
            onFocus={openShop}
            onBlur={closeShopDelayed}
          >
            <button
              aria-haspopup="true"
              aria-expanded={shopOpen}
              className={`inline-flex items-center gap-2 ${linkClass('/store')} focus:outline-none px-1`}
            >
              Cửa hàng
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-150 ${shopOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* đặt mt-1 để tránh khoảng trống, và pointer-events chỉ active khi mở */}
            <div
              className={`absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg transform transition-all duration-150 z-40
                ${shopOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
              role="menu"
              style={{ minWidth: 260 }}
            >
              <div className="grid grid-cols-1 gap-1 p-3">
                <Link href="/store" className="block px-4 py-2 text-sm rounded hover:bg-gray-50 hover:text-green-600">Cửa hàng</Link>
                <Link href="/equipment" className="block px-4 py-2 text-sm rounded hover:bg-gray-50 hover:text-green-600">Thuê thiết bị</Link>
                <Link href="/combos" className="block px-4 py-2 text-sm rounded hover:bg-gray-50 hover:text-green-600">Combo</Link>
              </div>
            </div>
          </div>

          <Link href="/services" className={`${linkClass('/services')} transition transform hover:-translate-y-0.5`}>Dịch vụ</Link>
          <Link href="/ai-consultant" className={`${linkClass('/ai-consultant')} transition transform hover:-translate-y-0.5`}>Tư vấn AI</Link>

          {/* Info dropdown (Về chúng tôi + Liên hệ) */}
          <div
            className="relative inline-block"
            onMouseEnter={openInfo}
            onMouseLeave={closeInfoDelayed}
            onFocus={openInfo}
            onBlur={closeInfoDelayed}
          >
            <button
              aria-haspopup="true"
              aria-expanded={infoOpen}
              className={`inline-flex items-center gap-2 ${linkClass('/about')} focus:outline-none px-1`}
            >
              Về chúng tôi
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-150 ${infoOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
              className={`absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg transform transition-all duration-150 z-40
                ${infoOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
              role="menu"
              style={{ minWidth: 300 }}
            >
              <div className="p-4">
                <Link href="/about" className="block px-4 py-2 text-sm rounded hover:bg-gray-50 hover:text-green-600">Giới thiệu</Link>
                <Link href="/contact" className="block px-4 py-2 text-sm rounded hover:bg-gray-50 hover:text-green-600">Liên hệ</Link>
                <div className="mt-2 text-xs text-gray-500">Nếu cần hỗ trợ nhanh, hãy gọi hotline hoặc sử dụng chat.</div>
              </div>
            </div>
          </div>

          <Link href="/blogs" className={`${linkClass('/blogs')} transition transform hover:-translate-y-0.5`}>Blog</Link>
        </nav>

        {/* Right: User actions aligned right */}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={handleGoToCart} className="relative p-2 rounded hover:bg-gray-100 transition">
            <ShoppingCart className="h-5 w-5 text-gray-800" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">{cartCount}</Badge>
            )}
          </button>
          <button onClick={handleGoToCartBooking} className="relative p-2 rounded hover:bg-gray-100 transition">
            <ShoppingCart className="h-5 w-5 text-gray-800" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">{cartCount}</Badge>
            )}
          </button>
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || ""} alt={user.name || "User"} />
                <AvatarFallback>{(user.name?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
              </Avatar>

              <span className="hidden sm:inline text-gray-800 font-medium">{user.name || user.email}</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">☰</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDashboardNavigation}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders/service">Lịch sử đơn hàng</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
