"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function PackageInfoForm({ formData, setFormData, images, setImages }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }


  const [mainImageIndex, setMainImageIndex] = React.useState(0);

  const handleImagesChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages(files);
    setMainImageIndex(0); // mặc định ảnh đầu tiên là chính
  };
  const selectMainImage = (idx) => setMainImageIndex(idx);
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(value));
  };

  const parseCurrency = (value) => {
    return value.replace(/\D/g, ""); // bỏ hết ký tự không phải số
  };

  return (
    <div className="space-y-10">
      {/* Ảnh minh họa */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Ảnh minh họa</h2>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Upload box */}
          <label className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
            <span className="text-xs text-gray-500">Chọn ảnh</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setImages([...images, ...Array.from(e.target.files)]);
                }
              }}
              className="hidden"
            />
          </label>

          {/* Preview ảnh */}
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative w-28 h-28 rounded-lg overflow-hidden border ${idx === mainImageIndex ? "border-blue-500 border-2" : "border-gray-300"}`}
            >
              {/* Nút xóa */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // không trigger chọn ảnh chính
                  const newImages = images.filter((_, i) => i !== idx);
                  setImages(newImages);

                  // Nếu xóa ảnh chính thì reset lại mainImageIndex
                  if (idx === mainImageIndex) {
                    setMainImageIndex(newImages.length > 0 ? 0 : -1);
                  } else if (idx < mainImageIndex) {
                    // dịch index ảnh chính về trước 1
                    setMainImageIndex(mainImageIndex - 1);
                  }
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>

              {/* Hình ảnh */}
              <img
                src={URL.createObjectURL(img)}
                alt={`Preview ${idx}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setMainImageIndex(idx)}
              />

              {/* Badge chính */}
              {idx === mainImageIndex && (
                <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                  Chính
                </span>
              )}
            </div>
          ))}
        </div>
      </section>





      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Tên gói dịch vụ <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Gói cắm trại gia đình"
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Địa điểm <span className="text-red-500">*</span></Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Củ chi, TP.HCM"
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Giá (VND)</Label>
            <Input
              id="price"
              name="price"
              type="text"
              value={formatCurrency(formData.price)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseCurrency(e.target.value),
                })
              }
              placeholder="2.000.000"
            />
          </div>
          <div>
            <Label htmlFor="tag">Tag</Label>
            <select
              id="tag"
              name="tag"
              value={formData.tag}
              onChange={handleInputChange}
              className="w-full border-gray-300 rounded-lg"
            >
              <option value="">--Chọn--</option>
              <option value="POPULAR">Phổ biến</option>
              <option value="NEW">Mới</option>
              <option value="DISCOUNT">Khuyến mãi</option>
            </select>
          </div>
        </div>
      </section>

      {/* 2. Thời lượng & Sức chứa */}
      {/* Chế độ trải nghiệm */}
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isExperience"
            name="isExperience"
            checked={formData.isExperience}
            onChange={(e) =>
              setFormData({ ...formData, isExperience: e.target.checked })
            }
          />
          <label htmlFor="isExperience" className="font-medium">
            Đây là dịch vụ trải nghiệm (không tính theo ngày)
          </label>
        </div>

        {/* Nếu không phải trải nghiệm, hiển thị Min/Max Days và Capacity */}
        {!formData.isExperience && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div>
                <Label htmlFor="minDays">Số ngày tối thiểu</Label>
                <Input
                  id="minDays"
                  name="minDays"
                  type="number"
                  min={1}
                  value={formData.minDays}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="maxDays">Số ngày tối đa</Label>
                <Input
                  id="maxDays"
                  name="maxDays"
                  type="number"
                  min={1}
                  value={formData.maxDays}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div>
                <Label htmlFor="minCapacity">Số người tối thiểu</Label>
                <Input
                  id="minCapacity"
                  name="minCapacity"
                  type="number"
                  min={1}
                  value={formData.minCapacity || 1}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="maxCapacity">Số người tối đa</Label>
                <Input
                  id="maxCapacity"
                  name="maxCapacity"
                  type="number"
                  min={1}
                  value={formData.maxCapacity || 1}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </>
        )}

        {/* Nếu là trải nghiệm, chỉ hiển thị People / Session */}
        {formData.isExperience && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div>
              <Label htmlFor="peoplePerSession">Số người / lượt</Label>
              <Input
                id="peoplePerSession"
                name="peoplePerSession"
                type="number"
                min={1}
                value={formData.peoplePerSession}
                onChange={handleInputChange}
                placeholder="4"
              />
            </div>
          </div>
        )}
      </div>

      {!formData.isExperience && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quy định thêm người</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowExtraPeople"
                name="allowExtraPeople"
                checked={formData.allowExtraPeople}
                onChange={(e) =>
                  setFormData({ ...formData, allowExtraPeople: e.target.checked })
                }
              />
              <label htmlFor="allowExtraPeople">Cho phép thêm người</label>
            </div>

            {formData.allowExtraPeople && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div>
                  <Label htmlFor="extraFeePerPerson">Phí phụ thu / người (VND)</Label>
                  <Input
                    id="extraFeePerPerson"
                    name="extraFeePerPerson"
                    type="text"
                    value={formatCurrency(formData.extraFeePerPerson || 0)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        extraFeePerPerson: parseCurrency(e.target.value),
                      })
                    }
                    placeholder="200,000"
                    required={formData.allowExtraPeople}
                  />
                </div>

                <div>
                  <Label htmlFor="maxExtraPeople">Số người được thêm</Label>
                  <Input
                    id="maxExtraPeople"
                    name="maxExtraPeople"
                    type="number"
                    value={formData.maxExtraPeople}
                    onChange={handleInputChange}
                    placeholder="2"
                    min={0}
                    required={formData.allowExtraPeople}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}


      {/* 5. Thông tin bổ sung */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Thông tin bổ sung</h2>

        {/* Highlights */}
        <div>
          <Label>Điểm nổi bật</Label>
          <div className="space-y-2 mt-2">
            {formData.highlights.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newHighlights = [...formData.highlights];
                    newHighlights[index] = e.target.value;
                    setFormData({ ...formData, highlights: newHighlights });
                  }}
                  placeholder={`Điểm nổi bật ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newHighlights = formData.highlights.filter((_, i) => i !== index);
                    setFormData({ ...formData, highlights: newHighlights });
                  }}
                  className="text-red-500 font-bold hover:text-red-700 transition"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, ""] })}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              + Thêm điểm nổi bật
            </button>
          </div>
        </div>

        {/* Included */}
        <div>
          <Label>Bao gồm</Label>
          <div className="space-y-2 mt-2">
            {formData.included.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newIncluded = [...formData.included];
                    newIncluded[index] = e.target.value;
                    setFormData({ ...formData, included: newIncluded });
                  }}
                  placeholder={`Bao gồm ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newIncluded = formData.included.filter((_, i) => i !== index);
                    setFormData({ ...formData, included: newIncluded });
                  }}
                  className="text-red-500 font-bold hover:text-red-700 transition"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, included: [...formData.included, ""] })}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              + Thêm mục bao gồm
            </button>
          </div>
        </div>

        {/* Itinerary */}
        <div>
          <Label>Lịch trình</Label>
          <div className="space-y-3 mt-2">
            {formData.itinerary.map((day, dayIndex) => (
              <div key={dayIndex} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                <div className="flex gap-2 items-center">
                  <Input
                    value={day.day}
                    onChange={(e) => {
                      const newItinerary = [...formData.itinerary];
                      newItinerary[dayIndex].day = e.target.value;
                      setFormData({ ...formData, itinerary: newItinerary });
                    }}
                    placeholder="Ngày"
                    className="w-16"
                  />
                  <Input
                    value={day.title}
                    onChange={(e) => {
                      const newItinerary = [...formData.itinerary];
                      newItinerary[dayIndex].title = e.target.value;
                      setFormData({ ...formData, itinerary: newItinerary });
                    }}
                    placeholder="Tiêu đề"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newItinerary = formData.itinerary.filter((_, i) => i !== dayIndex);
                      setFormData({ ...formData, itinerary: newItinerary });
                    }}
                    className="text-red-500 font-bold hover:text-red-700 transition"
                  >
                    ×
                  </button>
                </div>

                {/* Activities */}
                <div className="space-y-1 pl-4">
                  {day.activities.map((act, actIndex) => (
                    <div key={actIndex} className="flex gap-2 items-center">
                      <Input
                        value={act}
                        onChange={(e) => {
                          const newItinerary = [...formData.itinerary];
                          newItinerary[dayIndex].activities[actIndex] = e.target.value;
                          setFormData({ ...formData, itinerary: newItinerary });
                        }}
                        placeholder={`Hoạt động ${actIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItinerary = [...formData.itinerary];
                          newItinerary[dayIndex].activities = newItinerary[dayIndex].activities.filter(
                            (_, i) => i !== actIndex
                          );
                          setFormData({ ...formData, itinerary: newItinerary });
                        }}
                        className="text-red-500 font-bold hover:text-red-700 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newItinerary = [...formData.itinerary];
                      newItinerary[dayIndex].activities.push("");
                      setFormData({ ...formData, itinerary: newItinerary });
                    }}
                    className="text-sm text-blue-500 hover:text-blue-600 mt-1 ml-4"
                  >
                    + Thêm hoạt động
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  itinerary: [...formData.itinerary, { day: "", title: "", activities: [""] }],
                })
              }
              className="text-sm text-blue-500 hover:text-blue-600 mt-1"
            >
              + Thêm ngày mới
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Mô tả chi tiết</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả chi tiết về gói dịch vụ..."
            rows={4}
          />
        </div>
      </section>


    </div>
  )
}