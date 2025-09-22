"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Tent,
  Calendar,
  Package,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  Download,
  Edit,
  UserCheck,
  Save,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Staff {
  id: string
  name: string
  role: string
  shift: "morning" | "afternoon" | "evening" | "night"
  avatar?: string
  isAvailable: boolean
}

export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  IN_PROGRESS = "IN_PROGRESS",
}

export enum PaymentStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export type BookingItemType = "SERVICE" | "COMBO" | "EQUIPMENT"

export interface BookingItem {
  id: string
  type: BookingItemType
  name: string
  description: string
  price: number
  quantity: number
  duration?: string
  image: string

  // Optional: dùng để fetch thêm thông tin chi tiết (vd: image từ serviceId)
  serviceId?: number
  comboId?: number
  equipmentId?: number
  checkInDate?: string   // <-- thêm
  checkOutDate?: string  // <-- thêm
}
export interface BookingServiceItem {
  id: number
  serviceId: number
  comboId?: number | null
  euipmentId?: number | null
  bookingId: number
  type?: string | null
  numberOfPeople: number
  checkInDate: string
  checkOutDate: string
  name: string
  quantity: number
  price: number
  total: number
}
export interface BookingDetail {
  id: string
  customerId: number
  bookingDate: string
  tripDate: string
  people: number
  status: BookingStatus
  paymentMethod: string
  paymentStatus: PaymentStatus
  totalAmount: number
  specialRequests: string
  internalNotes: string
  items: BookingItem[]
  services: BookingServiceItem[]
  combos: BookingServiceItem[]
  equipments: BookingServiceItem[]
  paymentCreatedAt: string
  timeline: {
    date: string
    status: string
    description: string
  }[]
  location: string
  duration: string
  assignedStaff?: Staff
  autoConfirm: boolean
  adminNotes: string
  checkInDate?: string | null
  checkOutDate?: string | null
}
export interface UserResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  userId: number
}
function getCheckInDate(booking: BookingDetail & { services?: any[] }) {
  if (booking.tripDate) return booking.tripDate
  if (booking.services && booking.services.length > 0) {
    return booking.services[0].checkInDate
  }
  return null
}

function getCheckOutDate(booking: BookingDetail & { services?: any[] }) {
  if (booking.tripDate) return booking.tripDate // hoặc booking.checkOutDate nếu có field riêng
  if (booking.services && booking.services.length > 0) {
    return booking.services[0].checkOutDate
  }
  return null
}

