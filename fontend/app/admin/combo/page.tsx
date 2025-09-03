"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tent,
  Star,
  Package,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Download,
  Bell,
  Settings,
  LogOut,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Utensils,
  Wrench,
  Briefcase,
} from "lucide-react"
import Link from "next/link"

interface ComboItem {
  id: number
  name: string
  type: string
  price: number
  quantity?: number
  included: boolean
}

interface Combo {
  id: number
  name: string
  description: string
  price: number
  originalPrice: number
  discount: number
  duration: string
  maxPeople: number
  rating: number
  reviewCount: number
  image: string
  active: boolean
  items: { serviceId: number; serviceName: string; quantity: number }[];
  equipment: string[];
  foods: string[];
  highlights: string[]
  tags: string[]
  location: string
  bookingCount: number
  createdAt: string
  updatedAt: string
}

export default function ComboManagement() {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null)

  // Fetch combos from API
  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    try {
      setLoading(true)

      const response = await fetch("http://localhost:8080/apis/v1/combos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // ✅ Nếu API Spring Boot trả về trực tiếp list combo
      setCombos(data)

      // ✅ Nếu API trả về dạng { success, data, message }
      if (Array.isArray(data)) {
        setCombos(data)
      } else if (data && data.data) {
        setCombos(data.data)
      } else {
        console.warn("Unexpected API response:", data)
      }
    } catch (error) {
      console.error("Error fetching combos:", error)
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteCombo = async (combo: Combo) => {
    try {
      const response = await fetch(`/api/combos?id=${combo.id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setCombos(combos.filter((c) => c.id !== combo.id))
        setDeleteDialogOpen(false)
        setSelectedCombo(null)
      }
    } catch (error) {
      console.error("Error deleting combo:", error)
    }
  }

  // Hàm chuẩn hóa bỏ dấu tiếng Việt
  const normalizeText = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .toLowerCase()

  const filteredCombos = combos.filter((combo) => {
    const search = normalizeText(searchTerm)

    const matchesSearch =
      normalizeText(combo.name).includes(search) ||
      normalizeText(combo.description).includes(search) ||
      normalizeText(combo.location).includes(search)

    const matchesStatus =
      statusFilter === "all" ||
      combo.active === (statusFilter === "true")

    const matchesLocation =
      locationFilter === "all" ||
      normalizeText(combo.location).includes(normalizeText(locationFilter))

    return matchesSearch && matchesStatus && matchesLocation
  })


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const getStatusBadge = (active: boolean) => {
    switch (active) {
      case true:
        return <Badge className="bg-green-100 text-green-800 border-0">Hoạt động</Badge>
      case false:
        return <Badge className="bg-gray-100 text-gray-800 border-0">Tạm dừng</Badge>
      default:
        return (
          <Badge variant="secondary" className="border-0">
            Không xác định
          </Badge>
        )
    }
  }

  const getItemCounts = (combo: Combo) => {
    // Đếm số dịch vụ (tính theo số item, không phải số lượng quantity)
    const serviceCount = combo.items?.length || 0;

    // Đếm số thiết bị
    const equipmentCount = combo.equipment?.length || 0;

    // Đếm số món ăn
    const foodCount = combo.foods?.length || 0;

    return { serviceCount, equipmentCount, foodCount };
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu combo...</p>
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
            <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại Admin</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link href="/" className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">OG Camping Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Settings className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarImage src="/admin-avatar.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Combo</h1>
          <p className="text-gray-600">Quản lý các gói combo dịch vụ, thiết bị và đồ ăn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng Combo</p>
                  <p className="text-3xl font-bold text-gray-900">{combos.length}</p>
                  <p className="text-sm text-green-600">+2 combo mới tuần này</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Combo Hoạt động</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {combos.filter((c) => c.active === true).length}
                  </p>
                  <p className="text-sm text-green-600">Đang bán</p>
                </div>
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng Booking</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {combos.reduce((sum, combo) => sum + (combo.bookingCount ?? 0), 0)}

                  </p>
                  <p className="text-sm text-green-600">Từ combo</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doanh thu Combo</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(
                      combos.reduce(
                        (sum, combo) => sum + (Number(combo.price) || 0) * (Number(combo.bookingCount) || 0),
                        0
                      )
                    )
                    }
                  </p>
                  <p className="text-sm text-green-600">Tháng này</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách Combo</CardTitle>
                <CardDescription>Quản lý tất cả các gói combo dịch vụ</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/combo/create">
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Combo mới
                  </Button>
                </Link>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm combo theo tên, mô tả hoặc địa điểm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-green-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
                  <SelectValue placeholder="Địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả địa điểm</SelectItem>
                  <SelectItem value="sapa">Sapa</SelectItem>
                  <SelectItem value="dalat">Đà Lạt</SelectItem>
                  <SelectItem value="ninh binh">Ninh Bình</SelectItem>
                  <SelectItem value="quang ninh">Quảng Ninh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Combo</TableHead>
                    <TableHead className="font-semibold">Địa điểm & Thời gian</TableHead>
                    <TableHead className="font-semibold">Giá & Giảm giá</TableHead>
                    <TableHead className="font-semibold">Nội dung</TableHead>
                    <TableHead className="font-semibold">Đánh giá</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCombos.map((combo) => {
                    const { serviceCount, equipmentCount, foodCount } = getItemCounts(combo)
                    return (
                      <TableRow key={combo.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="space-y-2">
                            <div className="font-medium text-gray-900 line-clamp-1">{combo.name}</div>
                            <div className="text-sm text-gray-600 line-clamp-2">{combo.description}</div>

                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {/* <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                              <MapPin className="w-3 h-3" />
                              {combo.location}
                            </div> */}
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Clock className="w-3 h-3" />
                              {combo.duration}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Users className="w-3 h-3" />
                              Tối đa {combo.maxPeople} người
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-bold text-green-600">{formatPrice(combo.price)}</div>
                            {combo.discount > 0 && (
                              <>
                                <div className="text-xs text-gray-500 line-through">
                                  {formatPrice(combo.originalPrice)}
                                </div>
                                <Badge className="bg-red-100 text-red-800 border-0 text-xs">-{combo.discount}%</Badge>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Briefcase className="w-3 h-3 text-blue-600" />
                              <span>{serviceCount} dịch vụ</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Wrench className="w-3 h-3 text-purple-600" />
                              <span>{equipmentCount} thiết bị</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Utensils className="w-3 h-3 text-orange-600" />
                              <span>{foodCount} món ăn</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{combo.rating}</span>
                            </div>
                            <div className="text-xs text-gray-600">{combo.reviewCount} đánh giá</div>
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(combo.active)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/admin/combo/${combo.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* <Link href={`/admin/combo/${combo.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                              title="Xóa"
                              onClick={() => {
                                setSelectedCombo(combo)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <div>
                Hiển thị {filteredCombos.length} trong tổng số {combos.length} combo
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa combo</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa combo "{selectedCombo?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => selectedCombo && handleDeleteCombo(selectedCombo)}>
              Xóa combo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
