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
  Loader2,
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

interface ShiftAssignment {
  userId: number;
  userName: string;
  role: string;
}

interface Shift {
  id: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: string;
  assignments: ShiftAssignment[];
}

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
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
  staff?: {
    id: number;
    name: string;
    role: string;
  } | null;
  internalNotes?: string;
  totalPrice: number;
}
const mockStaff: Staff[] = [
  { id: "staff1", name: "Nguyễn Văn Hùng", role: "Hướng dẫn viên chính", shift: "morning", isAvailable: true, avatar: "/staff1.png" },
  { id: "staff2", name: "Trần Thị Lan", role: "Hướng dẫn viên", shift: "morning", isAvailable: true, avatar: "/staff2.png" },
  { id: "staff3", name: "Lê Minh Tuấn", role: "Hướng dẫn viên", shift: "afternoon", isAvailable: false, avatar: "/staff3.png" },
  { id: "staff4", name: "Phạm Thị Hoa", role: "Điều phối viên", shift: "evening", isAvailable: true, avatar: "/staff4.png" },
];

export default function BookingManagementPage() {
  const router = useRouter();
  const [selectedBookings, setSelectedBookings] = useState<(number | string)[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [staff, setStaff] = useState<Staff[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoConfirmEnabled, setAutoConfirmEnabled] = useState<boolean>(true);
  const [assignedStaffMap, setAssignedStaffMap] = useState<Record<number, Staff | null>>({});
  const [customers, setCustomers] = useState<Record<number, any>>({});
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Mock staff
  useEffect(() => {
    setStaff(mockStaff); // chỉ cần set 1 lần
  }, []);

  // Fetch shifts and users
  useEffect(() => {
    const fetchShiftsAndUsers = async () => {
      try {
        // Fetch shifts
        const shiftsRes = await fetch("http://localhost:8080/apis/v1/admin/shifts");
        if (shiftsRes.ok) {
          const shiftsData: Shift[] = await shiftsRes.json();
          setShifts(shiftsData);
        }

        // Fetch users
        const usersRes = await fetch("http://localhost:8080/apis/v1/users");
        if (usersRes.ok) {
          const usersData: User[] = await usersRes.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Error fetching shifts and users:', err);
      }
    };

    fetchShiftsAndUsers();
  }, []);

  // Fetch staff mock + bookings API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:8080/apis/v1/bookings");
        if (!res.ok) throw new Error("Failed to fetch booking");
        const data: Booking[] = await res.json();
        setBookings(data);

        // Tạo assignedStaffMap từ dữ liệu thật của booking
        const staffMap: Record<number, Staff | null> = {};
        data.forEach(booking => {
          if (booking.staff) {
            staffMap[booking.id as number] = {
              id: booking.staff.id,
              name: booking.staff.name,
              role: booking.staff.role,
              avatar: null, // API không trả về avatar
              isAvailable: true
            };
          } else {
            staffMap[booking.id as number] = null;
          }
        });
        setAssignedStaffMap(staffMap);
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
  const handleAssignStaff = async (bookingId: number | string, staffId: string) => {
    try {
      // Gọi API để gán nhân viên vào booking
      const response = await fetch(`http://localhost:8080/apis/v1/bookings/${bookingId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId: parseInt(staffId) })
      });

      if (!response.ok) {
        throw new Error('Failed to assign staff');
      }

      // Tìm thông tin nhân viên được gán từ danh sách users
      const user = users.find(u => u.id.toString() === staffId);
      const availableStaff = getAvailableStaffForShift('');
      const availableStaffMember = availableStaff.find((s) => s.id.toString() === staffId);

      const staff = user || availableStaffMember;

      if (staff) {
        const staffInfo: Staff = {
          id: staff.id,
          name: staff.name,
          role: staff.role,
          avatar: staff.avatar || null,
          isAvailable: true
        };

        setAssignedStaffMap((prev) => ({
          ...prev,
          [bookingId.toString()]: staffInfo,
        }));

        // Hiển thị thông báo thành công
        console.log(`Đã gán ${staff.name} vào booking ${bookingId}`);
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('Có lỗi xảy ra khi gán nhân viên');
    }
  };

  const search = searchTerm.toLowerCase();

  // Sắp xếp booking theo thời gian tạo mới nhất lên đầu
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.bookingDate || 0);
    const dateB = new Date(b.bookingDate || 0);
    return dateB.getTime() - dateA.getTime(); // Mới nhất lên đầu
  });

  const filteredBookings = sortedBookings.filter((booking) => {
    // customer info có thể lấy từ map (nếu đã fetch)
    const customer = customers[booking.customerId]; // customers: Record<number, { name: string, email: string, phone: string }>
    const customerName = customer?.name ?? "";
    const customerEmail = customer?.email ?? "";
    const customerPhone = customer?.phone ?? "";

    const servicesNames = (booking.services ?? []).map((s) => s.name ?? "");
    const bookingKey = booking.id.toString();

    // Tìm kiếm theo tên, sđt, id booking
    const matchesSearch =
      customerName.toLowerCase().includes(search) ||
      customerPhone.toLowerCase().includes(search) ||
      bookingKey.toLowerCase().includes(search) ||
      servicesNames.some((name) => name.toLowerCase().includes(search));

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    // Filter theo thời gian tạo booking (không phải ngày khởi hành)
    const matchesDate =
      dateFilter === "all" ||
      (() => {
        if (!booking.bookingDate) return false;
        const bookingCreatedDate = new Date(booking.bookingDate);
        const today = new Date();
        
        // Đầu tuần (Chủ nhật)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Cuối tuần (Thứ 7)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Đầu tháng
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Cuối tháng
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        switch (dateFilter) {
          case "this_week":
            return bookingCreatedDate >= startOfWeek && bookingCreatedDate <= endOfWeek;
          case "this_month":
            return bookingCreatedDate >= startOfMonth && bookingCreatedDate <= endOfMonth;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };



  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

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




  const getAvailableStaffForShift = (bookingDate: string) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Thời gian hiện tại tính bằng phút
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Tìm các ca trực hôm nay có thời gian phù hợp với hiện tại
    const currentShifts = shifts.filter(shift => {
      if (shift.shiftDate !== today) return false;

      // Chuyển đổi thời gian ca trực sang phút (hỗ trợ cả HH:MM và HH:MM:SS)
      const startTimeParts = shift.startTime.split(':');
      const endTimeParts = shift.endTime.split(':');
      const startHour = parseInt(startTimeParts[0]);
      const startMin = parseInt(startTimeParts[1]);
      const endHour = parseInt(endTimeParts[0]);
      const endMin = parseInt(endTimeParts[1]);

      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      // Kiểm tra thời gian hiện tại có nằm trong ca trực không
      const isTimeMatch = currentTime >= startTime && currentTime <= endTime;
      const isStatusValid = ['REGISTERED', 'APPROVED', 'IN_PROGRESS'].includes(shift.status);

      return isTimeMatch && isStatusValid;
    });

    // Lấy danh sách nhân viên đang trong ca trực hiện tại
    const availableStaff: Staff[] = [];

    currentShifts.forEach(shift => {
      shift.assignments.forEach(assignment => {
        const user = users.find(u => u.id === assignment.userId);
        // Bỏ điều kiện u.status === 'ACTIVE' tạm thời để test
        if (user) {
          availableStaff.push({
            id: user.id,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            shift: `${shift.startTime.substring(0, 5)}-${shift.endTime.substring(0, 5)}`,
            isAvailable: true
          });
        }
      });
    });

    // Loại bỏ nhân viên trùng lặp
    const uniqueStaff = availableStaff.filter((staff, index, self) =>
      index === self.findIndex(s => s.id === staff.id)
    );

    return uniqueStaff;
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
            <div className="grid md:grid-cols-4 gap-6">
              {/* Tìm kiếm */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Tên, sđt, mã booking..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Trạng thái */}
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                  Trạng thái
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        Tất cả
                      </div>
                    </SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        Chờ xử lý
                      </div>
                    </SelectItem>
                    <SelectItem value="CONFIRMED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        Đã xác nhận
                      </div>
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        Đang thực hiện
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        Hoàn thành
                      </div>
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        Đã hủy
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thời gian tạo */}
              <div className="space-y-2">
                <Label htmlFor="date-filter" className="text-sm font-medium text-gray-700">
                  Thời gian tạo
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        Tất cả
                      </div>
                    </SelectItem>
                    <SelectItem value="this_week">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Tuần này
                      </div>
                    </SelectItem>
                    <SelectItem value="this_month">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        Tháng này
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thao tác hàng loạt */}
              {/* <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Thao tác hàng loạt
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedBookings.length === 0}
                    onClick={() => handleBulkAction("confirm")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Xác nhận ({selectedBookings.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedBookings.length === 0}
                    onClick={() => handleBulkAction("export")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Xuất
                  </Button>
                </div>
              </div> */}
            </div>
            
            {/* Thống kê kết quả và phân trang */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>
                    Hiển thị: <strong>{startIndex + 1}-{Math.min(endIndex, filteredBookings.length)}</strong> / <strong>{filteredBookings.length}</strong> booking
                    {filteredBookings.length !== bookings.length && (
                      <span className="text-gray-500"> (lọc từ {bookings.length})</span>
                    )}
                  </span>
                  {selectedBookings.length > 0 && (
                    <span className="text-blue-600">
                      Đã chọn: <strong>{selectedBookings.length}</strong> booking
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>Hiển thị:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>/trang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Cập nhật: {new Date().toLocaleTimeString('vi-VN')}</span>
                  </div>
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
              <div className="flex items-center gap-2">
                {paginatedBookings.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentPageIds = paginatedBookings.map(b => Number(b.id));
                      const selectedNumbers = selectedBookings.map(id => Number(id));
                      const allSelected = currentPageIds.every(id => selectedNumbers.includes(id));
                      
                      if (allSelected) {
                        // Bỏ chọn tất cả trang hiện tại
                        setSelectedBookings(prev => prev.filter(id => !currentPageIds.includes(Number(id))));
                      } else {
                        // Chọn tất cả trang hiện tại
                        setSelectedBookings(prev => {
                          const prevNumbers = prev.map(id => Number(id));
                          const newIds = currentPageIds.filter(id => !prevNumbers.includes(id));
                          return [...prev, ...newIds];
                        });
                      }
                    }}
                    className="text-xs"
                  >
                    {(() => {
                      const currentPageIds = paginatedBookings.map(b => Number(b.id));
                      const selectedNumbers = selectedBookings.map(id => Number(id));
                      const allSelected = currentPageIds.every(id => selectedNumbers.includes(id));
                      return allSelected ? 'Bỏ chọn trang' : 'Chọn tất cả trang';
                    })()}
                  </Button>
                )}
                {selectedBookings.length > 0 && <Badge variant="secondary">{selectedBookings.length} đã chọn</Badge>}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Không tìm thấy booking</h3>
                  <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              ) : (
                paginatedBookings.map((booking) => (

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
                          <h3 className="font-semibold text-lg text-gray-900">#OGC00000{booking.id}</h3>
                          <p className="text-gray-600">
                            {customers[booking.customerId]?.name || ""} - {customers[booking.customerId]?.phone || ""}
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
                            <span>
                              {(booking.numberOfPeople
                                ?? booking.services?.[0]?.numberOfPeople
                                ?? booking.combos?.[0]?.numberOfPeople
                                ?? 0)} người
                            </span>

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
                          {(() => {
                            const availableStaff = getAvailableStaffForShift(booking.checkInDate);
                            const hasAvailableStaff = availableStaff.length > 0;

                            return (
                              <>
                                <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${hasAvailableStaff
                                  ? 'text-green-600 bg-green-50'
                                  : 'text-amber-600 bg-amber-50'
                                  }`}>
                                  <Clock className="w-3 h-3" />
                                  {hasAvailableStaff
                                    ? `${availableStaff.length} nhân viên đang trực`
                                    : 'Không có nhân viên trong ca'
                                  }
                                </div>
                                <Select
                                  value={assignedStaffMap[booking.id as number]?.id?.toString() || ""}
                                  onValueChange={(staffId) => handleAssignStaff(booking.id as number, staffId)}
                                  disabled={!hasAvailableStaff}
                                >
                                  <SelectTrigger
                                    className={`w-80 h-13 px-4 text-sm rounded-lg border border-gray-300 shadow-sm bg-white 
      ${!hasAvailableStaff ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400 focus:ring-2 focus:ring-blue-500"}`}
                                  >
                                    <SelectValue
                                      placeholder={hasAvailableStaff ? "Chọn nhân viên để gán" : "Không có nhân viên khả dụng"}
                                    />
                                  </SelectTrigger>

                                  <SelectContent className="rounded-lg shadow-lg max-h-80 overflow-auto">
                                    {availableStaff.map((staffMember) => (
                                      <SelectItem
                                        key={staffMember.id}
                                        value={staffMember.id.toString()}
                                        className="p-3 hover:bg-gray-100 cursor-pointer"
                                      >
                                        <div className="flex items-center gap-4">
                                          {/* Avatar */}
                                          <Avatar className="w-10 h-10 shrink-0">
                                            <AvatarImage src={staffMember.avatar || "/placeholder.svg"} />
                                            <AvatarFallback className="text-sm">
                                              {staffMember.name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>

                                          {/* Info */}
                                          <div className="flex flex-col w-full min-w-0">
                                            <span className="text-sm font-medium truncate leading-snug">
                                              {staffMember.name}
                                            </span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                                {staffMember.role}
                                              </Badge>
                                              <Badge
                                                variant="secondary"
                                                className="text-xs px-2 py-0.5 flex items-center"
                                              >
                                                <Clock className="w-3 h-3 mr-1" />
                                                {staffMember.shift}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </>
                            );
                          })()}




                          {/* Status Change Dropdown */}
                          {/* <Select
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
                          </Select> */}

                          {/* Auto Confirm Button */}
                          {booking.status === "pending" && booking.payment?.status === "PAID" && (
                            <Button
                              size="sm"
                              onClick={() => handleAutoConfirm(booking.id as string)}
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
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Previous button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-gray-300"
                    >
                      Trước
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const showPages = 5; // Hiển thị tối đa 5 trang
                        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                        let endPage = Math.min(totalPages, startPage + showPages - 1);
                        
                        // Điều chỉnh nếu không đủ trang ở cuối
                        if (endPage - startPage + 1 < showPages) {
                          startPage = Math.max(1, endPage - showPages + 1);
                        }
                        
                        // Nút trang đầu tiên
                        if (startPage > 1) {
                          pages.push(
                            <Button
                              key={1}
                              variant={1 === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(1)}
                              className="w-8 h-8 p-0 border-gray-300"
                            >
                              1
                            </Button>
                          );
                          if (startPage > 2) {
                            pages.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
                          }
                        }
                        
                        // Các trang giữa
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={i === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(i)}
                              className="w-8 h-8 p-0 border-gray-300"
                            >
                              {i}
                            </Button>
                          );
                        }
                        
                        // Nút trang cuối cùng
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
                          }
                          pages.push(
                            <Button
                              key={totalPages}
                              variant={totalPages === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(totalPages)}
                              className="w-8 h-8 p-0 border-gray-300"
                            >
                              {totalPages}
                            </Button>
                          );
                        }
                        
                        return pages;
                      })()
                      }
                    </div>
                    
                    {/* Next button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-gray-300"
                    >
                      Tiếp
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div >
    </div >
  )
}
