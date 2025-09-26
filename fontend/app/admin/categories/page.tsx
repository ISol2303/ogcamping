"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

interface Category {
  id: number
  name: string
  description: string
}


export default function AdminCategoriesPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })
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
      setLoading(true)
      const response = await fetch("http://localhost:8080/apis/v1/categories")
      const data = await response.json()
      
      console.log("Categories response:", data) // Debug log
      
      if (data.status === 200) {
        setCategories(data.data)
        console.log("Categories set:", data.data) // Debug log
      } else {
        toast.error(data.message || "Lỗi khi tải danh sách danh mục")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Lỗi khi tải danh sách danh mục")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle create category
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("http://localhost:8080/apis/v1/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log("Create category response:", data) // Debug log
      console.log("Response status:", response.status) // Debug log
      console.log("Response ok:", response.ok) // Debug log
      
      if (data.status === 200 || data.status === 201) {
        setNotificationModal({
          isOpen: true,
          type: 'success',
          title: 'Thành công!',
          message: data.message || "Tạo danh mục thành công",
          onConfirm: () => {
            setIsCreateDialogOpen(false)
            setFormData({ name: "", description: "" })
            fetchCategories()
          }
        })
      } else {
        // Hiển thị lỗi chi tiết từ backend
        const errorMessage = data.message || data.error || "Lỗi khi tạo danh mục"
        setNotificationModal({
          isOpen: true,
          type: 'error',
          title: 'Lỗi!',
          message: errorMessage,
          onConfirm: () => {}
        })
        console.error("Category creation error:", data)
      }
    } catch (error) {
      console.error("Error creating category:", error)
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

  // Handle update category
  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục")
      return
    }

    if (!editingCategory) return

    try {
      setSubmitting(true)
      const response = await fetch(`http://localhost:8080/apis/v1/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log("Update category response:", data) // Debug log
      
      if (data.status === 200) {
        setNotificationModal({
          isOpen: true,
          type: 'success',
          title: 'Thành công!',
          message: data.message || "Cập nhật danh mục thành công",
          onConfirm: () => {
            setIsEditDialogOpen(false)
            setEditingCategory(null)
            setFormData({ name: "", description: "" })
            fetchCategories()
          }
        })
      } else {
        // Hiển thị lỗi chi tiết từ backend
        const errorMessage = data.message || data.error || "Lỗi khi cập nhật danh mục"
        setNotificationModal({
          isOpen: true,
          type: 'error',
          title: 'Lỗi!',
          message: errorMessage,
          onConfirm: () => {}
        })
        console.error("Category update error:", data)
      }
    } catch (error) {
      console.error("Error updating category:", error)
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

  // Handle delete category
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/apis/v1/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      const data = await response.json()
      console.log("Delete category response:", data) // Debug log
      
      if (data.status === 200) {
        setNotificationModal({
          isOpen: true,
          type: 'success',
          title: 'Thành công!',
          message: "Xóa danh mục thành công",
          onConfirm: () => {
            fetchCategories()
          }
        })
      } else if (data.status === 409) {
        // Hiển thị thông báo lỗi chi tiết khi không thể xóa vì có sản phẩm
        setNotificationModal({
          isOpen: true,
          type: 'warning',
          title: 'Không thể xóa!',
          message: data.message || "Không thể xóa danh mục có sản phẩm",
          onConfirm: () => {}
        })
      } else if (data.status === 404) {
        setNotificationModal({
          isOpen: true,
          type: 'error',
          title: 'Không tìm thấy!',
          message: "Danh mục không tồn tại",
          onConfirm: () => {}
        })
      } else {
        setNotificationModal({
          isOpen: true,
          type: 'error',
          title: 'Lỗi!',
          message: data.message || "Lỗi khi xóa danh mục",
          onConfirm: () => {}
        })
      }
    } catch (error) {
      console.error("Error deleting category:", error)
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
  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description
    })
    setIsEditDialogOpen(true)
  }

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600 mt-2">Quản lý các danh mục sản phẩm và dịch vụ</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
              <DialogDescription>
                Tạo một danh mục mới cho sản phẩm hoặc dịch vụ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tên danh mục *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả danh mục"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Tạo danh mục
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng danh mục</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hiển thị</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            <Badge variant="outline" className="text-green-600">Hoạt động</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
          <CardDescription>
            Quản lý tất cả các danh mục trong hệ thống
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
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Không có danh mục nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description || "Không có mô tả"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(category)}
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
                                <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa danh mục "{category.name}"? 
                                  <br /><br />
                                  <strong className="text-red-600">⚠️ Lưu ý:</strong> Nếu danh mục này đang có sản phẩm, 
                                  bạn sẽ không thể xóa được. Hãy di chuyển hoặc xóa tất cả sản phẩm trong danh mục này trước.
                                  <br /><br />
                                  Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Xóa danh mục
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tên danh mục *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên danh mục"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả danh mục"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
