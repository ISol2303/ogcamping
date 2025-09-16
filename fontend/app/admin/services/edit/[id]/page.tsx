"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tent, ArrowLeft, Save, Plus, X, MapPin, Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface ServiceFormData {
  name: string
  location: string
  duration: string
  capacity: string
  price: string
  description: string
  highlights: string[]
  included: string[]
  tags: string[]
  availability: string
  status: "active" | "inactive"
  image: string
}

export default function ServiceEditPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    location: "",
    duration: "",
    capacity: "",
    price: "",
    description: "",
    highlights: [""],
    included: [""],
    tags: [],
    availability: "",
    status: "active",
    image: "mountain",
  })

  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  const availableLocations = [
    "Sapa, Lào Cai",
    "Quy Nhon, Bình Định",
    "Ninh Bình",
    "Quảng Ninh",
    "Đà Lạt, Lâm Đồng",
    "Phú Quốc, Kiên Giang",
    "Cát Tiên, Đồng Nai",
    "Mộc Châu, Sơn La",
  ]

  const availableTags = [
    "Núi",
    "Biển",
    "Rừng",
    "Đảo",
    "Trekking",
    "Thư giãn",
    "Gia đình",
    "Sinh thái",
    "Khám phá",
    "Phổ biến",
    "Cao cấp",
    "Mạo hiểm",
  ]

  const imageOptions = [
    { value: "mountain", label: "Núi" },
    { value: "beach", label: "Biển" },
    { value: "forest", label: "Rừng" },
    { value: "island", label: "Đảo" },
    { value: "lake", label: "Hồ" },
    { value: "valley", label: "Thung lũng" },
  ]

  useEffect(() => {
    const loadServiceData = async () => {
      try {
        setInitialLoading(true)

        // Mock API call - In production: const response = await fetch(`/api/services/${serviceId}`)
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock service data based on ID
        const mockServices: Record<string, ServiceFormData> = {
          "1": {
            name: "Cắm trại núi cao Sapa",
            location: "Sapa, Lào Cai",
            duration: "2-3 ngày",
            capacity: "4-6 người",
            price: "2500000",
            description:
              "Trải nghiệm cắm trại tại vùng núi cao Sapa với cảnh quan tuyệt đẹp, không khí trong lành và văn hóa dân tộc độc đáo.",
            highlights: [
              "Ngắm bình minh trên đỉnh Fansipan",
              "Trekking qua ruộng bậc thang",
              "Giao lưu với người dân tộc địa phương",
              "Ăn uống đặc sản vùng cao",
            ],
            included: [
              "Lều cắm trại chuyên dụng",
              "Hướng dẫn viên địa phương",
              "3 bữa ăn/ngày",
              "Thiết bị cắm trại cơ bản",
              "Bảo hiểm du lịch",
            ],
            tags: ["Núi", "Trekking", "Phổ biến"],
            availability: "Còn 3 slot",
            status: "active",
            image: "mountain",
          },
          "2": {
            name: "Cắm trại bãi biển Quy Nhon",
            location: "Quy Nhon, Bình Định",
            duration: "1-2 ngày",
            capacity: "6-8 người",
            price: "1800000",
            description:
              "Trải nghiệm cắm trại bên bờ biển với hoạt động lặn ngắm san hô, câu cá và thưởng thức hải sản tươi sống.",
            highlights: [
              "Ngắm hoàng hôn trên biển",
              "Lặn ngắm san hô",
              "BBQ hải sản tươi sống",
              "Chèo kayak khám phá vịnh",
            ],
            included: [
              "Lều cắm trại chống nước",
              "Thiết bị lặn cơ bản",
              "BBQ và hải sản",
              "Kayak 2 người",
              "Hướng dẫn viên",
            ],
            tags: ["Biển", "Thư giãn", "Gia đình"],
            availability: "Còn 5 slot",
            status: "active",
            image: "beach",
          },
        }

        const serviceData = mockServices[serviceId]
        if (serviceData) {
          setFormData(serviceData)
        } else {
          setErrors({ load: "Không tìm thấy dịch vụ" })
        }
      } catch (error) {
        console.error("Error loading service:", error)
        setErrors({ load: "Có lỗi xảy ra khi tải dữ liệu dịch vụ" })
      } finally {
        setInitialLoading(false)
      }
    }

    if (serviceId) {
      loadServiceData()
    }
  }, [serviceId])

  // Track unsaved changes
  useEffect(() => {
    if (!initialLoading) {
      setIsUnsavedChanges(true)
    }
  }, [formData, initialLoading])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Tên dịch vụ là bắt buộc"
    if (!formData.location.trim()) newErrors.location = "Địa điểm là bắt buộc"
    if (!formData.duration.trim()) newErrors.duration = "Thời gian là bắt buộc"
    if (!formData.capacity.trim()) newErrors.capacity = "Sức chứa là bắt buộc"
    if (!formData.price.trim()) newErrors.price = "Giá là bắt buộc"
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) newErrors.price = "Giá phải là số dương"
    if (!formData.description.trim()) newErrors.description = "Mô tả là bắt buộc"
    if (formData.highlights.filter((h) => h.trim()).length === 0)
      newErrors.highlights = "Ít nhất một điểm nổi bật là bắt buộc"
    if (formData.included.filter((i) => i.trim()).length === 0)
      newErrors.included = "Ít nhất một dịch vụ bao gồm là bắt buộc"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Clean up form data
      const cleanedData = {
        ...formData,
        price: Number(formData.price),
        highlights: formData.highlights.filter((h) => h.trim()),
        included: formData.included.filter((i) => i.trim()),
      }

      console.log("Updating service:", serviceId, cleanedData)
      // In production: await fetch(`/api/services/${serviceId}`, { method: 'PUT', body: JSON.stringify(cleanedData) })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsUnsavedChanges(false)
      router.push("/admin?tab=services")
    } catch (error) {
      console.error("Error updating service:", error)
      setErrors({ submit: "Có lỗi xảy ra khi cập nhật dịch vụ. Vui lòng thử lại." })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (isUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      router.push("/admin?tab=services")
    }
  }

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ""],
    }))
  }

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }))
  }

  const updateHighlight = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => (i === index ? value : h)),
    }))
  }

  const addIncluded = () => {
    setFormData((prev) => ({
      ...prev,
      included: [...prev.included, ""],
    }))
  }

  const removeIncluded = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      included: prev.included.filter((_, i) => i !== index),
    }))
  }

  const updateIncluded = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      included: prev.included.map((item, i) => (i === index ? value : item)),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const formatPrice = (price: string) => {
    const numPrice = Number(price.replace(/\D/g, ""))
    return numPrice.toLocaleString("vi-VN")
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin dịch vụ...</p>
        </div>
      </div>
    )
  }

  if (errors.load) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải dịch vụ</h2>
          <p className="text-gray-600 mb-4">{errors.load}</p>
          <Button onClick={() => router.push("/admin?tab=services")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
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
              <Link href="/admin?tab=services" className="hover:text-green-600">
                Dịch vụ
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Chỉnh sửa dịch vụ #{serviceId}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="submit"
              form="service-form"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Cập nhật dịch vụ
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa dịch vụ</h1>
          <p className="text-gray-600">Cập nhật thông tin dịch vụ cắm trại "{formData.name}"</p>
        </div>

        <form id="service-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>Thông tin chính về dịch vụ cắm trại</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên dịch vụ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Cắm trại núi cao Sapa"
                    className={`border-gray-300 focus:border-green-500 ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Địa điểm <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger className={`border-gray-300 ${errors.location ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Chọn địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Thời gian <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="VD: 2-3 ngày"
                    className={`border-gray-300 focus:border-green-500 ${errors.duration ? "border-red-500" : ""}`}
                  />
                  {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">
                    Sức chứa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                    placeholder="VD: 4-6 người"
                    className={`border-gray-300 focus:border-green-500 ${errors.capacity ? "border-red-500" : ""}`}
                  />
                  {errors.capacity && <p className="text-sm text-red-600">{errors.capacity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">
                    Giá (VNĐ) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setFormData((prev) => ({ ...prev, price: value }))
                      }}
                      placeholder="2500000"
                      className={`border-gray-300 focus:border-green-500 ${errors.price ? "border-red-500" : ""}`}
                    />
                    {formData.price && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        {formatPrice(formData.price)} đ
                      </div>
                    )}
                  </div>
                  {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="availability">Tình trạng</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData((prev) => ({ ...prev, availability: e.target.value }))}
                    placeholder="VD: Còn 5 slot"
                    className="border-gray-300 focus:border-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Hình ảnh đại diện</Label>
                  <Select
                    value={formData.image}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, image: value }))}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Chọn loại hình ảnh" />
                    </SelectTrigger>
                    <SelectContent>
                      {imageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="status">Trạng thái dịch vụ</Label>
                  <p className="text-sm text-gray-600">Dịch vụ có được hiển thị và cho phép đặt không</p>
                </div>
                <Switch
                  id="status"
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, status: checked ? "active" : "inactive" }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-green-600" />
                Mô tả dịch vụ
              </CardTitle>
              <CardDescription>Thông tin chi tiết về dịch vụ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về dịch vụ cắm trại, trải nghiệm và những gì khách hàng sẽ được..."
                  rows={4}
                  className={`border-gray-300 focus:border-green-500 resize-none ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Điểm nổi bật
              </CardTitle>
              <CardDescription>Những điểm thu hút chính của dịch vụ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    placeholder="VD: Ngắm bình minh trên đỉnh núi"
                    className="border-gray-300 focus:border-green-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeHighlight(index)}
                    disabled={formData.highlights.length === 1}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addHighlight}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm điểm nổi bật
              </Button>
              {errors.highlights && <p className="text-sm text-red-600">{errors.highlights}</p>}
            </CardContent>
          </Card>

          {/* Included Services */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Dịch vụ bao gồm
              </CardTitle>
              <CardDescription>Những gì được bao gồm trong gói dịch vụ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.included.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateIncluded(index, e.target.value)}
                    placeholder="VD: Lều cắm trại chuyên dụng"
                    className="border-gray-300 focus:border-green-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIncluded(index)}
                    disabled={formData.included.length === 1}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addIncluded}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm dịch vụ bao gồm
              </Button>
              {errors.included && <p className="text-sm text-red-600">{errors.included}</p>}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Thẻ phân loại giúp khách hàng tìm kiếm dễ dàng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-0 cursor-pointer hover:bg-green-200"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Select value={newTag} onValueChange={setNewTag}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter((tag) => !formData.tags.includes(tag))
                      .map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!newTag || formData.tags.includes(newTag)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {errors.submit && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p>{errors.submit}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Unsaved Changes Dialog */}
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Có thay đổi chưa được lưu</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Ở lại</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setIsUnsavedChanges(false)
                  router.push("/admin?tab=services")
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Rời khỏi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
