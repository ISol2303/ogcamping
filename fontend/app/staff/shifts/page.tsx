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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
  UserCheck,
  CalendarCheck,
  AlertCircle,
  RefreshCw,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// API Types
interface StaffShift {
  id: number
  shiftDate: string
  startTime: string
  endTime: string
  status: 'REGISTERED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  location?: string
  role?: string
  assignments?: Array<{
    userId: number
    userName: string
    role: string
  }>
}

// API Response Interfaces
interface BookingService {
  id: number
  serviceId: number
  comboId?: number
  euipmentId?: number
  bookingId: number
  type: string
  numberOfPeople: number
  checkInDate?: string
  checkOutDate?: string
  name: string
  quantity: number
  price: number
  total: number
}

interface Customer {
  id: number
  name?: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  address?: string
  userId: number
}

interface User {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
  phone: string
  department?: string
  joinDate?: string
  status: string
  agreeMarketing: boolean
  address?: string
  createdAt: string
}

interface StaffBooking {
  id: number
  customerId: number
  services: BookingService[]
  combos: any[]
  equipments: any[]
  checkInDate: string
  checkOutDate: string
  bookingDate: string
  numberOfPeople: number
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  payment?: any
  note?: string
  staff?: any
  internalNotes?: string
  totalPrice: number
  // Extended fields for display
  customer?: Customer
  user?: User
}

// API Service Functions
const API_BASE_URL = "http://localhost:8080/apis/v1/staffs" // Thử URL đơn giản hơn

const staffAPI = {
  // Get staff's own shifts
  getMyShifts: async (): Promise<StaffShift[]> => {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/me/shifts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw new Error('Failed to fetch my shifts')
    return response.json()
  },

  // Get staff's assigned bookings with customer details
  getMyBookings: async (): Promise<StaffBooking[]> => {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/me/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw new Error('Failed to fetch my bookings')
    const bookings: StaffBooking[] = await response.json()
    
    // Fetch customer details for each booking
    const bookingsWithCustomers = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Try to get customer details
          const customerResponse = await fetch(`http://localhost:8080/apis/v1/customers/${booking.customerId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (customerResponse.ok) {
            const customer: Customer = await customerResponse.json()
            booking.customer = customer
            
            // If customer has userId, also fetch user details
            if (customer.userId) {
              try {
                const userResponse = await fetch(`http://localhost:8080/apis/v1/users/${customer.userId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                })
                if (userResponse.ok) {
                  const user: User = await userResponse.json()
                  booking.user = user
                }
              } catch (error) {
                console.error('Error fetching user details:', error)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching customer details:', error)
        }
        return booking
      })
    )
    
    return bookingsWithCustomers
  },

  // Register for a shift
  registerForShift: async (shiftId: number): Promise<void> => {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}/register`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    })
    if (!response.ok) throw new Error('Failed to register for shift')
  },

  // Accept a booking
  acceptBooking: async (bookingId: number): Promise<void> => {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/accept`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    })
    if (!response.ok) throw new Error('Failed to accept booking')
  },

  // Get available shifts (from admin endpoint for display)
  getAvailableShifts: async (): Promise<StaffShift[]> => {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch('http://localhost:8080/apis/v1/admin/shifts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw new Error('Failed to fetch available shifts')
    return response.json()
  },
}

