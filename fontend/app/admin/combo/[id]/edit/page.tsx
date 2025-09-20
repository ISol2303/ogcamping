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
  Upload,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { Service } from "@/app/admin/page_old"

interface ComboItem {
  id: number
  name: string
  price: number
  quantity?: number
  type: "SERVICE" | "EQUIPMENT" | "FOOD"
}


interface Combo {
  id: number
  name: string
  description: string
  price: number
  originalPrice: number
  discount: number
  duration: string
  minDays: number
  maxDays: number
  maxPeople: number
  rating: number
  reviewCount: number
  imageFile?: File | null
  active: boolean
  services: ComboItem[]
  equipment: ComboItem[]
  food: ComboItem[]
  highlights: string[]
  tags: string[]
  location: string
  bookingCount: number
  createdAt: string
  updateAt: string
}

export default function EditComboPage() {
  const params = useParams()
  const router = useRouter()
  const comboId = params.id as string

  const [combo, setCombo] = useState<Combo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState<ComboItem[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data cho equipment & food
  const availableEquipment: ComboItem[] = [
    { id: 1, name: "Lều cắm trại 4 người", type: "EQUIPMENT", price: 300000, quantity: 1 },
    { id: 2, name: "Túi ngủ cao cấp", type: "EQUIPMENT", price: 200000, quantity: 1 },
    { id: 3, name: "Bếp gas mini", type: "EQUIPMENT", price: 150000, quantity: 1 },
    { id: 4, name: "Đèn pin LED", type: "EQUIPMENT", price: 100000, quantity: 1 },
  ]

  const availableFood: ComboItem[] = [
    { id: 1, name: "Suất ăn sáng (Phở bò)", type: "FOOD", price: 80000, quantity: 1 },
    { id: 2, name: "Suất ăn trưa (Cơm rang)", type: "FOOD", price: 120000, quantity: 1 },
    { id: 3, name: "Suất ăn tối (BBQ)", type: "FOOD", price: 200000, quantity: 1 },
    { id: 4, name: "Đồ uống", type: "FOOD", price: 50000, quantity: 1 },
  ]

  useEffect(() => {
    const fetchCombo = async () => {
      try {
        setLoading(true)

        // 🔹 Fetch combo theo id
        const res = await fetch(`http://localhost:8080/apis/v1/combos/${comboId}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Lỗi tải combo")
        const data = await res.json()

        // 🔹 Map services từ items + nối giá từ availableServices
        const mappedServices: ComboItem[] = data.items.map((item: any) => ({
          id: item.serviceId,
          name: item.serviceName,
          price: item.price,     // ✅ lấy trực tiếp từ API
          quantity: item.quantity,
          included: true,
          type: "service",
        }))


        // 🔹 Map combo đầy đủ
        const mappedCombo: Combo = {
          ...data,
          services: mappedServices,
          equipment: availableEquipment.map((eq) => ({
            ...eq,
            type: "equipment",
            included: false,
            quantity: 1,
          })),
          food: availableFood.map((fd) => ({
            ...fd,
            type: "food",
            included: false,
            quantity: 1,
          })),
          highlights: data.highlights || [],
          tags: data.tags || [],
        }

        setServices(mappedServices)
        setCombo({
          ...data,
          services: mappedServices,
          equipment: [],
          food: [],
          highlights: data.highlights || [],
          tags: data.tags || [],
        })


        // 🔹 Fetch all combos để lấy danh sách location unique
        const allRes = await fetch("http://localhost:8080/apis/v1/combos")
        if (!allRes.ok) throw new Error("Lỗi tải danh sách combos")
        const allData: Combo[] = await allRes.json()

        const uniqueLocations = Array.from(
          new Set(allData.map((c) => c.location).filter((loc): loc is string => !!loc))
        )
        setLocations(uniqueLocations)
      } catch (err) {
        console.error("Error fetching combo:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCombo()
  }, [comboId])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:8080/apis/v1/services")
        const data = await res.json()
        setAvailableServices(data)
      } catch (err) {
        console.error("Lỗi tải services:", err)
      }
    }
    fetchServices()
  }, [])
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const calculateOriginalPrice = () => {
    if (!combo) return 0;

    // Tính tổng dịch vụ
    const servicesTotal = combo.services.reduce((sum, service) => {
      // Tìm service gốc trong availableServices để check minDays/maxDays
      const matched = availableServices.find((srv) => srv.id === service.id);

      // Nếu service cho phép nhập số lượng => tính price * quantity
      if (matched && (!matched.minDays || !matched.maxDays)) {
        return sum + service.price * (service.quantity ?? 1);
      }

      // Ngược lại chỉ lấy giá mặc định
      return sum + service.price;
    }, 0);

    // Tính tổng equipment
    const equipmentTotal = combo.equipment.reduce(
      (sum, equipment) => sum + equipment.price * (equipment.quantity || 1),
      0
    );

    // Tính tổng food
    const foodTotal = combo.food.reduce(
      (sum, food) => sum + food.price * (food.quantity || 1),
      0
    );

    return servicesTotal + equipmentTotal + foodTotal;
  };



  const addService = (service: any) => {
    if (!combo) return
    const newService: ComboItem = {
      id: service.id,
      name: service.name,
      type: "SERVICE",
      price: service.price,
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
      type: "EQUIPMENT",
      price: equipment.price,
      quantity: 1,
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
      type: "FOOD",
      price: food.price,
      quantity: 1,
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
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!combo?.id) {
      console.error("Combo id is missing!");
      return;
    }

    setSaving(true);
    try {
      const originalPrice = calculateOriginalPrice();
      const discount =
        originalPrice > 0
          ? Math.round(((originalPrice - combo.price) / originalPrice) * 100)
          : 0;

      const comboData = {
        name: combo.name,
        description: combo.description,
        price: combo.price,
        originalPrice,
        discount,
        active: combo.active,
        location: combo.location,
        duration: combo.duration,
        maxPeople: combo.maxPeople,
        minDays: combo.minDays,
        maxDays: combo.maxDays,
        highlights: combo.highlights.filter((h) => h.trim() !== ""),
        tags: combo.tags,
        services: combo.services.map((s) => ({
          serviceId: s.id,
          quantity: s.quantity ?? 1,
        })),
        equipment: combo.equipment,
        foods: combo.food
      };

      const formData = new FormData();
      formData.append("combo", new Blob([JSON.stringify(comboData)], { type: "application/json" }))
      if (file) {
        formData.append("imageFile", file);
      }
      sessionStorage.setItem("successUpdate", "1")
      // 👉 In ra nội dung FormData
      for (const [key, value] of Array.from(formData.entries())) {
        if (value instanceof File) {
          console.log(`${key}: File name = ${value.name}, size = ${value.size}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }


      const response = await fetch(
        `http://localhost:8080/apis/v1/combos/${combo.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Update combo failed");
      }

      const data = await response.json();
      console.log("Updated combo:", data);

      router.push(`/admin/combo/${combo.id}`);
    } catch (error) {
      console.error("Error updating combo:", error);
    } finally {
      setSaving(false);
    }
  };







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
                    value={combo.name}
                    onChange={(e) => setCombo((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm *</Label>
                  <Select
                    value={combo.location || ""}
                    onValueChange={(value) => setCombo((prev) => (prev ? { ...prev, location: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
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
                  <Label htmlFor="minDays">Số ngày tối thiểu</Label>
                  <Input
                    id="minDays"
                    type="number"
                    min="1"
                    value={combo.minDays}
                    onChange={(e) =>
                      setCombo((prev) =>
                        prev ? { ...prev, minDays: Number.parseInt(e.target.value) || 1 } : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDays">Số ngày tối đa</Label>
                  <Input
                    id="maxDays"
                    type="number"
                    min="1"
                    value={combo.maxDays}
                    onChange={(e) => {
                      const days = Number.parseInt(e.target.value) || 1
                      const nights = Math.max(days - 1, 0)
                      setCombo((prev) =>
                        prev
                          ? { ...prev, maxDays: days, duration: `${days} Ngày ${nights} Đêm` }
                          : null
                      )
                    }}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={combo.active ? "true" : "false"}
                  onValueChange={(value) =>
                    setCombo((prev) =>
                      prev ? { ...prev, active: value === "true" } : null
                    )
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
                  value={combo.description}
                  onChange={(e) => setCombo((prev) => (prev ? { ...prev, description: e.target.value } : null))}
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
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Danh sách dịch vụ có thể thêm */}
              <Input
                placeholder="Tìm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-white shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableServices
                    .filter(
                      (s) =>
                        !combo.services.some((fs) => fs.id === s.id) &&
                        s.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 50)
                    .map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          addService({
                            id: service.id,
                            name: service.name,
                            price: service.price,
                            type: "SERVICE",
                            included: true,
                            quantity: 1,
                          })
                        }
                        className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-green-50 hover:border-green-400 transition shadow-sm text-left"
                      >
                        <Plus className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{service.name}</span>
                          <span className="text-sm text-gray-500">
                            {formatPrice(service.price)}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>


              {/* Danh sách dịch vụ đã chọn */}
              {combo.services.length > 0 && (
                <div className="space-y-2">
                  {combo.services.map((service) => {
                    const matched = availableServices.find((s) => s.id === service.id)

                    return (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(service.price)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Chỉ hiển thị ô số lượng nếu service gốc không có minDays & maxDays */}
                          {matched && (!matched.minDays || !matched.maxDays) && (
                            <input
                              type="number"
                              min={1}
                              value={service.quantity ?? 1}
                              onChange={(e) => {
                                const newQty = Math.max(1, Number(e.target.value) || 1)
                                setCombo((prev) =>
                                  prev
                                    ? {
                                      ...prev,
                                      services: prev.services.map((s) =>
                                        s.id === service.id
                                          ? { ...s, quantity: newQty }
                                          : s
                                      ),
                                    }
                                    : null
                                )
                              }}
                              className="w-16 px-2 py-1 border rounded-md text-sm"
                            />
                          )}

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
                      </div>
                    )
                  })}
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
    </div >
  )
}
