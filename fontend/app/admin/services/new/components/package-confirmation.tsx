import { Card, CardContent } from "@/components/ui/card"
import type { PackageFormData, GearSelection, Gear } from "@/app/api/package"
import { Tent, Sofa, UtensilsCrossed, MapPin, Calendar, Users, DollarSign } from "lucide-react"

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

  const formatPrice = (price: number | undefined) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
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
}