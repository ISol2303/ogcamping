"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tent,
  Search,
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  UserCheck,
  MessageSquare,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

interface Staff {
  id: string | number;
  name: string;
  role: string;
  shift?: string;
  isAvailable?: boolean;
  avatar?: string | null;
}

interface Booking {
  id: number | string;
  customerId: number;
  services: {
    id: number;
    serviceId: number;
    comboId?: number | null;
    euipmentId?: number | null;
    bookingId: number;
    type?: string | null;
    numberOfPeople: number;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  combos: any[];
  equipments: any[];
  checkInDate: string;
  checkOutDate: string;
  bookingDate: string;
  numberOfPeople?: number | null;
  status: string;
  payment?: { status: string } | null;
  note?: string;
  internalNotes?: string;
  totalPrice: number;
}

export default function BookingManagementPage() {
  const router = useRouter();
  const [selectedBookings, setSelectedBookings] = useState<(number | string)[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoConfirmEnabled, setAutoConfirmEnabled] = useState<boolean>(true);
  const [assignedStaffMap, setAssignedStaffMap] = useState<Record<number, Staff | null>>({});
  const [customers, setCustomers] = useState<Record<number, any>>({});

  // Mock staff
  useEffect(() => {
    const mockStaff: Staff[] = [
      { id: "staff1", name: "Nguyễn Văn Hùng", role: "Hướng dẫn viên chính", shift: "morning", isAvailable: true, avatar: "/staff1.png" },
      { id: "staff2", name: "Trần Thị Lan", role: "Hướng dẫn viên", shift: "morning", isAvailable: true, avatar: "/staff2.png" },
      { id: "staff3", name: "Lê Minh Tuấn", role: "Hướng dẫn viên", shift: "afternoon", isAvailable: false, avatar: "/staff3.png" },
      { id: "staff4", name: "Phạm Thị Hoa", role: "Điều phối viên", shift: "evening", isAvailable: true, avatar: "/staff4.png" },
    ];
    setStaff(mockStaff);
  }, []);

  // Fetch staff mock + bookings API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:8080/apis/v1/bookings");
        if (!res.ok) throw new Error("Failed to fetch booking");
        const data: Booking[] = await res.json();
        setBookings(data);
        setAssignedStaffMap({
          1: staff[0], // booking.id = 1 được gán staff[0]
          2: null,     // booking.id = 2 chưa gán
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);
  useEffect(() => {
    const fetchCustomers = async () => {
      const map: Record<number, any> = {};
      for (const booking of bookings) {
        const res = await fetch(`http://localhost:8080/apis/v1/users/${booking.customerId}`);
        const data = await res.json();
        map[booking.customerId] = data;
      }
      setCustomers(map);
    };
    fetchCustomers();
  }, [bookings]);
  // Hàm gán nhân viên
  const handleAssignStaff = (bookingId: number | string, staffId: string) => {
    const staff = mockStaff.find((s) => s.id === staffId);
    if (!staff) return;

    setAssignedStaffMap((prev) => ({
      ...prev,
      [bookingId.toString()]: staff,
    }));
  };

  const search = searchTerm.toLowerCase();

  const filteredBookings = bookings.filter((booking) => {
    // customer info có thể lấy từ map (nếu đã fetch)
    const customer = customers[booking.customerId]; // customers: Record<number, { name: string, email: string }>
    const customerName = customer?.name ?? "";
    const customerEmail = customer?.email ?? "";

    const servicesNames = (booking.services ?? []).map((s) => s.name ?? "");
    const bookingKey = booking.id.toString();

    const matchesSearch =
      customerName.toLowerCase().includes(search) ||
      customerEmail.toLowerCase().includes(search) ||
      bookingKey.toLowerCase().includes(search) ||
      servicesNames.some((name) => name.toLowerCase().includes(search));

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    const matchesDate =
      dateFilter === "all" ||
      (() => {
        if (!booking.checkInDate) return false;
        const tripDate = new Date(booking.checkInDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        switch (dateFilter) {
          case "today":
            return tripDate.toDateString() === today.toDateString();
          case "tomorrow":
            return tripDate.toDateString() === tomorrow.toDateString();
          case "this_week":
            return tripDate >= today && tripDate <= nextWeek;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesStatus && matchesDate;
  });



  if (loading) return <div>Đang tải dữ liệu...</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-0">
            <AlertCircle className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge className="bg-green-100 text-green-800 border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xác nhận
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Đang thực hiện
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Hoàn thành
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-800 border-0">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800 border-0">Đã thanh toán</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">Chờ thanh toán</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800 border-0">Thanh toán thất bại</Badge>
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800 border-0">Đã hoàn tiền</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleAutoConfirm = async (bookingId: string) => {
    try {
      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "confirmed" as const } : booking)),
      )
      console.log("Auto-confirmed booking:", bookingId)
    } catch (error) {
      console.error("Error auto-confirming booking:", error)
    }
  }


  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus as any } : booking)),
      )
      console.log("Updated booking status:", bookingId, newStatus)
    } catch (error) {
      console.error("Error updating booking status:", error)
    }
  }

  const handleBulkAction = async (action: string) => {
    try {
      console.log("Bulk action:", action, "for bookings:", selectedBookings)
      // Implement bulk actions here
      setSelectedBookings([])
    } catch (error) {
      console.error("Error performing bulk action:", error)
    }
  }




  const getAvailableStaffForShift = (tripDate: string) => {
    const date = new Date(tripDate)
    const hour = date.getHours()

    let shift: "morning" | "afternoon" | "evening" | "night"
    if (hour >= 6 && hour < 12) shift = "morning"
    else if (hour >= 12 && hour < 18) shift = "afternoon"
    else if (hour >= 18 && hour < 22) shift = "evening"
    else shift = "night"

    return staff.filter((s) => s.shift === shift && s.isAvailable)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">OG Camping Admin</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/admin" className="hover:text-green-600">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Quản lý Booking</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Booking</h1>
          <p className="text-gray-600">Xác nhận tự động, gán nhân viên và theo dõi trạng thái booking</p>
        </div>

        {/* Auto Confirm Settings */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Cài đặt xác nhận tự động
            </CardTitle>
            <CardDescription>
              Tự động xác nhận booking khi thanh toán thành công và có nhân viên khả dụng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-confirm" className="font-medium">
                  Bật xác nhận tự động
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Booking sẽ được tự động xác nhận khi đáp ứng điều kiện
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="auto-confirm"
                    checked={autoConfirmEnabled}
                    onChange={(e) => setAutoConfirmEnabled(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${autoConfirmEnabled ? "bg-green-600" : ""
                      }`}
                  ></div>
                  <span
                    className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${autoConfirmEnabled ? "translate-x-5" : ""
                      }`}
                  ></span>
                </label>

                <Badge
                  className={`transition-colors ${autoConfirmEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {autoConfirmEnabled ? "Đang bật" : "Đã tắt"}
                </Badge>
              </div>
            </div>
          </CardContent>

        </Card>

        {/* Filters and Search */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Tên khách hàng, email, mã booking..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-filter">Ngày khởi hành</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="today">Hôm nay</SelectItem>
                    <SelectItem value="tomorrow">Ngày mai</SelectItem>
                    <SelectItem value="this_week">Tuần này</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Thao tác hàng loạt</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedBookings.length === 0}
                    onClick={() => handleBulkAction("confirm")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    Xác nhận
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedBookings.length === 0}
                    onClick={() => handleBulkAction("export")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    Xuất
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách Booking ({filteredBookings.length})</span>
              {selectedBookings.length > 0 && <Badge variant="secondary">{selectedBookings.length} đã chọn</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings.map((booking) => (

                <div key={booking.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedBookings.includes(Number(booking.id))}
                      onCheckedChange={(checked) => {
                        const bookingId = Number(booking.id); // ép kiểu number
                        if (checked) {
                          setSelectedBookings([...selectedBookings, bookingId]);
                        } else {
                          setSelectedBookings(selectedBookings.filter((id) => id !== bookingId));
                        }
                      }}
                    />
                    <Avatar>
                      <AvatarImage src={customers[booking.customerId]?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {customers[booking.customerId]?.name
                          ? customers[booking.customerId]?.name.charAt(0)
                          : "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">#{booking.id}</h3>
                          <p className="text-gray-600">
                            {customers[booking.customerId]?.name || "?"} • {customers[booking.customerId]?.phone || "?"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status)}
                          {booking.payment?.status && (
                            <Badge
                              className={
                                booking.payment.status === "PAID"
                                  ? "bg-green-100 text-green-800 border-0"
                                  : "bg-red-100 text-red-800 border-0"
                              }
                            >
                              {booking.payment.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                            </Badge>
                          )}
                        </div>
                      </div>


                      {/* Service Info */}
                      < div className="grid md:grid-cols-2 gap-4" >
                        <div className="space-y-2">
                          {booking.services.map((s) => (
                            <div key={s.id} className="flex items-center gap-2 text-sm text-gray-600">
                              <Tent className="w-4 h-4" />
                              <span className="font-medium">{s.name}</span>
                            </div>
                          ))}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Checkin: {booking.checkInDate ? formatDateTime(booking.checkInDate) : '*'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              CheckOut: {booking.checkOutDate ? formatDateTime(booking.checkOutDate) : '*'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{booking.numberOfPeople || booking.services[0].numberOfPeople || 0} người</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-green-600">{formatCurrency(booking.totalPrice)}</span>
                          </div>
                        </div>
                      </div>


                      {/* Staff Assignment */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-4 h-4 text-gray-600" />
                          {assignedStaffMap[booking.id as number] ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={assignedStaffMap[booking.id as number]?.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {assignedStaffMap[booking.id as number]?.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{assignedStaffMap[booking.id as number]?.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {assignedStaffMap[booking.id as number]?.role}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Chưa gán nhân viên</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Staff Assignment Dropdown */}

                          <Select
                            value={assignedStaffMap[booking.id as number]?.id?.toString() || ""}
                            onValueChange={(staffId) => handleAssignStaff(booking.id as number, staffId)}
                          >
                            <SelectTrigger className="w-48 h-8 text-xs border-gray-300">
                              <SelectValue placeholder="Gán nhân viên" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableStaffForShift(booking.checkInDate).map((staffMember) => (
                                <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-4 h-4">
                                      <AvatarImage src={staffMember.avatar || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs">{staffMember.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{staffMember.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {staffMember.shift}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>




                          {/* Status Change Dropdown */}
                          <Select
                            value={assignedStaffMap[String(booking.id)]?.id || ""} // ép booking.id sang string
                            onValueChange={(staffId: string) => handleAssignStaff(booking.id, staffId)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Chờ xử lý</SelectItem>
                              <SelectItem value="confirmed">Xác nhận</SelectItem>
                              <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                              <SelectItem value="completed">Hoàn thành</SelectItem>
                              <SelectItem value="cancelled">Hủy</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Auto Confirm Button */}
                          {booking.status === "pending" && booking.payment?.status === "PAID" && (
                            <Button
                              size="sm"
                              onClick={() => handleAutoConfirm(booking.id)}
                              className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Xác nhận
                            </Button>
                          )}


                          {/* Actions Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-gray-300 bg-transparent"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/admin/bookings/${booking.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Nhắn tin khách hàng
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Tải hóa đơn
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.note && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Ghi chú:</strong> {booking.note}
                          </p>
                        </div>
                      )}

                      {/* Booking Timeline */}
                      <div className="text-xs text-gray-500">Tạo: {formatDateTime(booking.bookingDate)}</div>
                    </div>
                  </div>
                </div>
              ))
              }

              {
                filteredBookings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Không tìm thấy booking nào</p>
                    <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                )
              }
            </div >
          </CardContent >
        </Card >
      </div >
    </div >
  )
}
