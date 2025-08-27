"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Import interfaces from package.ts to ensure consistency
import { Gear, GearSelection, Category, AreaData as Area } from "@/app/api/package"

// Define props interface
interface PackageSetupFormProps {
  gears: Gear[]
  gearSelections: GearSelection[]
  setGearSelections: React.Dispatch<React.SetStateAction<GearSelection[]>>
  onBack: () => void
  onNext: () => void
  categories: Category[]
  areas: Area[]
}

// Hình ảnh placeholder cho các khu vực
const areaImages: Record<string, string> = {
  "Trong lều": "/placeholder.svg?height=400&width=600&text=Khu vực trong lều",
  "Ngoài lều": "/placeholder.svg?height=400&width=600&text=Khu vực ngoài lều",
  "Bếp": "/placeholder.svg?height=400&width=600&text=Khu vực bếp",
}

// Hình ảnh placeholder chung cho thiết bị nếu không có hình cụ thể
const genericGearPlaceholder = "/placeholder.svg?height=100&width=100&text=Thiết bị"

export default function PackageSetupForm({
  gears,
  gearSelections,
  setGearSelections,
  onBack,
  onNext,
  categories,
  areas,
}: PackageSetupFormProps) {
  // Tạo categoryToAreaMap động từ categories
  const categoryToAreaMap: Record<string, string[]> = {};
  categories.forEach(category => {
    if (["Túi ngủ", "Đệm hơi"].includes(category.name)) {
      categoryToAreaMap[category.name] = ["Trong lều"];
    } else if (["Lều", "Bàn xếp", "Ghế xếp"].includes(category.name)) {
      categoryToAreaMap[category.name] = [ "Ngoài lều"];
    } else if (category.name === "Bếp") {
      categoryToAreaMap[category.name] = ["Bếp"];
    } else if (category.name === "Đèn") {
      categoryToAreaMap[category.name] = ["Ngoài lều", "Bếp"];
    } else {
      categoryToAreaMap[category.name] = ["Trong lều", "Ngoài lều", "Bếp"];
    }
  });

  const [currentArea, setCurrentArea] = useState<string>(areas[0]?.name || "Trong lều")
  const [displayImage, setDisplayImage] = useState<string>(areaImages[areas[0]?.name] || areaImages["Trong lều"])
  const [areaGearSelections, setAreaGearSelections] = useState<Record<string, Record<string, GearSelection[]>>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Hàm định dạng giá tiền
  const formatPrice = (price: number | undefined) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price ?? 0) // Use 0 if price is undefined
  }

  // Hàm tính tổng giá cho một danh mục trong khu vực
  const calculateCategoryTotal = (area: string, category: string) => {
    const selections = areaGearSelections[area]?.[category] || [];
    return selections.reduce((total, selection) => {
      const gear = gears.find(g => g._id === selection.gear_id);
      return total + (gear ? (gear.price ?? 0) * selection.gear_quantity : 0);
    }, 0);
  }

  // Kiểm tra nếu categories, areas hoặc gears trống
  if (!categories.length || !areas.length || !gears.length) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Bước 2: Thiết lập gói dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-700">
            {!categories.length && !areas.length && !gears.length
              ? "Không thể tải danh sách danh mục, khu vực và thiết bị. Vui lòng kiểm tra kết nối API hoặc thử lại sau."
              : !categories.length
              ? "Không thể tải danh sách danh mục. Vui lòng kiểm tra kết nối API hoặc thử lại sau."
              : !areas.length
              ? "Không thể tải danh sách khu vực. Vui lòng kiểm tra kết nối API hoặc thử lại sau."
              : "Không thể tải danh sách thiết bị. Vui lòng kiểm tra kết nối API hoặc thử lại sau."}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hàm lọc thiết bị dựa trên khu vực và danh mục
  const getFilteredGears = useCallback((area: string, category: string) => {
    const filtered = gears.filter((gear) => {
      const allowedAreas = categoryToAreaMap[gear.category] || categoryToAreaMap["Khác"] || [];
      return gear.category === category && allowedAreas.includes(area);
    });
    console.log(`Thiết bị khả dụng cho ${area} - ${category}:`, filtered); // Debug log
    return filtered;
  }, [gears, categoryToAreaMap]);

  // Hàm cập nhật hình ảnh dựa trên khu vực hoặc thiết bị được chọn
  const updateDisplayImageBasedOnArea = useCallback((area: string) => {
    const areaSelections = areaGearSelections[area] || {};
    const allSelections = Object.values(areaSelections).flat();
    if (allSelections.length > 0 && allSelections[0].gear_id) {
      const selectedGear = gears.find((g) => g._id === allSelections[0].gear_id);
      setDisplayImage(selectedGear?.imageUrl ? `http://localhost:8080${selectedGear.imageUrl}` : genericGearPlaceholder);
    } else {
      setDisplayImage(areaImages[area] || genericGearPlaceholder);
    }
  }, [gears, areaGearSelections]);

  // Cập nhật hình ảnh khi khu vực thay đổi
  useEffect(() => {
    updateDisplayImageBasedOnArea(currentArea);
  }, [currentArea, areaGearSelections, updateDisplayImageBasedOnArea]);

  const handleGearChange = useCallback(
    (area: string, category: string, index: number, field: "gear_id" | "gear_quantity", value: string | number) => {
      if (field === "gear_quantity") {
        const numValue = Number(value);
        if (numValue < 1 || isNaN(numValue)) {
          setErrorMessage("Số lượng phải là một số lớn hơn hoặc bằng 1.");
          return;
        }
      }
      setErrorMessage(null);
      setAreaGearSelections((prev) => {
        const updatedAreaSelections = { ...prev };
        const areaSelections = { ...(updatedAreaSelections[area] || {}) };
        const categorySelections = [...(areaSelections[category] || [])];
        categorySelections[index] = { ...categorySelections[index], [field]: value };
        areaSelections[category] = categorySelections;
        updatedAreaSelections[area] = areaSelections;

        // Cập nhật hình ảnh khi thay đổi gear_id
        if (field === "gear_id" && gears.length > 0 && area === currentArea) {
          const selectedGear = gears.find((g) => g._id === value);
          setDisplayImage(selectedGear?.imageUrl ? `http://localhost:8080${selectedGear.imageUrl}` : genericGearPlaceholder);
        }

        return updatedAreaSelections;
      });
    },
    [gears, currentArea],
  );

  const addGearSelection = useCallback((area: string, category: string) => {
    const filteredGears = getFilteredGears(area, category);
    if (filteredGears.length === 0) {
      setErrorMessage(`Không có thiết bị nào khả dụng cho danh mục ${category} trong khu vực ${area}.`);
      return;
    }
    setErrorMessage(null);
    setAreaGearSelections((prev) => {
      const updatedAreaSelections = { ...prev };
      const areaSelections = { ...(updatedAreaSelections[area] || {}) };
      areaSelections[category] = [...(areaSelections[category] || []), { gear_id: "", gear_quantity: 1, area }];
      updatedAreaSelections[area] = areaSelections;
      return updatedAreaSelections;
    });
    // Cập nhật lại hình ảnh khi thêm thiết bị mới
    updateDisplayImageBasedOnArea(area);
  }, [updateDisplayImageBasedOnArea, getFilteredGears]);

  const removeGearSelection = useCallback(
    (area: string, category: string, index: number) => {
      setAreaGearSelections((prev) => {
        const updatedAreaSelections = { ...prev };
        const areaSelections = { ...(updatedAreaSelections[area] || {}) };
        areaSelections[category] = (areaSelections[category] || []).filter((_, i) => i !== index);
        updatedAreaSelections[area] = areaSelections;
        return updatedAreaSelections;
      });
      // Cập nhật lại hình ảnh khi xóa thiết bị
      updateDisplayImageBasedOnArea(area);
      setErrorMessage(null);
    },
    [updateDisplayImageBasedOnArea]
  );

  const handleNextStep = () => {
    // Kiểm tra xem có thiết bị nào được chọn mà chưa có gear_id
    const flattenedGearSelections: GearSelection[] = [];
    Object.values(areaGearSelections).forEach((areaSelections) => {
      Object.values(areaSelections).forEach((categorySelections) => {
        flattenedGearSelections.push(...categorySelections);
      });
    });
    if (flattenedGearSelections.some(selection => !selection.gear_id)) {
      setErrorMessage("Vui lòng chọn thiết bị cho tất cả các mục trước khi tiếp tục.");
      return;
    }
    setErrorMessage(null);
    setGearSelections(flattenedGearSelections);
    onNext();
  };

  useEffect(() => {
    // Khởi tạo areaGearSelections dựa trên danh sách khu vực từ API
    const initialAreaSelections: Record<string, Record<string, GearSelection[]>> = {};
    areas.forEach(area => {
      initialAreaSelections[area.name] = {};
      categories.forEach(category => {
        if ((categoryToAreaMap[category.name] || categoryToAreaMap["Khác"] || []).includes(area.name)) {
          initialAreaSelections[area.name][category.name] = [];
        }
      });
    });
    gearSelections.forEach((selection) => {
      const gear = gears.find(g => g._id === selection.gear_id);
      if (gear && initialAreaSelections[selection.area] && initialAreaSelections[selection.area][gear.category]) {
        initialAreaSelections[selection.area][gear.category].push({ ...selection });
      }
    });
    setAreaGearSelections(initialAreaSelections);

    // Đặt lại hình ảnh khi dữ liệu gearSelections thay đổi
    updateDisplayImageBasedOnArea(currentArea);
  }, [gearSelections, currentArea, areas, categories, gears]);

  // Lấy danh sách danh mục hợp lệ cho mỗi khu vực
  const getValidCategoriesForArea = (area: string) => {
    return categories.filter(category => {
      const allowedAreas = categoryToAreaMap[category.name] || categoryToAreaMap["Khác"] || [];
      return allowedAreas.includes(area);
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Bước 2: Thiết lập gói dịch vụ</CardTitle>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md text-sm mb-6">{errorMessage}</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Khu vực hiển thị hình ảnh */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Hình ảnh minh họa</h3>
            <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-md overflow-hidden">
              <Image
                src={displayImage}
                alt="Khu vực thiết lập"
                fill
                style={{ objectFit: "contain" }}
                className="rounded-md"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Hình ảnh này sẽ thay đổi dựa trên khu vực và thiết bị bạn chọn.
            </p>
          </div>

          {/* Khu vực chọn thiết bị */}
          <div>
            <Tabs value={currentArea} onValueChange={(value) => setCurrentArea(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {areas.map((area) => (
                  <TabsTrigger key={area._id} value={area.name}>
                    {area.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {areas.map((area) => (
                <TabsContent key={area._id} value={area.name} className="mt-4">
                  <h4 className="text-md font-semibold mb-3">Thiết bị {area.name}</h4>
                  {getValidCategoriesForArea(area.name).length === 0 && (
                    <p className="text-sm text-gray-500 mb-4">Chưa có danh mục nào khả dụng.</p>
                  )}
                  {getValidCategoriesForArea(area.name).map((category) => (
                    <div key={category._id} className="mb-6">
                      <h5 className="text-sm font-medium mb-2">{category.name}</h5>
                      {(areaGearSelections[area.name]?.[category.name] || []).length === 0 && (
                        <p className="text-sm text-gray-500 mb-2">Chưa có thiết bị nào được chọn trong danh mục này.</p>
                      )}
                      {(areaGearSelections[area.name]?.[category.name] || []).map((selection, index) => (
                        <div key={`${area.name}-${category.name}-${index}`} className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <Select
                              value={selection.gear_id}
                              onValueChange={(value) => handleGearChange(area.name, category.name, index, "gear_id", value)}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-green-500">
                                <SelectValue placeholder="Chọn thiết bị" />
                              </SelectTrigger>
                              <SelectContent>
                                {getFilteredGears(area.name, category.name).length === 0 ? (
                                  <SelectItem value="" disabled>
                                    Không có thiết bị khả dụng
                                  </SelectItem>
                                ) : (
                                  getFilteredGears(area.name, category.name).map((gear) => (
                                    <SelectItem key={gear._id} value={gear._id}>
                                      {gear.name} ({formatPrice(gear.price)})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              value={selection.gear_quantity}
                              onChange={(e) =>
                                handleGearChange(area.name, category.name, index, "gear_quantity", Number(e.target.value))
                              }
                              placeholder="Số lượng"
                              className="border-gray-300 focus:border-green-500"
                              min="1"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGearSelection(area.name, category.name, index)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addGearSelection(area.name, category.name)}
                        className="mt-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={getFilteredGears(area.name, category.name).length === 0}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm thiết bị
                      </Button>
                      {(areaGearSelections[area.name]?.[category.name] || []).length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                          Tổng giá danh mục {category.name}: {formatPrice(calculateCategoryTotal(area.name, category.name))}
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onBack}>
            Quay lại
          </Button>
          <Button onClick={handleNextStep}>Tiếp theo</Button>
        </div> */}
      </CardContent>
    </Card>
  )
}