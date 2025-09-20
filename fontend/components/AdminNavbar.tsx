import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell, LogOut, Settings, Tent } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminNavbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const router = useRouter();
  console.log("role : " + user?.role) // khong lay dc role
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("user")
    logout?.()
    router.push("/login")
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Tent className="h-8 w-8 text-green-600" />
          <span className="text-2xl font-bold text-green-800">Quản lý OG Camping</span>
        </Link>
        <div className="flex items-center gap-4">
          {user?.role?.toUpperCase() === "ADMIN" && (
            <Link href="/admin/staff/">
              <Button variant="outline" size="sm">
                Quản lý nhân viên
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}