export default function AdminBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState("")
  const [selectedStaff, setSelectedStaff] = useState("")
  const [customer, setCustomer] = useState<UserResponse | null>(null)
  const [notif, setNotif] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/apis/v1/users');
        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData);
          
          // Convert users to Staff format - chỉ lấy nhân viên có role STAFF
          const staffData: Staff[] = usersData
            .filter((user: any) => user.status === 'ACTIVE' && user.role === 'STAFF')
            .map((user: any) => ({
              id: user.id.toString(),
              name: user.name,
              role: user.role,
              shift: 'morning' as const, // Default shift
              isAvailable: true,
              avatar: user.avatar
            }));
          
          setStaff(staffData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!booking?.customerId) return

    const fetchCustomer = async () => {
      try {
        const res = await fetch(`http://localhost:8080/apis/v1/customers/${booking.customerId}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Không lấy được thông tin khách hàng")
        const data = await res.json()
        setCustomer(data)
      } catch (err) {
        console.error("Lỗi lấy customer:", err)
      }
    }

    fetchCustomer()
  }, [booking?.customerId])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`http://localhost:8080/apis/v1/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Không tìm thấy booking");

      const data = await res.json();

      // Fetch ảnh service song song
      const serviceImages = await Promise.all(
        data.services.map(async (s: any) => {
          try {
            const serviceRes = await fetch(`http://localhost:8080/apis/v1/services/${s.serviceId}`);
            if (!serviceRes.ok) return "/default-service.png";
            const serviceData = await serviceRes.json();
            return serviceData.imageUrl
              ? `http://localhost:8080${serviceData.imageUrl}`
              : "/default-service.png";
          } catch {
            return "/default-service.png";
          }
        })
      );

      const booking: BookingDetail = {
        id: data.id.toString(),
        customerId: data.customerId,
        bookingDate: data.bookingDate || data.createdAt || "",
        tripDate: data.tripDate || "",

        // fallback checkInDate/OutDate
        checkInDate: data.checkInDate || data.services?.[0]?.checkInDate || null,
        checkOutDate: data.checkOutDate || data.services?.[0]?.checkOutDate || null,

        people: data.numberOfPeople || data.services?.[0].numberOfPeople || 0,
        status: data.status || "PENDING",
        paymentMethod: data.payment?.method || "",
        paymentStatus: data.payment?.status || "PENDING",
        paymentCreatedAt: data.payment?.createdAt || "",
        totalAmount: data.totalPrice || 0,
        specialRequests: data.note || "",
        internalNotes: data.internalNotes || "",
        location: data.services?.[0]?.name || "Đang cập nhật",
        duration:
          (data.checkInDate && data.checkOutDate
            ? `${Math.ceil(
              (new Date(data.checkOutDate).getTime() -
                new Date(data.checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
            )} ngày`
            : data.services?.[0]
              ? `${Math.ceil(
                (new Date(data.services[0].checkOutDate).getTime() -
                  new Date(data.services[0].checkInDate).getTime()) /
                (1000 * 60 * 60 * 24)
              )} ngày`
              : ""),

        autoConfirm: true,
        adminNotes: "",

        // mapping items (service + equipment)
        items: [
          ...data.services.map((s: any, idx: number) => ({
            id: s.id.toString(),
            type: "SERVICE" as const,
            name: s.name,
            description: "",
            price: s.price,
            quantity: s.quantity,
            duration: `${Math.ceil(
              (new Date(s.checkOutDate).getTime() - new Date(s.checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
            )} ngày`,
            image: serviceImages[idx],
            serviceId: s.serviceId,
            checkInDate: s.checkInDate,
            checkOutDate: s.checkOutDate,
          })),
          ...data.equipments.map((e: any) => ({
            id: e.id.toString(),
            type: "EQUIPMENT" as const,
            name: e.name,
            description: "",
            price: e.price,
            quantity: e.quantity,
            duration: "",
            image: "/default-equipment.png",
            equipmentId: e.equipmentId,
          })),
        ],

        // mapping services
        services: data.services.map((s: any) => ({
          id: s.id,
          serviceId: s.serviceId,
          comboId: s.comboId,
          euipmentId: s.euipmentId,
          bookingId: s.bookingId,
          type: s.type,
          numberOfPeople: s.numberOfPeople,
          checkInDate: s.checkInDate,
          checkOutDate: s.checkOutDate,
          name: s.name,
          quantity: s.quantity,
          price: s.price,
          total: s.total,
        })),

        // mapping combos
        combos: (data.combos || []).map((c: any) => ({
          id: c.id,
          serviceId: c.serviceId,
          comboId: c.comboId,
          euipmentId: c.euipmentId,
          bookingId: c.bookingId,
          type: c.type,
          numberOfPeople: c.numberOfPeople,
          checkInDate: c.checkInDate,
          checkOutDate: c.checkOutDate,
          name: c.name,
          quantity: c.quantity,
          price: c.price,
          total: c.total,
        })),

        // mapping equipments
        equipments: (data.equipments || []).map((e: any) => ({
          id: e.id,
          serviceId: e.serviceId,
          comboId: e.comboId,
          euipmentId: e.euipmentId,
          bookingId: e.bookingId,
          type: e.type,
          numberOfPeople: e.numberOfPeople,
          checkInDate: e.checkInDate,
          checkOutDate: e.checkOutDate,
          name: e.name,
          quantity: e.quantity,
          price: e.price,
          total: e.total,
        })),

        timeline: [
          {
            date: data.bookingDate || "",
            status: "created",
            description: "Đơn đặt chỗ được tạo",
          },
          ...(data.payment
            ? [
              {
                date: data.payment.createdAt,
                status: "PAID",
                description: "Thanh toán thành công qua VNPay",
              },
            ]
            : []),
        ],

        assignedStaff: data.staff ? {
          id: data.staff.id.toString(),
          name: data.staff.name,
          role: data.staff.role,
          avatar: undefined,
          shift: "morning" as const,
          isAvailable: true
        } : undefined,
      };


      setBooking(booking);
      setAdminNotes(booking.internalNotes);
      setSelectedStaff(booking.assignedStaff?.id || "");
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // ✅ Gọi fetchBooking khi component mount
  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  // ✅ Hàm lưu notes
  const handleSaveNotes = async () => {
    if (!booking) return;

    try {
      const response = await fetch(
        `http://localhost:8080/apis/v1/bookings/${bookingId}/internal-notes`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "text/plain",
          },
          body: adminNotes,
        }
      );

      if (!response.ok) throw new Error("Lưu thất bại");

      setAdminNotes(""); // clear input
      setNotif("✅ Ghi chú đã được cập nhật!");
      setTimeout(() => setNotif(null), 3000);

      // ✅ Gọi lại fetchBooking để refresh dữ liệu
      await fetchBooking();
    } catch (error) {
      console.error("Error saving notes:", error);
      setNotif("❌ Có lỗi khi lưu ghi chú!");
      setTimeout(() => setNotif(null), 3000);
    }
  };


  function formatVietnameseDate(dateString: string) {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day} tháng ${month} năm ${year}`
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xác nhận
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Hoàn thành
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Clock className="w-3 h-3 mr-1" />
            Đang thực hiện
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }
  const handleCheckIn = async () => {
    if (!booking) return;

    const checkInDate = booking.checkInDate
      ? new Date(booking.checkInDate)
      : booking.services?.[0]
        ? new Date(booking.services[0].checkInDate)
        : null;

    const now = new Date();
    if (!checkInDate || now < checkInDate) {
      alert("Chưa đến thời gian check-in");
      return;
    }

    try {
      // 1. Call check-in API
      const res = await fetch(`http://localhost:8080/apis/v1/bookings/${booking.id}/checkin`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Check-in failed");

      // 2. Call fetchBooking để lấy full data
      await fetchBooking(); // không cần truyền booking.id
    } catch (err) {
      console.error(err);
      alert("Không thể check-in!");
    }
  };


  const handleCheckOut = async () => {
    if (!booking) return;

    try {
      // 1. Gọi API check-out
      const res = await fetch(`http://localhost:8080/apis/v1/bookings/${booking.id}/checkout`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Check-out failed");

      // 2. Gọi lại API fetch booking đầy đủ từ state
      await fetchBooking(); // fetchBooking() đã sử dụng booking.id từ state

    } catch (err) {
      console.error(err);
      alert("Không thể check-out!");
    }
  };


  const getActionButton = () => {
    if (!booking) return null;

    switch (booking.status) {
      case "PENDING":
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => handleStatusChange("CONFIRMED")}
              className="flex-1 bg-green-500 hover:bg-green-00 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Xác nhận booking
            </Button>
            <Button
              onClick={() => handleStatusChange("CANCELLED")}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Hủy booking
            </Button>
          </div>
        );

      case "CONFIRMED":
        const checkInDateTime = booking.checkInDate
          ? new Date(booking.checkInDate) // LocalDateTime parse tự động
          : booking.services?.[0]?.checkInDate
            ? new Date(booking.services[0].checkInDate)
            : null;

        const canCheckIn = checkInDateTime ? new Date() >= checkInDateTime : false;

        return (
          <Button
            onClick={handleCheckIn}
            disabled={!canCheckIn}
            className={`w-full ${canCheckIn
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-400 text-white cursor-not-allowed"
              }`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Xác nhận khách Check-In
          </Button>
        );


      case "IN_PROGRESS":
        return (
          <Button
            onClick={handleCheckOut}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Xác nhận khách Check-Out
          </Button>
        );


      default:
        return null; // COMPLETED hoặc CANCELLED thì không hiển thị nút
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return

    // Hiển thị confirm dialog cho các thao tác quan trọng
    if (newStatus === "CANCELLED") {
      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn hủy booking #${booking.id}?\n\n` +
        `Khách hàng: ${customer?.firstName || ''} ${customer?.lastName || ''}\n` +
        `Tổng tiền: ${formatCurrency(booking.totalAmount)}\n\n` +
        `Hành động này không thể hoàn tác!`
      );
      
      if (!confirmed) {
        return; // Người dùng hủy thao tác
      }
    } else if (newStatus === "CONFIRMED") {
      const confirmed = window.confirm(
        `Xác nhận booking #${booking.id}?\n\n` +
        `Khách hàng: ${customer?.firstName || ''} ${customer?.lastName || ''}\n` +
        `Tổng tiền: ${formatCurrency(booking.totalAmount)}\n\n` +
        `Booking sẽ chuyển sang trạng thái đã xác nhận.`
      );
      
      if (!confirmed) {
        return;
      }
    }

    try {
      const res = await fetch(
        `http://localhost:8080/apis/v1/bookings/${booking.id}/status?status=${newStatus}`,
        {
          method: "PUT",
        }
      )

      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại")

      const updated = await res.json()
      setBooking((prev) =>
        prev ? { ...prev, status: updated.status as BookingStatus } : prev
      )
      
      // Hiển thị thông báo thành công
      if (newStatus === "CANCELLED") {
        setNotif("✅ Đã hủy booking thành công!");
      } else if (newStatus === "CONFIRMED") {
        setNotif("✅ Đã xác nhận booking thành công!");
      } else {
        setNotif(`✅ Đã cập nhật trạng thái thành công!`);
      }
      setTimeout(() => setNotif(null), 3000);
      
    } catch (err) {
      console.error(err)
      setNotif("❌ Không thể cập nhật trạng thái!");
      setTimeout(() => setNotif(null), 3000);
    }
  }

  const handleStaffAssignment = async () => {
    if (!booking || !selectedStaff) return

    try {
      // Gọi API để gán nhân viên vào booking
      const response = await fetch(`http://localhost:8080/apis/v1/bookings/${bookingId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId: parseInt(selectedStaff) })
      });

      if (!response.ok) {
        throw new Error('Failed to assign staff');
      }

      // Tìm thông tin nhân viên được gán
      const staffMember = staff.find((s) => s.id === selectedStaff)
      if (staffMember) {
        setBooking((prev) => (prev ? { ...prev, assignedStaff: staffMember } : null))
        setNotif(`Đã gán ${staffMember.name} vào booking ${bookingId}`);
        setTimeout(() => setNotif(null), 3000);
        console.log("Assigned staff:", selectedStaff, "to booking:", bookingId)
      }
    } catch (error) {
      console.error("Error assigning staff:", error)
      setNotif('Có lỗi xảy ra khi gán nhân viên');
      setTimeout(() => setNotif(null), 3000);
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin booking...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy booking</h2>
          <p className="text-gray-600 mb-4">Booking ID: #OG00000{bookingId} không tồn tại</p>
          <Button onClick={() => router.push("/admin/bookings")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }
  if (!customer) {
    return <p className="text-gray-500">Đang tải thông tin khách hàng...</p>
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notif && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            {notif}
          </div>
        </div>
      )}
      
      

      <div className="container mx-auto px-4 py-8">
        {/* Booking Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking #OG00000{booking.id}</h1>
              <p className="text-gray-600">
                Đã đặt ngày {formatVietnameseDate(booking.bookingDate)}
              </p>

            </div>
            <div className="text-right">
              {getStatusBadge(booking.status)}
              <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(booking.totalAmount)}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-4 bg-gray-100">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="management">Quản lý</TabsTrigger>
            <TabsTrigger value="timeline">Lịch sử</TabsTrigger>
            <TabsTrigger value="notes">Ghi chú</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trip Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Thông tin chuyến đi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Địa điểm</p>
                          <p className="font-medium">{booking.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Thời gian</p>
                          <p className="font-medium">{booking.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Ngày Checkin</p>
                          <p className="font-medium">
                            {booking.checkInDate
                              ? formatDateTime(booking.checkInDate)
                              : booking.services && booking.services.length > 0
                                ? formatDateTime(booking.services[0].checkInDate)
                                : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Số người</p>
                          <p className="font-medium">{booking.people} người</p>
                        </div>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Yêu cầu đặc biệt</h4>
                        <p className="text-yellow-700">{booking.specialRequests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Booking Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-600" />
                      Dịch vụ & Thiết bị
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Hiển thị Services */}
                      {booking?.services?.map((service) => (
                        <div key={`service-${service.id}`} className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50">
                          <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{service.name}</h4>
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                Dịch vụ
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span>Số người: {service.numberOfPeople}</span>
                              <span>Số lượng: {service.quantity}</span>
                            </div>
                            {service.checkInDate && service.checkOutDate && (
                              <div className="text-sm text-gray-500">
                                <span>Thời gian: {new Date(service.checkInDate).toLocaleDateString('vi-VN')} - {new Date(service.checkOutDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">{formatCurrency(service.total)}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(service.price)} x {service.quantity}</p>
                          </div>
                        </div>
                      ))}

                      {/* Hiển thị Combos */}
                      {booking?.combos?.map((combo) => (
                        <div key={`combo-${combo.id}`} className="flex items-center gap-4 p-4 border rounded-lg bg-green-50">
                          <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{combo.name}</h4>
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                Combo
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span>Số người: {combo.numberOfPeople}</span>
                              <span>Số lượng: {combo.quantity}</span>
                            </div>
                            {combo.checkInDate && combo.checkOutDate && (
                              <div className="text-sm text-gray-500">
                                <span>Thời gian: {new Date(combo.checkInDate).toLocaleDateString('vi-VN')} - {new Date(combo.checkOutDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">{formatCurrency(combo.total)}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(combo.price)} x {combo.quantity}</p>
                          </div>
                        </div>
                      ))}

                      {/* Hiển thị Equipments */}
                      {booking?.equipments?.map((equipment) => (
                        <div key={`equipment-${equipment.id}`} className="flex items-center gap-4 p-4 border rounded-lg bg-orange-50">
                          <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{equipment.name}</h4>
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                                Thiết bị
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              {equipment.numberOfPeople && <span>Số người: {equipment.numberOfPeople}</span>}
                              <span>Số lượng: {equipment.quantity}</span>
                            </div>
                            {equipment.checkInDate && equipment.checkOutDate && (
                              <div className="text-sm text-gray-500">
                                <span>Thời gian: {new Date(equipment.checkInDate).toLocaleDateString('vi-VN')} - {new Date(equipment.checkOutDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">{formatCurrency(equipment.total)}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(equipment.price)} x {equipment.quantity}</p>
                          </div>
                        </div>
                      ))}

                      {/* Empty state */}
                      {(!booking?.services?.length && !booking?.combos?.length && !booking?.equipments?.length) && (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Không có dịch vụ hoặc thiết bị nào</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {customer?.firstName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {customer ? `${customer.firstName} ${customer.lastName}` : "Chưa có"}
                        </p>
                        <p className="text-sm text-gray-500">Khách hàng</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{customer?.email || "Chưa có email"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{customer?.phone || "Chưa có số điện thoại"}</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Địa chỉ</p>
                      <p className="text-sm">{customer?.address || "Chưa có địa chỉ"}</p>
                    </div>
                  </CardContent>

                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      Thông tin thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Phương thức:</span>
                      <span className="font-medium">
                        {booking.paymentMethod === "vnpay"
                          ? "VNPay"
                          : booking.paymentMethod === "momo"
                            ? "MoMo"
                            : "Chuyển khoản"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <Badge
                        className={
                          booking.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {booking.paymentStatus === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tổng tiền:</span>
                      <span className="font-bold text-green-600">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Quản lý trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trạng thái hiện tại */}
                  <div className="space-y-2">
                    <Label>Trạng thái hiện tại</Label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(booking?.status)}
                      {booking?.autoConfirm && (
                        <Badge className="bg-blue-100 text-blue-500">Tự động xác nhận</Badge>
                      )}
                    </div>
                  </div>

                  {/* Chọn thủ công */}
                  <div className="space-y-2">
                    <Label>Thay đổi trạng thái</Label>
                    <Select
                      value={booking?.status}
                      onValueChange={(newStatus) => handleStatusChange(newStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                        <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                        <SelectItem value="IN_PROGRESS">Khách hàng Check-In</SelectItem>
                        <SelectItem value="COMPLETED">Khách hàng Check-Out</SelectItem>
                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {getActionButton()}
                </CardContent>

              </Card>

              {/* Staff Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    Gán nhân viên
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.assignedStaff && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 mb-2">Nhân viên được gán</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={booking.assignedStaff.name.charAt(0) || "/placeholder.svg"} />
                          <AvatarFallback>{booking.assignedStaff.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-green-900">{booking.assignedStaff.name}</p>
                          <p className="text-xs text-green-700">{booking.assignedStaff.role}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!booking.assignedStaff && (
                    <>
                      <div className="space-y-2">
                        <Label>Chọn nhân viên phụ trách</Label>
                        {loadingStaff ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                            <span className="ml-2 text-sm text-gray-600">Đang tải danh sách nhân viên...</span>
                          </div>
                        ) : staff.length === 0 ? (
                          <div className="text-center py-4 px-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-700 mb-1">Không có nhân viên khả dụng</p>
                          </div>
                        ) : (
                          <Select value={selectedStaff} onValueChange={setSelectedStaff} disabled={staff.length === 0}>
                            <SelectTrigger>
                              <SelectValue placeholder={staff.length === 0 ? "Không có nhân viên khả dụng" : "Chọn nhân viên"} />
                            </SelectTrigger>
                            <SelectContent>
                              {staff
                                .filter((s) => s.isAvailable)
                                .map((staffMember) => (
                                  <SelectItem key={staffMember.id} value={staffMember.id}>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-4 h-4">
                                        <AvatarImage src={staffMember.name.charAt(0) || "/placeholder.svg"} />
                                        <AvatarFallback className="text-xs">{staffMember.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span>{staffMember.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {staffMember.role}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <Button
                        onClick={handleStaffAssignment}
                        disabled={!selectedStaff || loadingStaff || staff.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        {loadingStaff ? 'Đang tải...' : staff.length === 0 ? 'Không có STAFF' : 'Gán nhân viên STAFF'}
                      </Button>
                    </>
                  )}
                  
                  {booking.assignedStaff && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-2">Nhân viên đã được gán cho booking này</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBooking(prev => prev ? {...prev, assignedStaff: undefined} : null);
                          setSelectedStaff("");
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Đổi nhân viên
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Lịch sử booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking?.timeline?.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(event.date)}</p>
                      </div>
                    </div>
                  ))}

                  {booking?.checkInDate && (
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Khách đã Check-In</p>
                        <p className="text-sm text-gray-500">{formatDateTime(booking.checkInDate)}</p>
                      </div>
                    </div>
                  )}
                  {booking?.checkOutDate && (
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Khách đã Check-Out</p>
                        <p className="text-sm text-gray-500">{formatDateTime(booking.checkOutDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-green-600" />
                  Ghi chú quản trị
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Ghi chú nội bộ</Label>
                  {booking.internalNotes && booking.internalNotes.trim() !== "" && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Lưu ý</h4>
                      <p className="text-red-700">{booking.internalNotes}</p>
                    </div>
                  )}
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Thêm ghi chú cho nhân viên khác..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button onClick={handleSaveNotes} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu ghi chú
                </Button>
                {notif && (
                  <div className="z-50 fixed top-10 right-20 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
                    {notif}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
