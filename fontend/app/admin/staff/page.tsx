"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Tent,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Bell,
  Settings,
  LogOut,
  Eye,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function StaffDashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("orders")
 

  // Mock data
  const todayStats = [
    { title: "Đơn hàng hôm nay", value: "12", icon: Calendar, color: "text-blue-600" },
    { title: "Cần xử lý", value: "5", icon: Clock, color: "text-yellow-600" },
    { title: "Đã hoàn thành", value: "7", icon: CheckCircle, color: "text-green-600" },
    { title: "Thiết bị cần kiểm tra", value: "3", icon: Package, color: "text-purple-600" },
  ]

  const pendingOrders = [
    {
      id: "OGC001",
      customer: "Nguyễn Văn A",
      service: "Cắm trại Sapa",
      date: "15/12/2024",
      phone: "0123456789",
      status: "pending_confirmation",
      priority: "high",
    },
    {
      id: "OGC002",
      customer: "Trần Thị B",
      service: "Thuê lều 4 người",
      date: "16/12/2024",
      phone: "0987654321",
      status: "pending_payment",
      priority: "medium",
    },
    {
      id: "OGC003",
      customer: "Lê Văn C",
      service: "Cắm trại Phú Quốc",
      date: "17/12/2024",
      phone: "0456789123",
      status: "confirmed",
      priority: "low",
    },
  ]

  const equipmentChecks = [
    {
      id: 1,
      name: "Lều cắm trại 4 người",
      code: "TENT001",
      lastCheck: "10/12/2024",
      nextCheck: "15/12/2024",
      status: "due",
    },
    {
      id: 2,
      name: "Bếp gas mini",
      code: "STOVE005",
      lastCheck: "12/12/2024",
      nextCheck: "17/12/2024",
      status: "upcoming",
    },
    {
      id: 3,
      name: "Túi ngủ cao cấp",
      code: "SLEEP003",
      lastCheck: "08/12/2024",
      nextCheck: "13/12/2024",
      status: "overdue",
    },
  ]

  const shifts = [
    {
      id: 1,
      date: "15/12/2024",
      timeSlot: "Sáng (6:00 - 14:00)",
      staffNeeded: 3,
      staffAssigned: 2,
      status: "understaffed",
      location: "Khu vực Sapa",
    },
    {
      id: 2,
      date: "15/12/2024",
      timeSlot: "Chiều (14:00 - 22:00)",
      staffNeeded: 4,
      staffAssigned: 4,
      status: "full",
      location: "Khu vực Phú Quốc",
    },
    {
      id: 3,
      date: "16/12/2024",
      timeSlot: "Sáng (6:00 - 14:00)",
      staffNeeded: 2,
      staffAssigned: 0,
      status: "empty",
      location: "Khu vực Đà Lạt",
    },
  ]

  const myShifts = [
    {
      id: 1,
      date: "15/12/2024",
      timeSlot: "Sáng (6:00 - 14:00)",
      location: "Khu vực Sapa",
      status: "confirmed",
      role: "Hướng dẫn viên",
    },
    {
      id: 2,
      date: "17/12/2024",
      timeSlot: "Chiều (14:00 - 22:00)",
      location: "Khu vực Phú Quốc",
      status: "pending",
      role: "Kiểm tra thiết bị",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_confirmation":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>
      case "pending_payment":
        return <Badge className="bg-orange-100 text-orange-800">Chờ thanh toán</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>
      case "due":
        return <Badge className="bg-red-100 text-red-800">Cần kiểm tra</Badge>
      case "upcoming":
        return <Badge className="bg-yellow-100 text-yellow-800">Sắp đến hạn</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Cao</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Thấp</Badge>
      default:
        return <Badge variant="secondary">Bình thường</Badge>
    }
  }

  const getShiftStatusBadge = (status: string) => {
    switch (status) {
      case "understaffed":
        return <Badge className="bg-yellow-100 text-yellow-800">Thiếu nhân viên</Badge>
      case "full":
        return <Badge className="bg-green-100 text-green-800">Đủ nhân viên</Badge>
      case "empty":
        return <Badge className="bg-red-100 text-red-800">Chưa có ai</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Nhân viên</h1>
          <p className="text-gray-600">Quản lý đơn hàng và thiết bị</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {todayStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-5">
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
            <TabsTrigger value="shifts">Ca trực</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đơn hàng cần xử lý</CardTitle>
                    <CardDescription>Danh sách đơn hàng đang chờ xử lý</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Tìm kiếm đơn hàng..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Ưu tiên</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-sm text-gray-600">{order.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.service}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Xử lý nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Xác nhận đơn hàng
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    Gọi khách hàng
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Mail className="w-4 h-4 mr-2" />
                    Gửi email xác nhận
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ghi chú nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="Ghi chú về đơn hàng, khách hàng..." rows={4} />
                  <Button className="w-full mt-3">Lưu ghi chú</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Kiểm tra thiết bị</CardTitle>
                <CardDescription>Lịch kiểm tra và bảo trì thiết bị</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên thiết bị</TableHead>
                      <TableHead>Mã thiết bị</TableHead>
                      <TableHead>Lần kiểm tra cuối</TableHead>
                      <TableHead>Kiểm tra tiếp theo</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentChecks.map((equipment) => (
                      <TableRow key={equipment.id}>
                        <TableCell className="font-medium">{equipment.name}</TableCell>
                        <TableCell>{equipment.code}</TableCell>
                        <TableCell>{equipment.lastCheck}</TableCell>
                        <TableCell>{equipment.nextCheck}</TableCell>
                        <TableCell>{getStatusBadge(equipment.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Available Shifts */}
              <Card>
                <CardHeader>
                  <CardTitle>Ca trực có sẵn</CardTitle>
                  <CardDescription>Đăng ký ca trực phù hợp</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shifts.map((shift) => (
                      <div key={shift.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{shift.date}</p>
                            <p className="text-sm text-gray-600">{shift.timeSlot}</p>
                          </div>
                          {getShiftStatusBadge(shift.status)}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-gray-600">{shift.location}</p>
                          <p className="text-sm text-gray-600">
                            {shift.staffAssigned}/{shift.staffNeeded} người
                          </p>
                        </div>
                        <Button size="sm" className="w-full" disabled={shift.status === "full"}>
                          {shift.status === "full" ? "Đã đủ người" : "Đăng ký"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* My Shifts */}
              <Card>
                <CardHeader>
                  <CardTitle>Ca trực của tôi</CardTitle>
                  <CardDescription>Các ca đã đăng ký</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myShifts.map((shift) => (
                      <div key={shift.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{shift.date}</p>
                            <p className="text-sm text-gray-600">{shift.timeSlot}</p>
                          </div>
                          {getShiftStatusBadge(shift.status)}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-gray-600">{shift.location}</p>
                          <p className="text-sm font-medium text-blue-600">{shift.role}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            Chi tiết
                          </Button>
                          {shift.status === "pending" && (
                            <Button variant="destructive" size="sm" className="flex-1">
                              Hủy
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shift Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch ca trực tuần này</CardTitle>
                <CardDescription>Tổng quan ca trực trong tuần</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, index) => (
                    <div key={index} className="text-center font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, index) => (
                    <div key={index} className="border rounded-lg p-2 min-h-[80px]">
                      <p className="text-sm font-medium text-gray-900 mb-1">{15 + index}/12</p>
                      {index === 0 && (
                        <div className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5 mb-1">Sáng</div>
                      )}
                      {index === 2 && (
                        <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1">Chiều</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
        </Tabs>
      </div>
    </div>
  )
}
