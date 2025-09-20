"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Tent,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Briefcase,
  Wrench,
  Utensils,
  DollarSign,
  Tag,
  Lightbulb,
  ChevronsUpDown,
  Check,
  ImageIcon,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { Service } from "@/app/api/serviceApi"


interface ComboItem {
  id: number
  quantity: number
  type: string
  name?: string   // thêm để hiển thị
  included: boolean
  price: number
}
interface ComboServiceForm {
  serviceId: number
  serviceName: string
  quantity: number
  price: number
  type: "SERVICE"
}

interface ComboFormData {
  name: string
  description: string
  price: number
  originalPrice: number
  duration: string
  maxPeople: number
  minDays: number
  maxDays: number
  active: boolean
  location: string
  services: ComboServiceForm[]
  equipment: ComboItem[]
  foods: ComboItem[]
  highlights: string[]
  tags: string[]
  imageFile?: File | null
}
import { Command, CommandGroup, CommandItem, CommandInput, CommandList, CommandEmpty } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
export default function CreateComboPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<ComboFormData>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    maxPeople: 1,
    minDays: 1,
    maxDays: 1,
    active: true,
    duration: "",
    location: "",
    services: [],
    equipment: [],
    foods: [],
    highlights: [],
    tags: [],
  })
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }
  const uniqueLocations = Array.from(
    new Set(availableServices.map((s) => s.location))
  )
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const res = await fetch("http://localhost:8080/apis/v1/services")
        if (!res.ok) throw new Error("Failed to fetch services")
        const data = await res.json()
        setAvailableServices(data) // giả sử API trả về mảng {id, name, price}
      } catch (err) {
        console.error("Error fetching services:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])
  const availableEquipment = [
    { id: 1, name: "Lều cắm trại 4 người", price: 300000 },
    { id: 2, name: "Túi ngủ cao cấp", price: 200000 },
    { id: 3, name: "Bếp gas mini", price: 150000 },
    { id: 4, name: "Đèn pin LED", price: 100000 },
  ]

  const availableFood = [
    { id: 1, name: "Suất ăn sáng (Phở bò)", price: 80000 },
    { id: 2, name: "Suất ăn trưa (Cơm rang)", price: 120000 },
    { id: 3, name: "Suất ăn tối (BBQ)", price: 200000 },
    { id: 4, name: "Đồ uống", price: 50000 },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const calculateOriginalPrice = () => {
    const servicesTotal = formData.services.reduce((sum, s) => {
      const service = availableServices.find((sv) => sv.id === s.serviceId)
      return sum + (service ? service.price * (s.quantity || 1) : 0)
    }, 0)

    const equipmentTotal = formData.equipment.reduce(
      (sum, e) => sum + e.price * (e.quantity || 1),
      0
    )

    const foodTotal = formData.foods.reduce(
      (sum, f) => sum + f.price * (f.quantity || 1),
      0
    )

    return servicesTotal + equipmentTotal + foodTotal
  }


  const addService = (service: Service) => {
    if (!formData.services.find((s) => s.serviceId === service.id)) {
      setFormData((prev) => ({
        ...prev,
        services: [
          ...prev.services,
          {
            serviceId: service.id,
            serviceName: service.name,
            quantity: 1,
            price: service.price,   // lấy từ Service
            type: "SERVICE",        // bắt buộc cho ComboServiceForm
          } as ComboServiceForm,
        ],
      }))
    }
  }
  const removeService = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.serviceId !== serviceId),
    }))
  }

  const addEquipment = (equipment: any) => {
    const newEquipment: ComboItem = {
      id: equipment.id,
      name: equipment.name,
      type: "equipment",
      price: equipment.price,
      quantity: 1,
      included: true,
    }
    setFormData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, newEquipment],
    }))
  }

  const addFood = (foods: any) => {
    const newFoods: ComboItem = {
      id: foods.id,
      name: foods.name,
      type: "foods",
      price: foods.price,
      quantity: 1,
      included: true,
    }
    setFormData((prev) => ({
      ...prev,
      foods: [...prev.foods, newFoods],
    }))
  }

  const removeItem = (type: "services" | "equipment" | "foods", id: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((item: any) => {
        if (type === "services") {
          return item.serviceId !== id
        }
        return item.id !== id
      }),
    }))
  }


  const updateItemQuantity = (type: "equipment" | "foods", id: number, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((item) => (item.id === id ? { ...item, quantity } : item)),
    }))
  }

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ""],
    }))
  }

  const updateHighlight = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => (i === index ? value : h)),
    }))
  }

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const originalPrice = calculateOriginalPrice()
    const discount =
      originalPrice > 0
        ? Math.round(((originalPrice - formData.price) / originalPrice) * 100)
        : 0

    const comboPayload = {
      ...formData,
      originalPrice,
      discount,
      services: formData.services.map((s) => ({
        serviceId: s.serviceId,
        quantity: s.quantity,
      })),
      // chỉ gửi string
      equipment: formData.equipment.map((e) => e.name || e),
      foods: formData.foods.map((f) => f.name || f),
    }

    const formDataToSend = new FormData()
    formDataToSend.append("combo", new Blob([JSON.stringify(comboPayload)], { type: "application/json" }))
    if (file) {
      formDataToSend.append("imageFile", file)
    }

    console.log(formDataToSend);

    try {
      const response = await fetch("http://localhost:8080/apis/v1/combos", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) throw new Error("Tạo combo thất bại")

      sessionStorage.setItem("comboSuccess", "1")

      router.push("/admin/combo")
    } catch (error) {
      console.error("Error creating combo:", error)
      alert("Có lỗi xảy ra khi tạo combo")
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/combo" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại danh sách</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link href="/" className="flex items-center gap-2">
              <Tent className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">OG Camping Admin</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo Combo mới</h1>
          <p className="text-gray-600">Tạo gói combo dịch vụ, thiết bị và đồ ăn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Nhập thông tin chính của combo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload ảnh */}
              <div className="space-y-3">
                <label className="text-base font-medium text-gray-700">Ảnh minh họa Combo</label>

                {/* Nút upload ẩn input */}
                <div className="flex items-center gap-3">
                  <input
                    id="upload-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("upload-image")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Chọn ảnh
                  </Button>
                </div>

                {/* Hiển thị preview nếu có */}
                {preview ? (
                  <div className="mt-2">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-xl shadow-md border"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center rounded-xl border border-dashed text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên combo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Combo Cắm Trại Sapa Premium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, location: value }))
                    }
                  >
                    <SelectTrigger id="location" className="w-full border-gray-300">
                      <SelectValue placeholder="Chọn địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">

                <div className="space-y-2">
                  <Label htmlFor="minDays">Số ngày tối thiểu</Label>
                  <Input
                    id="minDays"
                    type="number"
                    min="1"
                    value={formData.minDays}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minDays: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDays">Số ngày tối đa</Label>
                  <Input
                    id="maxDays"
                    type="number"
                    min="1"
                    value={formData.maxDays}
                    onChange={(e) => {
                      const days = Number.parseInt(e.target.value) || 1
                      const nights = Math.max(days - 1, 0)

                      setFormData((prev) => ({
                        ...prev,
                        maxDays: days,
                        duration: `${days} Ngày ${nights} Đêm`,
                      }))
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPeople">Số người tối đa</Label>
                  <Input
                    id="maxPeople"
                    type="number"
                    min="1"
                    value={formData.maxPeople}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxPeople: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <Select
                  value={formData.active ? "true" : "false"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, active: value === "true" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về combo..."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Dịch vụ
              </CardTitle>
              <CardDescription>Chọn các dịch vụ bao gồm trong combo</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Combobox search */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="justify-between"
                  >
                    Thêm dịch vụ
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="right" align="start" className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      className="mt-2 justify-items-start"
                      placeholder="Tìm dịch vụ..."
                    />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy dịch vụ.</CommandEmpty>
                      <CommandGroup>
                        {availableServices.map((service) => (
                          <CommandItem
                            key={service.id}
                            onSelect={() => addService(service)}
                            className="flex items-center justify-between"
                          >
                            <span>
                              {service.name} ({formatPrice(service.price)})
                            </span>
                            {formData.services.find((s) => s.serviceId === service.id) && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>


              {/* Danh sách dịch vụ đã chọn */}
              {formData.services.length > 0 && (
                <div className="space-y-2">
                  {formData.services.map((service) => (
                    <div
                      key={service.serviceId}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(service.price)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(service.serviceId)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-600" />
                Thiết bị
              </CardTitle>
              <CardDescription>Chọn thiết bị cắm trại bao gồm trong combo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {availableEquipment
                  .filter((e) => !formData.equipment.find((fe) => fe.id === e.id))
                  .map((equipment) => (
                    <Button
                      key={equipment.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addEquipment(equipment)}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {equipment.name} ({formatPrice(equipment.price)})
                    </Button>
                  ))}
              </div>

              {formData.equipment.length > 0 && (
                <div className="space-y-2">
                  {formData.equipment.map((equipment) => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{equipment.name}</div>
                        <div className="text-sm text-gray-600">{formatPrice(equipment.price)} mỗi cái</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={equipment.quantity || 1}
                          onChange={(e) =>
                            updateItemQuantity("equipment", equipment.id, Number.parseInt(e.target.value))
                          }
                          className="w-20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem("equipment", equipment.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Food */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" />
                Đồ ăn
              </CardTitle>
              <CardDescription>Chọn các món ăn bao gồm trong combo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {availableFood
                  .filter((f) => !formData.foods.find((ff) => ff.id === f.id))
                  .map((foods) => (
                    <Button
                      key={foods.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFood(foods)}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {foods.name} ({formatPrice(foods.price)})
                    </Button>
                  ))}
              </div>

              {formData.foods.length > 0 && (
                <div className="space-y-2">
                  {formData.foods.map((foods) => (
                    <div key={foods.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{foods.name}</div>
                        <div className="text-sm text-gray-600">{formatPrice(foods.price)} mỗi suất</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={foods.quantity || 1}
                          onChange={(e) => updateItemQuantity("foods", foods.id, Number.parseInt(e.target.value))}
                          className="w-20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem("foods", foods.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Giá cả
              </CardTitle>
              <CardDescription>Thiết lập giá combo và mức giảm giá</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá combo *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseInt(e.target.value) }))}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giá gốc (tự động tính)</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">{formatPrice(calculateOriginalPrice())}</div>
                    <div className="text-sm text-gray-600">
                      Tiết kiệm: {formatPrice(calculateOriginalPrice() - formData.price)}
                      {calculateOriginalPrice() > 0 && (
                        <span className="ml-2 text-green-600">
                          ({Math.round(((calculateOriginalPrice() - formData.price) / calculateOriginalPrice()) * 100)}
                          %)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Điểm nổi bật
              </CardTitle>
              <CardDescription>Thêm các điểm nổi bật của combo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={addHighlight}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm điểm nổi bật
              </Button>

              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    placeholder="VD: Tiết kiệm 700,000đ so với đặt riêng lẻ"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHighlight(index)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-600" />
                Tags
              </CardTitle>
              <CardDescription>Thêm các tag để dễ tìm kiếm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["premium", "budget", "family", "friends", "mountain", "beach", "forest", "adventure"].map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    disabled={formData.tags.includes(tag)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 border-0 cursor-pointer hover:bg-gray-200"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/combo">
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Tạo combo
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
