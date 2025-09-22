"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, Upload } from "lucide-react"

interface ImageFormProps {
  imageUrl: string
  extraImageUrls: string[]
  onChange: (data: { imageUrl: string; extraImageUrls: string[] }) => void
}

export default function ImageForm({ imageUrl, extraImageUrls, onChange }: ImageFormProps) {
  const [mainImage, setMainImage] = useState(imageUrl)
  const [subImages, setSubImages] = useState(extraImageUrls)

  const getImagePath = (fileName: string) =>
    `http://localhost:8080/uploads/services/${fileName}`

  const handleMainRemove = () => {
    setMainImage("")
    onChange({ imageUrl: "", extraImageUrls: subImages })
  }

  const handleSubRemove = (index: number) => {
    const updated = subImages.filter((_, i) => i !== index)
    setSubImages(updated)
    onChange({ imageUrl: mainImage, extraImageUrls: updated })
  }

  const handleSubAdd = () => {
    // TODO: mở input file để chọn thêm ảnh phụ
    // demo tạm push 1 ảnh test
    const updated = [...subImages, "demo.jpg"]
    setSubImages(updated)
    onChange({ imageUrl: mainImage, extraImageUrls: updated })
  }

  return (
    <div className="space-y-4">
      {/* Ảnh chính */}
      <div>
        <Label className="mb-2 block">Ảnh chính</Label>
        {mainImage ? (
          <div className="relative w-40 h-40">
            <img
              src={getImagePath(mainImage)}
              alt="Main"
              className="w-full h-full object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={handleMainRemove}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-1" />
            Chọn ảnh chính
          </Button>
        )}
      </div>

      {/* Ảnh phụ */}
      <div>
        <Label className="mb-2 block">Ảnh phụ</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {subImages.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={getImagePath(img)}
                alt={`Extra ${index}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleSubRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 flex items-center gap-2"
          onClick={handleSubAdd}
        >
          <Upload className="w-4 h-4" />
          Thêm ảnh phụ
        </Button>
      </div>
    </div>
  )
}
