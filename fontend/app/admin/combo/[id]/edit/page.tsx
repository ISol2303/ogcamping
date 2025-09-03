"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  status: string
  services: ComboItem[]
  equipment: ComboItem[]
  food: ComboItem[]
  highlights: string[]
  included: string[]
  notIncluded: string[]
  tags: string[]
  location: string
  bookingCount: number
  createdAt: string
  updatedAt: string
}

export default function EditComboPage() {
  const params = useParams()
  const router = useRouter()
  const comboId = params.id as string

  const [combo, setCombo] = useState<Combo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Mock data for selection
  const availableServices = [
    { id: 1, name: "Cắm trại Sapa", price: 800000 },
    { id: 2, name: "Hướng dẫn viên chuyên nghiệp", price: 500000 },
    { id: 3, name: "Cắm trại Đà Lạt", price: 600000 },
    { id: 4, name: "Tour trekking", price: 400000 },
  ]

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

  useEffect(() => {
    fetchCombo()
  }, [comboId])

  const fetchCombo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/combos?id=${comboId}`)
      const data = await response.json()
      if (data.success && data.data.length > 0) {
        const comboData = data.data.find((c: Combo) => c.id === Number.parseInt(comboId))
        setCombo(comboData)
      }
    } catch (error) {
      console.error("Error fetching combo:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const calculateOriginalPrice = () => {
    if (!combo) return 0

    const servicesTotal = combo.services.filter((s) => s.included).reduce((sum, service) => sum + service.price, 0)

    const equipmentTotal = combo.equipment
      .filter((e) => e.included)
      .reduce((sum, equipment) => sum + equipment.price * (equipment.quantity || 1), 0)

    const foodTotal = combo.food
      .filter((f) => f.included)
      .reduce((sum, food) => sum + food.price * (food.quantity || 1), 0)

    return servicesTotal + equipmentTotal + foodTotal
  }

  const addService = (service: any) => {
    if (!combo) return
    const newService: ComboItem = {
      id: service.id,
      name: service.name,
      type: "service",
      price: service.price,
      included: true,
    }
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            services: [...prev.services, newService],
          }
        : null,
    )
  }

  const addEquipment = (equipment: any) => {
    if (!combo) return
    const newEquipment: ComboItem = {
      id: equipment.id,
      name: equipment.name,
      type: "equipment",
      price: equipment.price,
      quantity: 1,
      included: true,
    }
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            equipment: [...prev.equipment, newEquipment],
          }
        : null,
    )
  }

  const addFood = (food: any) => {
    if (!combo) return
    const newFood: ComboItem = {
      id: food.id,
      name: food.name,
      type: "food",
      price: food.price,
      quantity: 1,
      included: true,
    }
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            food: [...prev.food, newFood],
          }
        : null,
    )
  }

  const removeItem = (type: "services" | "equipment" | "food", id: number) => {
    if (!combo) return
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            [type]: prev[type].filter((item) => item.id !== id),
          }
        : null,
    )
  }

  const updateItemQuantity = (type: "equipment" | "food", id: number, quantity: number) => {
    if (!combo) return
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            [type]: prev[type].map((item) => (item.id === id ? { ...item, quantity } : item)),
          }
        : null,
    )
  }

  const addHighlight = () => {
    if (!combo) return
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            highlights: [...prev.highlights, ""],
          }
        : null,
    )
  }

  const updateHighlight = (index: number, value: string) => {
    if (!combo) return
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            highlights: prev.highlights.map((h, i) => (i === index ? value : h)),
          }
        : null,
    )
  }

  const removeHighlight = (index: number) => {
    if (!combo) return
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            highlights: prev.highlights.filter((_, i) => i !== index),
          }
        : null,
    )
  }

  const addTag = (tag: string) => {
    if (!combo || combo.tags.includes(tag)) return
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            tags: [...prev.tags, tag],
          }
        : null,
    )
  }

  const removeTag = (tag: string) => {
    if (!combo) return
    setCombo((prev) =>
      prev
        ? {
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
          }
        : null,
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!combo) return

    setSaving(true)

    try {
      const originalPrice = calculateOriginalPrice()
      const discount = originalPrice > 0 ? Math.round(((originalPrice - combo.price) / originalPrice) * 100) : 0

      const comboData = {
        ...combo,
        originalPrice,
        discount,
        highlights: combo.highlights.filter((h) => h.trim() !== ""),
      }

      const response = await fetch("/api/combos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comboData),
      })

      const data = await response.json()
      if (data.success) {
        router.push(`/admin/combo/${combo.id}`)
      }
    } catch (error) {
      console.error("Error updating combo:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin combo...</p>
        </div>
      </div>
    )
  }

  if (!combo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy combo</h2>
          <p className="text-gray-600 mb-4">Combo bạn đang tìm kiếm không tồn tại.</p>
          <Link href="/admin/combo">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
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
            <Link
              href={`/admin/combo/${combo.id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại chi tiết</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa Combo</h1>
          <p className="text-gray-600">Cập nhật thông tin combo: {combo.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Cập nhật thông tin chính của combo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên combo *</Label>
                  <Input
                    id="name"
                    value={combo.name}
                    onChange={(e) => setCombo((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm *</Label>
                  <Input
                    id="location"
                    value={combo.location}
                    onChange={(e) => setCombo((prev) => (prev ? { ...prev, location: e.target.value } : null))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả *</Label>
                <Textarea
                  id="description"
                  value={combo.description}
                  onChange={(e) => setCombo((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Thời gian</Label>
                  <Input
                    id="duration"
                    value={combo.duration}
                    onChange={(e) => setCombo((prev) => (prev ? { ...prev, duration: e.target.value } : null))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPeople">Số người tối đa</Label>
                  <Input
                    id="maxPeople"
                    type="number"
                    min="1"
                    value={combo.maxPeople}
                    onChange={(e) =>
                      setCombo((prev) => (prev ? { ...prev, maxPeople: Number.parseInt(e.target.value) } : null))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={combo.status}
                    onValueChange={(value) => setCombo((prev) => (prev ? { ...prev, status: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Tạm dừng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {availableServices
                  .filter((s) => !combo.services.find((fs) => fs.id === s.id))
                  .map((service) => (
                    <Button
                      key={service.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addService(service)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {service.name} ({formatPrice(service.price)})
                    </Button>
                  ))}
              </div>

              {combo.services.length > 0 && (
                <div className="space-y-2">
                  {combo.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{formatPrice(service.price)}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem("services", service.id)}
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {availableEquipment
                  .filter((e) => !combo.equipment.find((fe) => fe.id === e.id))
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

              {combo.equipment.length > 0 && (
                <div className="space-y-2">
                  {combo.equipment.map((equipment) => (
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {availableFood
                  .filter((f) => !combo.food.find((ff) => ff.id === f.id))
                  .map((food) => (
                    <Button
                      key={food.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFood(food)}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {food.name} ({formatPrice(food.price)})
                    </Button>
                  ))}
              </div>

              {combo.food.length > 0 && (
                <div className="space-y-2">
                  {combo.food.map((food) => (
                    <div key={food.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{food.name}</div>
                        <div className="text-sm text-gray-600">{formatPrice(food.price)} mỗi suất</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={food.quantity || 1}
                          onChange={(e) => updateItemQuantity("food", food.id, Number.parseInt(e.target.value))}
                          className="w-20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem("food", food.id)}
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá combo *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={combo.price}
                    onChange={(e) =>
                      setCombo((prev) => (prev ? { ...prev, price: Number.parseInt(e.target.value) } : null))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giá gốc (tự động tính)</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">{formatPrice(calculateOriginalPrice())}</div>
                    <div className="text-sm text-gray-600">
                      Tiết kiệm: {formatPrice(calculateOriginalPrice() - combo.price)}
                      {calculateOriginalPrice() > 0 && (
                        <span className="ml-2 text-green-600">
                          ({Math.round(((calculateOriginalPrice() - combo.price) / calculateOriginalPrice()) * 100)}%)
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

              {combo.highlights.map((highlight, index) => (
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
                    disabled={combo.tags.includes(tag)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>

              {combo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {combo.tags.map((tag) => (
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
            <Link href={`/admin/combo/${combo.id}`}>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </Link>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
