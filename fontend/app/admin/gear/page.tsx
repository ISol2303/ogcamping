"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Loader2,
  Image as ImageIcon
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

interface Gear {
  id: number
  name: string
  category: string
  area: string
  description: string
  quantityInStock: number
  image: string
  available: number
  pricePerDay: number
  total: number
  status: string
  createdAt: string
}

// Area enum values
const AREA_OPTIONS = [
  { value: "TRONG_LEU", label: "Trong lều" },
  { value: "NGOAI_LEU", label: "Ngoài lều" },
  { value: "BEP", label: "Bếp" }
]

// Status enum values
const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Có sẵn" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" }
]

export default function AdminGearPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [gears, setGears] = useState<Gear[]>([])
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGear, setEditingGear] = useState<Gear | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    area: "",
    description: "",
    quantityInStock: 0,
    image: "",
    available: 0,
    pricePerDay: 0,
    status: "AVAILABLE"
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/apis/v1/categories")
      const data = await response.json()
      
      console.log("Categories response:", data) // Debug log
      
      // Kiểm tra nếu data là array trực tiếp
      if (Array.isArray(data)) {
        setCategories(data)
        console.log("Categories set (array):", data) // Debug log
      } else if (data.status === 200 && data.data) {
        setCategories(data.data)
        console.log("Categories set (object):", data.data) // Debug log
      } else {
        console.error("Unexpected categories format:", data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Fetch gears
  const fetchGears = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/apis/v1/gears")
      const data = await response.json()
      
      console.log("Gears response:", data) // Debug log
      console.log("Response status:", response.status) // Debug log
      
      // Kiểm tra nếu data là array trực tiếp
      if (Array.isArray(data)) {
        setGears(data)
        console.log("Gears set (array):", data) // Debug log
      } else if (data.status === 200 && data.data) {
        setGears(data.data)
        console.log("Gears set (object):", data.data) // Debug log
      } else {
        console.error("Unexpected data format:", data)
        setNotificationModal({
          isOpen: true,
          type: 'error',
          title: 'Lỗi!',
          message: data.message || "Lỗi khi tải danh sách sản phẩm",
          onConfirm: () => {}
        })
      }
    } catch (error) {
      console.error("Error fetching gears:", error)
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi kết nối!',
        message: "Không thể kết nối đến server. Vui lòng thử lại.",
        onConfirm: () => {}
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchGears()
  }, [])

  // Handle create gear
  const handleCreate = async () => {
    console.log("handleCreate called", { formData, imageFile })
    
    if (!formData.name.trim()) {
      setNotificationModal({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu thông tin!',
        message: "Vui lòng nhập tên sản phẩm",
        onConfirm: () => {}
      })
      return
    }

    if (!formData.category.trim()) {
      setNotificationModal({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu thông tin!',
        message: "Vui lòng chọn danh mục",
        onConfirm: () => {}
      })
      return
    }

    if (!formData.area.trim()) {
      setNotificationModal({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu thông tin!',
        message: "Vui lòng chọn khu vực",
        onConfirm: () => {}
      })
      return
    }

    // Tạm thời bỏ validation ảnh để test
    // if (!imageFile) {
    //   toast.error("Vui lòng chọn ảnh sản phẩm")
    //   return
    // }

    try {
      setSubmitting(true)
      console.log("Creating gear with data:", formData)
      
      const form = new FormData()
      form.append("name", formData.name)
      form.append("category", formData.category)
      form.append("area", formData.area)
      form.append("description", formData.description || "")
      form.append("quantity_in_stock", formData.quantityInStock.toString())
      form.append("available", formData.available.toString())
      form.append("price_per_day", formData.pricePerDay.toString())
      form.append("status", formData.status)
      
      // Chỉ gửi ảnh nếu có file được chọn
      if (imageFile) {
        form.append("image", imageFile)
      }

      console.log("Sending request to:", "http://localhost:8080/apis/v1/gears")
      console.log("Form data entries:")
      const formEntries = Array.from(form.entries())
      for (let [key, value] of formEntries) {
        console.log(key, value)
      }

      const response = await fetch("http://localhost:8080/apis/v1/gears", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: form
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)
      
      if (response.ok) {
        setNotificationModal({
          isOpen: true,
          type: 'success',
          title: 'Thành công!',
          message: "Tạo sản phẩm thành công",
          onConfirm: () => {
            setIsCreateDialogOpen(false)
            setFormData({
              name: "",
              category: "",
              area: "",
              description: "",
              quantityInStock: 0,
              image: "",
              available: 0,
              pricePerDay: 0,
              status: "AVAILABLE"
            })
            setImageFile(null)
            fetchGears()
          }
        })
      } else {
        setNotificationModal({
          isOpen: true,
          type: 'error',
          title: 'Lỗi!',
          message: data.message || "Lỗi khi tạo sản phẩm",
          onConfirm: () => {}
        })
      }
    } catch (error) {
      console.error("Error creating gear:", error)
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi kết nối!',
        message: "Không thể kết nối đến server. Vui lòng thử lại.",
        onConfirm: () => {}
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle update gear
  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      setNotificationModal({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu thông tin!',
        message: "Vui lòng nhập tên sản phẩm",
        onConfirm: () => {}
      })
      return
    }

    if (!editingGear) return

    try {
      setSubmitting(true)
      const form = new FormData()
      form.append("name", formData.name)
      form.append("category", formData.category)
      form.append("area", formData.area)
      form.append("description", formData.description)
      form.append("quantity_in_stock", formData.quantityInStock.toString())
      form.append("available", formData.available.toString())
      form.append("price_per_day", formData.pricePerDay.toString())
      form.append("status", formData.status)
      
      // Chỉ gửi ảnh nếu có file mới được chọn
      if (imageFile) {
        form.append("image", imageFile)
      }

      const response = await fetch(`http://localhost:8080/apis/v1/gears/${editingGear.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: form
      })

      const data = await response.json()
      
      if (response.ok) {
        setNotificationModal({
          isOpen: true,
          type: 'success',
          title: 'Thành công!',
          message: "Cập nhật sản phẩm thành công",
          onConfirm: () => {
            setIsEditDialogOpen(false)
            setEditingGear(null)
            setFormData({
              name: "",
              category: "",
              area: "",
              description: "",
              quantityInStock: 0,
              image: "",
              available: 0,
              pricePerDay: 0,
              status: "AVAILABLE"
            })
            setImageFile(null)
            fetchGears()
          }
        })
      } else {
        setNotificationModal({
          isOpen: true,
          type: 'error',
          title: 'Lỗi!',
          message: data.message || "Lỗi khi cập nhật sản phẩm",
          onConfirm: () => {}
        })
      }
    } catch (error) {
      console.error("Error updating gear:", error)
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi kết nối!',
        message: "Không thể kết nối đến server. Vui lòng thử lại.",
        onConfirm: () => {}
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete gear
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/apis/v1/gears/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotificationModal({
          isOpen: true,
          type: 'success',
          title: 'Thành công!',
          message: "Xóa sản phẩm thành công",
          onConfirm: () => {
            fetchGears()
          }
        })
      } else {
        // Chỉ parse JSON nếu có content
        if (response.status !== 204) {
          const data = await response.json()
          setNotificationModal({
            isOpen: true,
            type: 'error',
            title: 'Lỗi!',
            message: data.message || "Lỗi khi xóa sản phẩm",
            onConfirm: () => {}
          })
        } else {
          setNotificationModal({
            isOpen: true,
            type: 'error',
            title: 'Lỗi!',
            message: "Lỗi khi xóa sản phẩm",
            onConfirm: () => {}
          })
        }
      }
    } catch (error) {
      console.error("Error deleting gear:", error)
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi kết nối!',
        message: "Không thể kết nối đến server. Vui lòng thử lại.",
        onConfirm: () => {}
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (gear: Gear) => {
    setEditingGear(gear)
    setFormData({
      name: gear.name,
      category: gear.category,
      area: gear.area,
      description: gear.description,
      quantityInStock: gear.quantityInStock,
      image: gear.image,
      available: gear.available,
      pricePerDay: gear.pricePerDay,
      status: gear.status
    })
    setImageFile(null) // Reset image file
    setIsEditDialogOpen(true)
  }

  // Filter gears
  const filteredGears = gears.filter(gear => {
    const matchesSearch = gear.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        gear.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || categoryFilter === "all" || gear.category === categoryFilter
    const matchesArea = !areaFilter || areaFilter === "all" || gear.area === areaFilter
    
    // Cập nhật logic filter status để xem xét số lượng có sẵn
    let matchesStatus = true
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "AVAILABLE") {
        // Nếu filter "Có sẵn", chỉ hiển thị sản phẩm có available > 0
        matchesStatus = gear.available > 0
      } else if (statusFilter === "OUT_OF_STOCK") {
        // Nếu filter "Hết hàng", hiển thị sản phẩm có available = 0
        matchesStatus = gear.available === 0
      } else {
        // Các filter khác giữ nguyên logic cũ
        matchesStatus = gear.status === statusFilter
      }
    }
    
    return matchesSearch && matchesCategory && matchesArea && matchesStatus
  })

  // Debug log
  console.log("Current gears state:", gears)
  console.log("Current categories state:", categories)
  console.log("Filtered gears:", filteredGears)

  // Get area label
  const getAreaLabel = (value: string) => {
    const option = AREA_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : value
  }

  // Get status label - tự động cập nhật dựa trên số lượng có sẵn
  const getStatusLabel = (gear: Gear) => {
    // Nếu số lượng có sẵn = 0, hiển thị "Hết hàng" bất kể status trong DB
    if (gear.available === 0) {
      return "Hết hàng"
    }
    // Nếu có số lượng, hiển thị theo status trong DB
    const option = STATUS_OPTIONS.find(opt => opt.value === gear.status)
    return option ? option.label : gear.status
  }

  // Get status badge variant - tự động cập nhật dựa trên số lượng có sẵn
  const getStatusBadgeVariant = (gear: Gear) => {
    // Nếu số lượng có sẵn = 0, hiển thị màu đỏ (destructive)
    if (gear.available === 0) {
      return "destructive"
    }
    // Nếu có số lượng, hiển thị theo status trong DB
    return gear.status === "AVAILABLE" ? "default" : "destructive"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-2">Quản lý các sản phẩm và thiết bị cắm trại</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
              <DialogDescription>
                Tạo một sản phẩm mới cho hệ thống
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tên sản phẩm *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Danh mục *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Khu vực *</label>
                  <Select
                    value={formData.area}
                    onValueChange={(value) => setFormData({ ...formData, area: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREA_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Số lượng tồn kho *</label>
                  <Input
                    type="number"
                    value={formData.quantityInStock}
                    onChange={(e) => setFormData({ ...formData, quantityInStock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Số lượng có sẵn</label>
                  <Input
                    type="number"
                    value={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Giá thuê/ngày (VNĐ) *</label>
                <Input
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Hình ảnh *</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    console.log("File input changed:", e.target.files)
                    const file = e.target.files?.[0]
                    if (file) {
                      console.log("File selected:", file.name, file.size, file.type)
                      setImageFile(file)
                    } else {
                      console.log("No file selected")
                      setImageFile(null)
                    }
                  }}
                />
                {imageFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Đã chọn: {imageFile.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Tạo
              </Button>
            </DialogFooter>
            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
              Debug: {JSON.stringify({ 
                name: formData.name, 
                category: formData.category, 
                area: formData.area, 
                hasImage: !!imageFile 
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gears.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Có sẵn</CardTitle>
            <Badge variant="outline" className="text-green-600">Hoạt động</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {gears.filter(g => g.available > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
            <Badge variant="destructive">Hết hàng</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {gears.filter(g => g.available === 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hiển thị</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredGears.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và lọc sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {AREA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gears Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <CardDescription>
            Quản lý tất cả các sản phẩm trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá/ngày</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGears.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không có sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGears.map((gear) => (
                    <TableRow key={gear.id}>
                      <TableCell className="font-medium">{gear.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {gear.image ? (
                            <img 
                              src={`http://localhost:8080${gear.image}`} 
                              alt={gear.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{gear.name}</div>
                            {gear.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {gear.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{gear.category}</TableCell>
                      <TableCell>{getAreaLabel(gear.area)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Tổng sản phẩm: {gear.quantityInStock}</div>
                          <div>Có sẵn: {gear.available}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {gear.pricePerDay.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(gear)}>
                          {getStatusLabel(gear)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(gear)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa sản phẩm "{gear.name}"? 
                                  Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(gear.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin sản phẩm
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tên sản phẩm *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Danh mục *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Khu vực *</label>
                <Select
                  value={formData.area}
                  onValueChange={(value) => setFormData({ ...formData, area: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả sản phẩm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Số lượng tồn kho *</label>
                <Input
                  type="number"
                  value={formData.quantityInStock}
                  onChange={(e) => setFormData({ ...formData, quantityInStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Số lượng có sẵn</label>
                <Input
                  type="number"
                  value={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Giá thuê/ngày (VNĐ) *</label>
              <Input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hình ảnh</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImageFile(file)
                  }
                }}
              />
              {imageFile && (
                <p className="text-sm text-gray-500 mt-1">
                  Đã chọn: {imageFile.name}
                </p>
              )}
              {editingGear?.image && !imageFile && (
                <p className="text-sm text-gray-500 mt-1">
                  Ảnh hiện tại: {editingGear.image}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      <Dialog open={notificationModal.isOpen} onOpenChange={(open) => {
        if (!open) {
          setNotificationModal(prev => ({ ...prev, isOpen: false }))
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              {notificationModal.type === 'success' && (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
              {notificationModal.type === 'error' && (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              {notificationModal.type === 'warning' && (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              )}
              {notificationModal.type === 'info' && (
                <Info className="h-6 w-6 text-blue-600" />
              )}
              <DialogTitle className="text-lg font-semibold">
                {notificationModal.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{notificationModal.message}</p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                notificationModal.onConfirm()
                setNotificationModal(prev => ({ ...prev, isOpen: false }))
              }}
              className={`w-full ${
                notificationModal.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                notificationModal.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                notificationModal.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