export default function StaffDashboard() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("bookings")
  
  // State management
  const [myShifts, setMyShifts] = useState<StaffShift[]>([])
  const [myBookings, setMyBookings] = useState<StaffBooking[]>([])
  const [availableShifts, setAvailableShifts] = useState<StaffShift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<StaffBooking | null>(null)
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false)
  const [notes, setNotes] = useState("")

  // Filter states
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all")
  const [shiftStatusFilter, setShiftStatusFilter] = useState<string>("all")
  const [shiftDateFilter, setShiftDateFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Load data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const [shiftsData, bookingsData, availableShiftsData] = await Promise.all([
        staffAPI.getMyShifts(),
        staffAPI.getMyBookings(),
        staffAPI.getAvailableShifts(),
      ])
      
      setMyShifts(shiftsData)
      setMyBookings(bookingsData)
      setAvailableShifts(availableShiftsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await loadAllData()
    setIsRefreshing(false)
  }

  // Helper functions
  const isToday = (dateString: string): boolean => {
    const today = new Date()
    const date = new Date(dateString)
    return today.toDateString() === date.toDateString()
  }

  // Helper functions for booking data
  const getCustomerName = (booking: StaffBooking): string => {
    if (booking.user?.name) return booking.user.name
    if (booking.customer?.firstName && booking.customer?.lastName) {
      return `${booking.customer.firstName} ${booking.customer.lastName}`
    }
    if (booking.customer?.name) return booking.customer.name
    return 'Chưa có tên'
  }

  const getCustomerPhone = (booking: StaffBooking): string => {
    return booking.user?.phone || booking.customer?.phone || 'Chưa có SĐT'
  }

  const getCustomerEmail = (booking: StaffBooking): string => {
    return booking.user?.email || booking.customer?.email || 'Chưa có email'
  }

  const getServiceNames = (booking: StaffBooking): string => {
    const items: string[] = []
    
    // Add services
    if (booking.services && booking.services.length > 0) {
      const serviceNames = booking.services.map(service => service.name)
      items.push(...serviceNames)
    }
    
    // Add combos
    if (booking.combos && booking.combos.length > 0) {
      const comboNames = booking.combos.map(combo => `${combo.name} (Combo)`)
      items.push(...comboNames)
    }
    
    // Add equipments if any
    if (booking.equipments && booking.equipments.length > 0) {
      const equipmentNames = booking.equipments.map(equipment => `${equipment.name} (Thiết bị)`)
      items.push(...equipmentNames)
    }
    
    return items.length > 0 ? items.join(', ') : 'Chưa có dịch vụ'
  }

  // Enhanced function to render services with visual distinction
  const renderServiceItems = (booking: StaffBooking) => {
    const hasServices = booking.services && booking.services.length > 0
    const hasCombos = booking.combos && booking.combos.length > 0
    const hasEquipments = booking.equipments && booking.equipments.length > 0
    
    if (!hasServices && !hasCombos && !hasEquipments) {
      return <span className="text-gray-500 text-sm">Chưa có dịch vụ</span>
    }
    
    return (
      <div className="space-y-1">
        {hasServices && (
          <div className="flex flex-wrap gap-1">
            {booking.services!.map((service, index) => (
              <Badge key={`service-${index}`} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {service.name}
              </Badge>
            ))}
          </div>
        )}
        {hasCombos && (
          <div className="flex flex-wrap gap-1">
            {booking.combos!.map((combo, index) => (
              <Badge key={`combo-${index}`} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                {combo.name} (Combo)
              </Badge>
            ))}
          </div>
        )}
        {hasEquipments && (
          <div className="flex flex-wrap gap-1">
            {booking.equipments!.map((equipment, index) => (
              <Badge key={`equipment-${index}`} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                {equipment.name} (Thiết bị)
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  const getTotalAmount = (booking: StaffBooking): number => {
    if (booking.totalPrice > 0) return booking.totalPrice
    // Calculate from services if totalPrice is 0
    return booking.services?.reduce((total, service) => total + service.total, 0) || 0
  }

  // Helper function to format dates safely
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '*'
    
    try {
      const date = new Date(dateString)
      // Check if date is valid and not the Unix epoch
      if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
        return '*'
      }
      return date.toLocaleDateString('vi-VN')
    } catch (error) {
      return '*'
    }
  }

  const isThisWeek = (dateString: string): boolean => {
    const today = new Date()
    const date = new Date(dateString)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return date >= startOfWeek && date <= endOfWeek
  }

  // Calculate stats from real data
  const todayStats = [
    { 
      title: "Đơn hàng hôm nay", 
      value: myBookings.filter(b => isToday(b.bookingDate)).length.toString(), 
      icon: Calendar, 
      color: "text-blue-600" 
    },
    { 
      title: "Cần xử lý", 
      value: myBookings.filter(b => b.status === 'PENDING').length.toString(), 
      icon: Clock, 
      color: "text-yellow-600" 
    },
    { 
      title: "Đã hoàn thành", 
      value: myBookings.filter(b => b.status === 'COMPLETED').length.toString(), 
      icon: CheckCircle, 
      color: "text-green-600" 
    },
    { 
      title: "Ca trực tuần này", 
      value: myShifts.filter(s => isThisWeek(s.shiftDate)).length.toString(), 
      icon: UserCheck, 
      color: "text-purple-600" 
    },
  ]

  const formatTimeSlot = (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Handle shift registration
  const handleRegisterForShift = async (shiftId: number) => {
    try {
      await staffAPI.registerForShift(shiftId)
      await refreshData() // Refresh to get updated data
      alert('Đăng ký ca trực thành công!')
    } catch (error) {
      console.error('Error registering for shift:', error)
      alert('Có lỗi xảy ra khi đăng ký ca trực')
    }
  }

  // Handle booking acceptance
  const handleAcceptBooking = async (bookingId: number) => {
    try {
      await staffAPI.acceptBooking(bookingId)
      // Refresh data after accepting
      await loadAllData()
    } catch (error) {
      console.error("Error accepting booking:", error)
      alert('Có lỗi xảy ra khi chấp nhận đơn hàng')
    }
  }

  const handleCallCustomer = (booking: StaffBooking) => {
    const phoneNumber = getCustomerPhone(booking)
    if (phoneNumber && phoneNumber !== 'Chưa có SĐT') {
      // Remove any non-digit characters and format for tel: protocol
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      if (cleanPhone) {
        window.open(`tel:${cleanPhone}`, '_self')
      } else {
        alert('Số điện thoại không hợp lệ')
      }
    } else {
      alert('Khách hàng chưa có số điện thoại')
    }
  }

  // Filter functions
  const filteredBookings = myBookings.filter(booking => {
    const matchesStatus = bookingStatusFilter === "all" || booking.status === bookingStatusFilter
    const matchesSearch = searchTerm === "" || 
      getCustomerName(booking).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getServiceNames(booking).toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const isPastShift = (dateString: string, endTime: string) => {
    const shiftEndDateTime = new Date(`${dateString}T${endTime}`)
    return shiftEndDateTime < new Date()
  }

  const isCurrentShift = (dateString: string, startTime: string, endTime: string) => {
    const now = new Date()
    const shiftStartDateTime = new Date(`${dateString}T${startTime}`)
    const shiftEndDateTime = new Date(`${dateString}T${endTime}`)
    return now >= shiftStartDateTime && now <= shiftEndDateTime
  }

  const isFutureShift = (dateString: string, startTime: string) => {
    const now = new Date()
    const shiftStartDateTime = new Date(`${dateString}T${startTime}`)
    return shiftStartDateTime > now
  }

  // Function to get the appropriate status for a shift based on current time
  const getShiftStatus = (shift: StaffShift) => {
    if (isCurrentShift(shift.shiftDate, shift.startTime, shift.endTime)) {
      return 'IN_PROGRESS'
    }
    return shift.status
  }

  const filteredMyShifts = myShifts.filter(shift => {
    // Status filter
    const matchesStatus = shiftStatusFilter === "all" || shift.status === shiftStatusFilter
    
    // Date filter
    let matchesDate = true
    if (shiftDateFilter === "today") {
      matchesDate = isToday(shift.shiftDate)
    } else if (shiftDateFilter === "thisWeek") {
      matchesDate = isThisWeek(shift.shiftDate)
    } else if (shiftDateFilter === "upcoming") {
      matchesDate = !isPastShift(shift.shiftDate, shift.endTime)
    }
    
    // Always show shifts (both past and future) - visual distinction handled in rendering
    return matchesStatus && matchesDate
  })

  // Get available shifts that staff can register for
  const availableShiftsForRegistration = availableShifts.filter(shift => {
    // Don't show shifts that staff is already registered for
    const isAlreadyRegistered = myShifts.some(myShift => myShift.id === shift.id)
    // Don't show past shifts
    const isPast = new Date(`${shift.shiftDate}T${shift.endTime}`) < new Date()
    return !isAlreadyRegistered && !isPast
  })

  // Badge functions for API data
  const getBookingStatusBadge = (status: StaffBooking['status']) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-purple-100 text-purple-800">Đang thực hiện</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }


  const getShiftStatusBadge = (status: StaffShift['status']) => {
    switch (status) {
      case "REGISTERED":
        return <Badge className="bg-yellow-100 text-yellow-800">Được đăng ký</Badge>
      case "APPROVED":
        return <Badge className="bg-blue-100 text-blue-800">Đã duyệt</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-purple-100 text-purple-800">Đang trực</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch làm việc</h1>
            <p className="text-gray-600">Quản lý đơn hàng và ca trực của bạn</p>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
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
          <TabsList className="grid w-full lg:w-auto grid-cols-3">
            <TabsTrigger value="bookings">Đơn hàng</TabsTrigger>
            <TabsTrigger value="shifts">Ca trực của tôi</TabsTrigger>
            <TabsTrigger value="available-shifts">Ca trực có sẵn</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đơn hàng được phân công</CardTitle>
                    <CardDescription>Danh sách đơn hàng được giao cho bạn xử lý</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                        <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                        <SelectItem value="IN_PROGRESS">Đang thực hiện</SelectItem>
                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Tìm kiếm khách hàng, dịch vụ..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Không có đơn hàng nào được phân công</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Dịch vụ</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">#{booking.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{getCustomerName(booking)}</p>
                              <p className="text-sm text-gray-600">{getCustomerPhone(booking)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {renderServiceItems(booking)}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                          <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setIsBookingDetailOpen(true)
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {booking.status === 'PENDING' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleAcceptBooking(booking.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCallCustomer(booking)}
                                className="text-green-600 hover:text-green-700"
                                title={`Gọi ${getCustomerPhone(booking)}`}
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng đơn hàng:</span>
                    <span className="font-medium">{myBookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Chờ xử lý:</span>
                    <span className="font-medium text-yellow-600">{myBookings.filter(b => b.status === 'PENDING').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hoàn thành:</span>
                    <span className="font-medium text-green-600">{myBookings.filter(b => b.status === 'COMPLETED').length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shifts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ca trực của tôi</CardTitle>
                    <CardDescription>Các ca trực đã đăng ký</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Select value={shiftDateFilter} onValueChange={setShiftDateFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Thời gian" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="today">Hôm nay</SelectItem>
                        <SelectItem value="thisWeek">Tuần này</SelectItem>
                        <SelectItem value="upcoming">Sắp tới</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={shiftStatusFilter} onValueChange={setShiftStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="REGISTERED">Đã đăng ký</SelectItem>
                        <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                        <SelectItem value="IN_PROGRESS">Đang trực</SelectItem>
                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMyShifts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Bạn chưa đăng ký ca trực nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMyShifts.map((shift) => {
                      const isPast = isPastShift(shift.shiftDate, shift.endTime)
                      const isCurrent = isCurrentShift(shift.shiftDate, shift.startTime, shift.endTime)
                      const isFuture = isFutureShift(shift.shiftDate, shift.startTime)
                      const currentStatus = getShiftStatus(shift)
                      
                      // Determine background styling
                      let backgroundClass = ''
                      if (isPast) {
                        backgroundClass = 'bg-gray-50 border-gray-200 opacity-60'
                      } else if (isCurrent) {
                        backgroundClass = 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      } else if (isFuture) {
                        backgroundClass = 'bg-green-50 border-green-200 hover:bg-green-100'
                      } else {
                        backgroundClass = 'hover:bg-gray-50 border-gray-300'
                      }
                      
                      return (
                        <div 
                          key={shift.id} 
                          className={`border rounded-lg p-4 transition-colors relative ${backgroundClass}`}
                        >
                          {isPast && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-500">
                                Đã qua
                              </Badge>
                            </div>
                          )}
                          {isCurrent && (
                            <div className="absolute top-2 right-2">
                              <Badge className="text-xs bg-blue-600 text-white">
                                Đang trực
                              </Badge>
                            </div>
                          )}
                          {isFuture && (
                            <div className="absolute top-2 right-2">
                              <Badge className="text-xs bg-green-600 text-white">
                                Sắp tới
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className={`font-medium ${
                                isPast ? 'text-gray-500' : 
                                isCurrent ? 'text-blue-900' :
                                isFuture ? 'text-green-900' : 'text-gray-900'
                              }`}>
                                {new Date(shift.shiftDate).toLocaleDateString('vi-VN')}
                                {isPast && <span className="ml-2 text-xs text-gray-400">(Đã qua)</span>}
                                {isCurrent && <span className="ml-2 text-xs text-blue-600">(Đang trực)</span>}
                              </p>
                              <p className={`text-sm ${
                                isPast ? 'text-gray-400' : 
                                isCurrent ? 'text-blue-700' :
                                isFuture ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {formatTimeSlot(shift.startTime, shift.endTime)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <p className={`text-sm ${
                              isPast ? 'text-gray-400' : 
                              isCurrent ? 'text-blue-600' :
                              isFuture ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {shift.location || ''}
                            </p>
                            <p className={`text-sm font-medium ${
                              isPast ? 'text-gray-400' : 
                              isCurrent ? 'text-blue-700' :
                              isFuture ? 'text-green-700' : 'text-blue-600'
                            }`}>
                              {shift.role || 'Nhân viên'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="available-shifts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ca trực có sẵn</CardTitle>
                <CardDescription>Đăng ký ca trực phù hợp với lịch của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                {availableShiftsForRegistration.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Không có ca trực nào khả dụng để đăng ký</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableShiftsForRegistration.map((shift) => (
                      <div key={shift.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(shift.shiftDate).toLocaleDateString('vi-VN')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatTimeSlot(shift.startTime, shift.endTime)}
                            </p>
                          </div>
                          {getShiftStatusBadge(shift.status)}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-gray-600">{shift.location || 'Chưa xác định địa điểm'}</p>
                          <p className="text-sm text-gray-600">
                            {shift.assignments?.length || 0} người đã đăng ký
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleRegisterForShift(shift.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Đăng ký ca này
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Detail Dialog */}
        <Dialog open={isBookingDetailOpen} onOpenChange={setIsBookingDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng #{selectedBooking?.id}</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về đơn hàng được phân công
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Tên:</span> {getCustomerName(selectedBooking)}</p>
                      <p><span className="font-medium">Điện thoại:</span> {getCustomerPhone(selectedBooking)}</p>
                      <p><span className="font-medium">Email:</span> {getCustomerEmail(selectedBooking)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thông tin đặt chỗ</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Dịch vụ:</span> {getServiceNames(selectedBooking)}</p>
                      <p><span className="font-medium">Ngày đặt:</span> {formatDate(selectedBooking.bookingDate)}</p>
                      <p><span className="font-medium">Check-in:</span> {formatDate(selectedBooking.checkInDate)}</p>
                      <p><span className="font-medium">Check-out:</span> {formatDate(selectedBooking.checkOutDate)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Chi tiết đơn hàng</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Tổng tiền:</span>
                      <span className="font-medium">{formatCurrency(getTotalAmount(selectedBooking))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trạng thái:</span>
                      {getBookingStatusBadge(selectedBooking.status)}
                    </div>
                    <div className="flex justify-between">
                      <span>Số người:</span>
                      <span className="font-medium">{selectedBooking.numberOfPeople}</span>
                    </div>
                  </div>
                </div>

                {selectedBooking.note && (
                  <div>
                    <h4 className="font-medium mb-2">Ghi chú</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedBooking.note}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {selectedBooking.status === 'PENDING' && (
                    <Button 
                      onClick={() => {
                        handleAcceptBooking(selectedBooking.id)
                        setIsBookingDetailOpen(false)
                      }}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Chấp nhận đơn hàng
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBookingDetailOpen(false)}
                    className="flex-1"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
