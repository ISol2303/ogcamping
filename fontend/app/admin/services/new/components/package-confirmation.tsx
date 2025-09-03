import { Card, CardContent } from "@/components/ui/card"
import type { PackageFormData, GearSelection, Gear } from "@/app/api/package"
import { Tent, Sofa, UtensilsCrossed, MapPin, Calendar, Users, DollarSign } from "lucide-react"
<<<<<<< HEAD

interface PackageConfirmationProps {
  formData: PackageFormData
  image: File | null
  gearSelections: GearSelection[]
  gears: Gear[]
}

export default function PackageConfirmation({ formData, image, gearSelections, gears }: PackageConfirmationProps) {
  const getGearName = (id: string) => {
    const gear = gears.find((g) => g._id === id)
    return gear ? gear.name : "Thiết bị không xác định"
  }

=======
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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
  const formatPrice = (price: number | undefined) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
<<<<<<< HEAD
    }).format(price ?? 0)
  }

  const getGearsByAreaAndCategory = (area: "Trong lều" | "Ngoài lều" | "Bếp") => {
    const areaSelections = gearSelections.filter((selection) => selection.area === area);
    const groupedByCategory: Record<string, GearSelection[]> = {};
    
    areaSelections.forEach((selection) => {
      const gear = gears.find((g) => g._id === selection.gear_id);
      const category = gear?.category || "Khác";
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      groupedByCategory[category].push(selection);
    });
    
    return groupedByCategory;
  }

  const calculateCategoryTotal = (area: string, category: string) => {
    const selections = gearSelections.filter((selection) => {
      const gear = gears.find((g) => g._id === selection.gear_id);
      return gear?.category === category && selection.area === area;
    });
    return selections.reduce((total, selection) => {
      const gear = gears.find((g) => g._id === selection.gear_id);
      return total + (gear ? (gear.price ?? 0) * selection.gear_quantity : 0);
    }, 0);
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">Xác nhận thông tin gói dịch vụ</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin cơ bản</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-700">{formData.name}</h4>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{formData.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">Thời gian</span>
                    </div>
                    <p className="font-medium">{formData.days} ngày</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">Số người</span>
                    </div>
                    <p className="font-medium">{formData.max_people} người</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="text-sm">Giá</span>
                    </div>
                    <p className="font-medium text-green-600">{formatPrice(Number(formData.price))}</p>
                  </div>
                </div>

                {formData.food_type && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700">Loại thực phẩm</h4>
                    <p className="text-gray-600">{formData.food_type}</p>
                  </div>
                )}

                {formData.tent_type && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700">Loại lều</h4>
                    <p className="text-gray-600">{formData.tent_type}</p>
                  </div>
                )}

                {formData.activities && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700">Hoạt động</h4>
                    <p className="text-gray-600">{formData.activities}</p>
                  </div>
                )}

                {formData.description && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700">Mô tả chi tiết</h4>
                    <p className="text-gray-600">{formData.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {image && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Hình ảnh</h3>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                    alt={formData.name}
                    className="w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Tent className="w-5 h-5 mr-2" />
                Thiết bị Trong lều
              </h3>
              {Object.keys(getGearsByAreaAndCategory("Trong lều")).length > 0 ? (
                Object.entries(getGearsByAreaAndCategory("Trong lều")).map(([category, selections]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                    {selections.length > 0 ? (
                      <ul className="space-y-2">
                        {selections.map((selection, index) => {
                          const gear = gears.find((g) => g._id === selection.gear_id);
                          return (
                            <li
                              key={index}
                              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                            >
                              <span>{getGearName(selection.gear_id)} ({formatPrice(gear?.price)})</span>
                              <span className="font-medium">{selection.gear_quantity} cái</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Không có thiết bị nào trong danh mục này</p>
                    )}
                    {selections.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Tổng giá danh mục {category}: {formatPrice(calculateCategoryTotal("Trong lều", category))}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Không có thiết bị nào trong lều</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Sofa className="w-5 h-5 mr-2" />
                Thiết bị Ngoài lều
              </h3>
              {Object.keys(getGearsByAreaAndCategory("Ngoài lều")).length > 0 ? (
                Object.entries(getGearsByAreaAndCategory("Ngoài lều")).map(([category, selections]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                    {selections.length > 0 ? (
                      <ul className="space-y-2">
                        {selections.map((selection, index) => {
                          const gear = gears.find((g) => g._id === selection.gear_id);
                          return (
                            <li
                              key={index}
                              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                            >
                              <span>{getGearName(selection.gear_id)} ({formatPrice(gear?.price)})</span>
                              <span className="font-medium">{selection.gear_quantity} cái</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Không có thiết bị nào trong danh mục này</p>
                    )}
                    {selections.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Tổng giá danh mục {category}: {formatPrice(calculateCategoryTotal("Ngoài lều", category))}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Không có thiết bị nào ngoài lều</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <UtensilsCrossed className="w-5 h-5 mr-2" />
                Thiết bị khu vực bếp
              </h3>
              {Object.keys(getGearsByAreaAndCategory("Bếp")).length > 0 ? (
                Object.entries(getGearsByAreaAndCategory("Bếp")).map(([category, selections]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                    {selections.length > 0 ? (
                      <ul className="space-y-2">
                        {selections.map((selection, index) => {
                          const gear = gears.find((g) => g._id === selection.gear_id);
                          return (
                            <li
                              key={index}
                              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                            >
                              <span>{getGearName(selection.gear_id)} ({formatPrice(gear?.price)})</span>
                              <span className="font-medium">{selection.gear_quantity} cái</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Không có thiết bị nào trong danh mục này</p>
                    )}
                    {selections.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Tổng giá danh mục {category}: {formatPrice(calculateCategoryTotal("Bếp", category))}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Không có thiết bị nào ở khu vực bếp</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
=======
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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
}