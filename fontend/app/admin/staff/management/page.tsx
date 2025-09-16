"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tent,
  Users,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  CalendarPlus,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string;
  department: string | null;
  joinDate: string | null;
  status: string;
  address: string | null;
  createdAt: string;
}
export default function StaffManagement() {
  const [selectedTab, setSelectedTab] = useState("staff")
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false)

  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/apis/v1/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const users: User[] = await res.json();

        // Lọc các user có role === "STAFF"
        const staff = users.filter(u => u.role === "STAFF");
        setStaffList(staff);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) return <div>Đang tải danh sách nhân viên...</div>;
  if (staffList.length === 0) return <div>Chưa có nhân viên nào.</div>;


  const shiftSchedule = [
    {
      id: 1,
      date: "15/12/2024",
      timeSlot: "Sáng (6:00 - 14:00)",
      location: "Khu vực Sapa",
      staffNeeded: 3,
      staffAssigned: [
        { id: 1, name: "Nguyễn Văn An", role: "Hướng dẫn viên" },
        { id: 2, name: "Trần Thị Bình", role: "Kiểm tra thiết bị" },
      ],
      status: "understaffed",
    },
    {
      id: 2,
      date: "15/12/2024",
      timeSlot: "Chiều (14:00 - 22:00)",
      location: "Khu vực Phú Quốc",
      staffNeeded: 4,
      staffAssigned: [
        { id: 1, name: "Nguyễn Văn An", role: "Hướng dẫn viên" },
        { id: 2, name: "Trần Thị Bình", role: "Kiểm tra thiết bị" },
        { id: 3, name: "Lê Văn Cường", role: "Hỗ trợ khách hàng" },
        { id: 4, name: "Phạm Thị Dung", role: "Hướng dẫn viên" },
      ],
      status: "full",
    },
    {
      id: 3,
      date: "16/12/2024",
      timeSlot: "Sáng (6:00 - 14:00)",
      location: "Khu vực Đà Lạt",
      staffNeeded: 2,
      staffAssigned: [],
      status: "empty",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang làm việc</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Tạm nghỉ</Badge>
      case "understaffed":
        return <Badge className="bg-yellow-100 text-yellow-800">Thiếu nhân viên</Badge>
      case "full":
        return <Badge className="bg-green-100 text-green-800">Đủ nhân viên</Badge>
      case "empty":
        return <Badge className="bg-red-100 text-red-800">Chưa có ai</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/staff" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </Link>
            <div className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">Quản lý nhân viên</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm nhân viên
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm nhân viên mới</DialogTitle>
                  <DialogDescription>Nhập thông tin nhân viên mới</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" placeholder="Nhập họ và tên" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Nhập email" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" placeholder="Nhập số điện thoại" />
                  </div>
                  <div>
                    <Label htmlFor="role">Vai trò</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guide">Hướng dẫn viên</SelectItem>
                        <SelectItem value="equipment">Kiểm tra thiết bị</SelectItem>
                        <SelectItem value="support">Hỗ trợ khách hàng</SelectItem>
                        <SelectItem value="admin">Quản lý</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Phòng ban</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sapa">Tour Sapa</SelectItem>
                        <SelectItem value="phuquoc">Tour Phú Quốc</SelectItem>
                        <SelectItem value="dalat">Tour Đà Lạt</SelectItem>
                        <SelectItem value="technical">Kỹ thuật</SelectItem>
                        <SelectItem value="service">Dịch vụ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Thêm nhân viên</Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setIsAddStaffOpen(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Tạo ca trực
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tạo ca trực mới</DialogTitle>
                  <DialogDescription>Tạo ca trực cho nhân viên</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shift-date">Ngày</Label>
                    <Input id="shift-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="time-slot">Ca làm việc</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ca làm việc" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Sáng (6:00 - 14:00)</SelectItem>
                        <SelectItem value="afternoon">Chiều (14:00 - 22:00)</SelectItem>
                        <SelectItem value="night">Tối (22:00 - 6:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Địa điểm</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn địa điểm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sapa">Khu vực Sapa</SelectItem>
                        <SelectItem value="phuquoc">Khu vực Phú Quốc</SelectItem>
                        <SelectItem value="dalat">Khu vực Đà Lạt</SelectItem>
                        <SelectItem value="office">Văn phòng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="staff-needed">Số nhân viên cần</Label>
                    <Input id="staff-needed" type="number" placeholder="Nhập số nhân viên" />
                  </div>
                  <div>
                    <Label htmlFor="description">Mô tả công việc</Label>
                    <Textarea id="description" placeholder="Mô tả chi tiết công việc..." rows={3} />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Tạo ca trực</Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setIsAddShiftOpen(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang làm việc</p>
                  <p className="text-3xl font-bold text-gray-900">18</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ca trực hôm nay</p>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cần tuyển</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <UserPlus className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-3">
            <TabsTrigger value="staff">Danh sách nhân viên</TabsTrigger>
            <TabsTrigger value="shifts">Lịch ca trực</TabsTrigger>
            <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Danh sách nhân viên</CardTitle>
                    <CardDescription>Quản lý thông tin nhân viên</CardDescription>
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
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Tìm kiếm nhân viên..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="sapa">Tour Sapa</SelectItem>
                      <SelectItem value="phuquoc">Tour Phú Quốc</SelectItem>
                      <SelectItem value="dalat">Tour Đà Lạt</SelectItem>
                      <SelectItem value="technical">Kỹ thuật</SelectItem>
                      <SelectItem value="service">Dịch vụ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>Ngày vào làm</TableHead>
                      {/* <TableHead>Đánh giá</TableHead>
                      <TableHead>Ca tháng này</TableHead> */}
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={staff.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {staff.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                <span>{staff.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-3 h-3" />
                                <span>{staff.phone}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell>{staff.joinDate}</TableCell>
                        {/* <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{staff.rating}</span>
                          </div>
                        </TableCell> */}
                        {/* <TableCell>
                          <span className="font-medium">{staff.shiftsThisMonth}</span>
                        </TableCell> */}
                        <TableCell>{getStatusBadge(staff.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
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

          <TabsContent value="shifts">
            <Card>
              <CardHeader>
                <CardTitle>Lịch ca trực</CardTitle>
                <CardDescription>Quản lý và phân công ca trực</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {shiftSchedule.map((shift) => (
                    <div key={shift.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {shift.date} - {shift.timeSlot}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{shift.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(shift.status)}
                          <span className="text-sm text-gray-600">
                            {shift.staffAssigned.length}/{shift.staffNeeded} người
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Nhân viên đã phân công</h4>
                          <div className="space-y-2">
                            {shift.staffAssigned.length > 0 ? (
                              shift.staffAssigned.map((staff) => (
                                <div key={staff.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs">
                                      {staff.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{staff.name}</p>
                                    <p className="text-xs text-gray-600">{staff.role}</p>
                                  </div>
                                  <Button variant="ghost" size="sm" className="ml-auto">
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm">Chưa có nhân viên nào</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Thêm nhân viên</h4>
                          <div className="space-y-3">
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn nhân viên" />
                              </SelectTrigger>
                              <SelectContent>
                                {staffList
                                  .filter((s) => s.status === "active")
                                  .map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id.toString()}>
                                      {staff.name} - {staff.role}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" className="w-full">
                              <Plus className="w-4 h-4 mr-2" />
                              Thêm vào ca
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Hiệu suất làm việc</CardTitle>
                <CardDescription>Theo dõi hiệu suất và đánh giá nhân viên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Tính năng đang được phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
