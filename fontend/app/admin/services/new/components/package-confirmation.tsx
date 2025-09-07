import { Card, CardContent } from "@/components/ui/card"
import type { PackageFormData, GearSelection, Gear } from "@/app/api/package"
import { Tent, Sofa, UtensilsCrossed, MapPin, Calendar, Users, DollarSign } from "lucide-react"
import { useState } from "react";

interface PackageConfirmationProps {
  formData: PackageFormData
  images: File[];
  mainImageIndex?: number; // Ảnh chính mặc định 0
}
export interface ItineraryItem {
  day: string;
  title?: string;       // nếu có
  activities?: string[]; // nếu có nhiều hoạt động
}

export default function PackageConfirmation({ formData, images, mainImageIndex = 0 }: PackageConfirmationProps) {
  const formatPrice = (price: number | undefined) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price ?? 0);
  };
  if (images.length === 0) return null;
  const [mainIndex, setMainIndex] = useState<number>(mainImageIndex);
  return (
    <div className="space-y-12">
      <h2 className="text-xl font-semibold text-gray-800">Xác nhận thông tin gói dịch vụ</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin cơ bản</h3>
            <div className="space-y-4">
              {/* Tên dịch vụ & địa điểm */}
              <div>
                <h4 className="text-base font-medium text-gray-700">{formData.name}</h4>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{formData.location}</span>
                </div>
              </div>

              {/* Giá & Tag */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="text-sm">Giá</span>
                  </div>
                  <p className="font-medium text-green-600">{formatPrice(Number(formData.price))}</p>
                </div>
                {formData.tag && (
                  <div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">Tag</span>
                    </div>
                    <p className="font-medium text-blue-600">{formData.tag}</p>
                  </div>
                )}
              </div>

              {/* Duration & Capacity */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {/* Thời lượng */}
                {!formData.isExperience ? (
                  <div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">Thời lượng</span>
                    </div>
                    <p className="font-medium">
                      {formData.minDays && formData.maxDays
                        ? formData.minDays === formData.maxDays
                          ? `${formData.minDays} ngày`
                          : `${formData.minDays} - ${formData.maxDays} ngày`
                        : '-'}
                    </p>
                    <input
                      type="hidden"
                      name="duration"
                      value={
                        formData.minDays && formData.maxDays
                          ? `${formData.minDays}-${formData.maxDays}`
                          : ''
                      }
                    />
                  </div>
                ) : null}

                {/* Sức chứa */}
                {!formData.isExperience ? (
                  <div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">Sức chứa</span>
                    </div>
                    <p className="font-medium">
                      {formData.minCapacity && formData.maxCapacity
                        ? formData.minCapacity === formData.maxCapacity
                          ? `${formData.minCapacity} người`
                          : `${formData.minCapacity} - ${formData.maxCapacity} người`
                        : '-'}
                    </p>
                    <input
                      type="hidden"
                      name="capacity"
                      value={
                        formData.minCapacity && formData.maxCapacity
                          ? `${formData.minCapacity}-${formData.maxCapacity}`
                          : ''
                      }
                    />
                  </div>
                ) : null}

                {/* Nếu là trải nghiệm thì hiển thị số người / lượt */}
                {formData.isExperience && (
                  <div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">Lượt / Người</span>
                    </div>
                    <p className="font-medium">{formData.peoplePerSession || 1}</p>
                    <input
                      type="hidden"
                      name="peoplePerSession"
                      value={formData.peoplePerSession || 1}
                    />
                  </div>
                )}
              </div>



              {!formData.isExperience && (
                <>
                  {/* Min/Max Days */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-gray-600">Số ngày tối thiểu</span>
                      <p className="font-medium">{formData.minDays}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Số ngày tối đa</span>
                      <p className="font-medium">{formData.maxDays}</p>
                    </div>
                  </div>

                  {/* Min/Max Capacity */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-gray-600">Sức chứa tối thiểu</span>
                      <p className="font-medium">{formData.minCapacity}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Sức chứa tối đa</span>
                      <p className="font-medium">{formData.maxCapacity}</p>
                    </div>
                  </div>
                </>
              )}



              {/* Default Slots Per Day */}
              {/* {formData.defaultSlotsPerDay && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700">Số slot mặc định mỗi ngày</h4>
                  <p className="text-gray-600">{formData.defaultSlotsPerDay}</p>
                </div>
              )} */}

              {/* Highlights */}
              {formData.highlights && formData.highlights.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700">Điểm nổi bật</h4>
                  <ul className="list-disc pl-5 text-gray-600">
                    {formData.highlights.map((h: string, i: number) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Included */}
              {formData.included && formData.included.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700">Bao gồm</h4>
                  <ul className="list-disc pl-5 text-gray-600">
                    {formData.included.map((i: string, idx: number) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}



              {/* Itinerary */}
              {formData.itinerary && formData.itinerary.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700">Lịch trình</h4>
                  <ul className="list-disc pl-5 text-gray-600">
                    {formData.itinerary.map((it: ItineraryItem, idx: number) => (
                      <li key={idx}>
                        <strong>Ngày {it.day}:</strong> {it.title}
                        {it.activities && it.activities.length > 0 && (
                          <ul className="list-disc pl-5 text-gray-500">
                            {it.activities.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}


              {/* Description */}
              {formData.description && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700">Mô tả chi tiết</h4>
                  <p className="text-gray-600">{formData.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {images.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Hình ảnh</h3>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(images.length, 4)}, 1fr)`,
                }}
              >
                {images.map((img, idx) => {
                  const isMain = idx === mainIndex;
                  return (
                    <div
                      key={idx}
                      className={`w-full aspect-square rounded-lg overflow-hidden border cursor-pointer ${isMain ? "border-blue-500 border-2" : "border-gray-300"}`}
                      onClick={() => setMainIndex(idx)}
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`${formData.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isMain && (
                        <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                          Chính
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>

  );
}