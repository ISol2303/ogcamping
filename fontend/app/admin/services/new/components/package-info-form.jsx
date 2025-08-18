"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// import { PackageFormData } from "../page" // Không dùng type trực tiếp

/**
 * @param {{
 *   formData: { name: string, location: string, days: string, food_type: string, tent_type: string, activities: string, max_people: string, available_slots: string, price: string, description: string },
 *   setFormData: Function,
 *   image: File|null,
 *   setImage: Function
 * }} props
 */
export default function PackageInfoForm({ formData, setFormData, image, setImage }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (["image/jpeg", "image/png"].includes(file.type) && file.size <= 5 * 1024 * 1024) {
        setImage(file)
      } else {
        alert("Vui lòng chọn file JPEG hoặc PNG dưới 5MB")
        setImage(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Thông tin cơ bản về gói dịch vụ</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="text-gray-700">
            Tên gói dịch vụ <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Gói cắm trại Đà Lạt"
            className="mt-1 border-gray-300 focus:border-green-500"
            required
          />
        </div>
        <div>
          <Label htmlFor="location" className="text-gray-700">
            Địa điểm <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Đà Lạt, Lâm Đồng"
            className="mt-1 border-gray-300 focus:border-green-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="days" className="text-gray-700">
            Số ngày <span className="text-red-500">*</span>
          </Label>
          <Input
            id="days"
            name="days"
            type="number"
            value={formData.days}
            onChange={handleInputChange}
            placeholder="3"
            className="mt-1 border-gray-300 focus:border-green-500"
            required
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="max_people" className="text-gray-700">
            Số người tối đa <span className="text-red-500">*</span>
          </Label>
          <Input
            id="max_people"
            name="max_people"
            type="number"
            value={formData.max_people}
            onChange={handleInputChange}
            placeholder="10"
            className="mt-1 border-gray-300 focus:border-green-500"
            required
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="available_slots" className="text-gray-700">
            Số slot có sẵn <span className="text-red-500">*</span>
          </Label>
          <Input
            id="available_slots"
            name="available_slots"
            type="number"
            value={formData.available_slots}
            onChange={handleInputChange}
            placeholder="8"
            className="mt-1 border-gray-300 focus:border-green-500"
            required
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price" className="text-gray-700">
            Giá (VND) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="2000000"
            className="mt-1 border-gray-300 focus:border-green-500"
            required
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="image" className="text-gray-700">
            Hình ảnh (JPEG/PNG, max 5MB)
          </Label>
          <Input
            id="image"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
            className="mt-1 border-gray-300 focus:border-green-500"
          />
          {image && <p className="text-sm text-green-600 mt-1">Đã chọn: {image.name}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="food_type" className="text-gray-700">
          Loại thực phẩm
        </Label>
        <Input
          id="food_type"
          name="food_type"
          value={formData.food_type}
          onChange={handleInputChange}
          placeholder="Ăn chay, BBQ"
          className="mt-1 border-gray-300 focus:border-green-500"
        />
      </div>

      <div>
        <Label htmlFor="activities" className="text-gray-700">
          Hoạt động
        </Label>
        <Textarea
          id="activities"
          name="activities"
          value={formData.activities}
          onChange={handleInputChange}
          placeholder="Đốt lửa trại, leo núi, chèo thuyền"
          className="mt-1 border-gray-300 focus:border-green-500"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-gray-700">
          Mô tả chi tiết
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Mô tả chi tiết về gói dịch vụ cắm trại này..."
          className="mt-1 border-gray-300 focus:border-green-500"
          rows={4}
        />
      </div>
    </div>
  )
}