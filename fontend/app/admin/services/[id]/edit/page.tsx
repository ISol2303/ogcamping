"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Tent, ArrowLeft, Save, AlertCircle, Loader2, X, Upload } from "lucide-react"
import Link from "next/link"
import { Itinerary, ServiceAvailability } from "@/app/admin/page_old"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ImageForm from "./ImageForm"
import Image from "next/image"

interface ServiceFormData {
  id?: number
  name: string
  description: string
  price: number
  location: string

  minDays: number
  maxDays: number
  minCapacity: number
  maxCapacity: number
  isExperience: boolean
  active: boolean | null

  averageRating: number
  totalReviews: number
  duration: string
  capacity: string

  tag: 'POPULAR' | 'NEW' | 'DISCOUNT' | null
  imageUrl: string              // ảnh chính cũ
  imageFile: File | null       // ảnh chính mới chọn
  extraImageUrls: string[]
  newExtraImages: File[]      // danh sách ảnh phụ mới (upload thêm)
  highlights: string[]
  included: string[]

  allowExtraPeople: boolean | null
  extraFeePerPerson: number | null
  maxExtraPeople: number | null

  requireAdditionalSiteIfOver: boolean | null

  itinerary: Itinerary[]
  availability: ServiceAvailability[]
}


export default function ServiceEditPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: 0,
    location: "",

    minDays: 1,
    maxDays: 7,
    minCapacity: 1,
    maxCapacity: 10,
    isExperience: false,
    active: true,

    averageRating: 0,
    totalReviews: 0,
    duration: "",
    capacity: "",

    tag: null,
    imageUrl: "",
    extraImageUrls: [],
    newExtraImages: [],
    imageFile: null,
    highlights: [],
    included: [],

    allowExtraPeople: null,
    extraFeePerPerson: null,
    maxExtraPeople: null,

    requireAdditionalSiteIfOver: null,

    itinerary: [],
    availability: []
  })


  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ load?: string; submit?: string }>({})
  const [locations, setLocations] = useState<string[]>([])
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/apis/v1/services/${serviceId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch service")
        }

        const data: ServiceFormData = await response.json()
        setFormData(data)
      } catch (error) {
        console.error("Error fetching service data:", error)
        setErrors({ load: "Có lỗi xảy ra khi tải dịch vụ. Vui lòng thử lại." })
      }
    }

    if (serviceId) {
      fetchServiceData()
    }
  }, [serviceId])

  const handleCancel = () => {
    if (isUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      router.push(`/admin/services/${serviceId}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { id, averageRating, totalReviews, imageFile, newExtraImages, imageUrl, availability, ...rest } = formData;

      const cleanedData: any = {
        ...rest,
        highlights: rest.highlights.filter(h => h.trim()),
        included: rest.included.filter(i => i.trim()),
        extraImageUrls: rest.extraImageUrls, // giữ ảnh phụ cũ
        keepImageUrl: !!formData.imageUrl,   // true nếu muốn giữ ảnh chính
      };

      const formDataToSend = new FormData();
      formDataToSend.append("service", JSON.stringify(cleanedData));

      if (imageFile) {
        formDataToSend.append("imageFile", imageFile);
      }

      if (newExtraImages && newExtraImages.length > 0) {
        newExtraImages.forEach((file) => {
          formDataToSend.append("extraImages", file);
        });
      }

      const res = await fetch(`http://localhost:8080/apis/v1/services/${serviceId}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Cập nhật dịch vụ thất bại");

      const result = await res.json();
      console.log("Updated service:", result);

      router.push(`/admin/services/${serviceId}`);
    } catch (error) {
      console.error("Error updating service:", error);
    } finally {
      setLoading(false);
    }
  };




  const handleExtraImagesChange = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files)
    setFormData({
      ...formData,
      newExtraImages: [...(formData.newExtraImages || []), ...newFiles], // giữ ảnh upload mới
    })
  }

  const handleRemoveExtraImage = (index: number, isNew: boolean = false) => {
    if (isNew) {
      const updated = [...formData.newExtraImages]
      updated.splice(index, 1)
      setFormData({ ...formData, newExtraImages: updated })
    } else {
      const updated = [...formData.extraImageUrls]
      updated.splice(index, 1)
      setFormData({ ...formData, extraImageUrls: updated })
    }
  }
  const validateForm = () => {
    // Implement form validation logic here
    return true
  }

  if (errors.load) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải dịch vụ</h2>
          <p className="text-gray-600 mb-4">{errors.load}</p>
          <Button onClick={() => router.push(`/admin/services/${serviceId}`)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại chi tiết dịch vụ
          </Button>
        </div>
      </div>
    )
  }


  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:8080/apis/v1/services/locations")
        if (res.ok) {
          const data = await res.json()
          setLocations(data) // ví dụ ["Sapa", "Hà Nội", "Đà Nẵng"]
        }
      } catch (err) {
        console.error("Lỗi khi load locations", err)
      }
    }
    fetchLocations()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/admin/services" className="hover:text-green-600">
                Dịch vụ
              </Link>
              <span>/</span>
              <Link href={`/admin/services/${serviceId}`} className="hover:text-green-600">
                Chi tiết dịch vụ
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Chỉnh sửa</span>
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
      <main className="container mx-auto px-4 py-8">
        <form id="service-form" onSubmit={handleSubmit}>
          <Card className="col-span-2 p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-700">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {/* Tên dịch vụ */}
              <div>
                <Label htmlFor="name">Tên dịch vụ</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  placeholder="Nhập tên dịch vụ"
                />
              </div>

              {/* Vị trí */}
              <div>
                <Label htmlFor="location">Vị trí</Label>
                <select
                  id="location"
                  value={formData.location ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="mt-1 border rounded p-2 w-full"
                >
                  <option value="">-- Chọn vị trí --</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>


              {/* Thời gian + inputs minDays/maxDays */}
              {!(formData.duration === "null-null ngày") && (
                <>
                  <div className="hidden">
                    <Label htmlFor="duration">Thời gian</Label>
                    <Input
                      id="duration"
                      value={
                        formData.maxDays
                          ? `${formData.maxDays} Ngày ${formData.maxDays - 1} Đêm`
                          : formData.duration
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: e.target.value,
                        })
                      }
                      className="mt-1"
                      placeholder="VD: 5 Ngày 4 Đêm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minDays">Số ngày tối thiểu</Label>
                    <Input
                      id="minDays"
                      type="number"
                      value={formData.minDays ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, minDays: Number(e.target.value) })
                      }
                      className="mt-1"
                      placeholder="VD: 3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDays">Số ngày tối đa</Label>
                    <Input
                      id="maxDays"
                      type="number"
                      value={formData.maxDays ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDays: Number(e.target.value) })
                      }
                      className="mt-1"
                      placeholder="VD: 5"
                    />
                  </div>
                </>
              )}

              {!(formData.capacity === "null-null người") && (
                <>
                  <div className="hidden">
                    <Label htmlFor="capacity">Sức chứa</Label>
                    <Input
                      id="capacity"
                      value={
                        formData.minCapacity && formData.maxCapacity
                          ? `${formData.minCapacity} - ${formData.maxCapacity} người`
                          : formData.capacity
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: e.target.value,
                        })
                      }
                      className="mt-1"
                      placeholder="VD: 4-6 người"
                    />
                  </div>

                  <div>
                    <Label htmlFor="minCapacity">Sức chứa tối thiểu</Label>
                    <Input
                      id="minCapacity"
                      type="number"
                      value={formData.minCapacity ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, minCapacity: Number(e.target.value) })
                      }
                      className="mt-1"
                      placeholder="VD: 2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCapacity">Sức chứa tối đa</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={formData.maxCapacity ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, maxCapacity: Number(e.target.value) })
                      }
                      className="mt-1"
                      placeholder="VD: 6"
                    />
                  </div>
                </>
              )}

              {/* Giá */}
              <div>
                <Label htmlFor="price">Giá (VNĐ)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>

              {/* Thẻ */}
              <div>
                <Label htmlFor="tag">Thẻ</Label>
                <select
                  id="tag"
                  value={formData.tag ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tag: e.target.value as any })
                  }
                  className="mt-1 border rounded p-2 w-full"
                >
                  <option value="">-- Chọn thẻ --</option>
                  <option value="POPULAR">POPULAR</option>
                  <option value="NEW">NEW</option>
                  <option value="DISCOUNT">DISCOUNT</option>
                </select>
              </div>

              {/* Trạng thái */}
              <div className="mb-4">
                <Label htmlFor="active">Trạng thái</Label>
                <Select
                  value={
                    formData.active === null ? "" : formData.active ? "true" : "false"
                  }
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      active:
                        value === "true" ? true : value === "false" ? false : null,
                    })
                  }
                >
                  <SelectTrigger id="active" className="mt-2 w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

          </Card>
          <Card className="col-span-2 p-6 mt-5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-700">Nội dung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" rows={5} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1" placeholder="Mô tả chi tiết dịch vụ..." />
              </div>
              {/* Ưu điểm */}
              <div className="mb-4">
                <Label className="block mb-2 text-sm font-medium text-gray-700">Ưu điểm</Label>
                <div className="flex flex-wrap gap-2 border rounded-lg p-2 min-h-[46px]">
                  {formData.highlights.map((h, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      {h}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            highlights: formData.highlights.filter((_, i) => i !== idx),
                          })
                        }
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="flex-1 min-w-[120px] border-0 focus:ring-0 text-sm"
                    placeholder="Nhập và nhấn Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value) {
                          setFormData({
                            ...formData,
                            highlights: [...formData.highlights, value],
                          });
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Bao gồm */}
              <div className="mb-4">
                <Label className="block mb-2 text-sm font-medium text-gray-700">Bao gồm</Label>
                <div className="flex flex-wrap gap-2 border rounded-lg p-2 min-h-[46px]">
                  {formData.included.map((inc, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm"
                    >
                      {inc}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            included: formData.included.filter((_, i) => i !== idx),
                          })
                        }
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="flex-1 min-w-[120px] border-0 focus:ring-0 text-sm"
                    placeholder="Nhập và nhấn Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value) {
                          setFormData({
                            ...formData,
                            included: [...formData.included, value],
                          });
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>
              {/* Lịch trình */}
              <div className="mb-6">
                <Label className="block mb-2 text-sm font-medium text-gray-700">Lịch trình</Label>

                <div className="space-y-4">
                  {formData.itinerary.map((item, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 relative bg-gray-50"
                    >
                      {/* Nút xóa */}
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...formData.itinerary];
                          newItems.splice(idx, 1);
                          setFormData({ ...formData, itinerary: newItems });
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>

                      {/* Ngày */}
                      <div className="mb-2">
                        <Label className="text-sm">Ngày</Label>
                        <Input
                          type="number"
                          value={item.day}
                          onChange={(e) => {
                            const newItems = [...formData.itinerary];
                            newItems[idx].day = parseInt(e.target.value, 10) || 1;
                            setFormData({ ...formData, itinerary: newItems });
                          }}
                          className="mt-1"
                          min={1}
                        />
                      </div>

                      {/* Tiêu đề */}
                      <div className="mb-2">
                        <Label className="text-sm">Tiêu đề</Label>
                        <Input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...formData.itinerary];
                            newItems[idx].title = e.target.value;
                            setFormData({ ...formData, itinerary: newItems });
                          }}
                          className="mt-1"
                          placeholder="Ví dụ: Khám phá phố cổ"
                        />
                      </div>

                      {/* Hoạt động */}
                      <div>
                        <Label className="text-sm">Hoạt động</Label>
                        <div className="flex flex-wrap gap-2 border rounded-lg p-2 min-h-[46px]">
                          {item.activities.map((act, actIdx) => (
                            <span
                              key={actIdx}
                              className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm"
                            >
                              {act}
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...formData.itinerary];
                                  newItems[idx].activities = newItems[idx].activities.filter(
                                    (_, i) => i !== actIdx
                                  );
                                  setFormData({ ...formData, itinerary: newItems });
                                }}
                                className="hover:text-red-500"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            className="flex-1 min-w-[120px] border-0 focus:ring-0 text-sm"
                            placeholder="Nhập hoạt động + Enter"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  const newItems = [...formData.itinerary];
                                  newItems[idx].activities = [
                                    ...newItems[idx].activities,
                                    value,
                                  ];
                                  setFormData({ ...formData, itinerary: newItems });
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nút thêm ngày */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 flex items-center gap-2"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      itinerary: [
                        ...formData.itinerary,
                        { day: formData.itinerary.length + 1, title: "", activities: [] },
                      ],
                    })
                  }
                >
                  + Thêm ngày
                </Button>
              </div>

            </CardContent>
          </Card>
          <div className="mb-6 space-y-6">
            <Label className="block text-base font-medium">Hình ảnh</Label>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Ảnh chính</p>

              {formData.imageUrl ? (
                <div className="relative w-48 h-48 rounded-xl overflow-hidden border shadow-sm">
                  <img
                    src={
                      formData.imageUrl.startsWith("blob:")
                        ? formData.imageUrl
                        : `http://localhost:8080${formData.imageUrl}`
                    }
                    alt="Ảnh chính"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, imageUrl: "", imageFile: null })
                    }
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <Upload className="w-6 h-6 text-gray-500 mb-2" />
                  <span className="text-sm text-gray-600">Chọn ảnh chính</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setFormData({
                          ...formData,
                          imageFile: file,
                          imageUrl: URL.createObjectURL(file),
                        });
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Ảnh phụ</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formData.extraImageUrls.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`http://localhost:8080${img}`}
                      alt={`Ảnh phụ ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = formData.extraImageUrls.filter((_, i) => i !== index)
                        setFormData({ ...formData, extraImageUrls: newUrls })
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.newExtraImages?.map((file: File, index: number) => (
                    <div key={`new-${index}`} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Ảnh mới ${index + 1}`}
                        width={200}
                        height={150}
                        className="rounded-md object-cover w-full h-32"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 rounded-full"
                        onClick={() => handleRemoveExtraImage(index, true)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    id="extraImages"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleExtraImagesChange(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById("extraImages")?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Thêm ảnh phụ
                  </Button>
                </div>
              </div>
            </div>
          </div>



        </form>
      </main>
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
                router.push(`/admin/services/${serviceId}`)
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Rời khỏi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}
