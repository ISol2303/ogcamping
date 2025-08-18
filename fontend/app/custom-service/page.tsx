"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tent, Plus, Minus, Trash2, CheckCircle, Sparkles, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function CustomServicePage() {
  const [serviceData, setServiceData] = useState({
    name: "",
    location: "",
    duration: 1,
    people: 2,
    startDate: "",
    description: "",
    accommodation: "",
    activities: [] as string[],
    meals: [] as string[],
  })

  const [selectedEquipment, setSelectedEquipment] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(1)

   const accommodationTypes = [
    { value: "tent", label: "Lều cắm trại", price: 0 },
    { value: "cabin", label: "Cabin gỗ", price: 200000 },
    { value: "glamping", label: "Glamping", price: 500000 },
  ]
  // Available equipment
  const equipment = [
    {
      id: 1,
      name: "Lều cắm trại 2 người",
      category: "Lều",
      price: 120000,
      priceUnit: "ngày",
      description: "Lều nhỏ gọn cho 2 người",
      maxQuantity: 10,
    },
    {
      id: 2,
      name: "Lều cắm trại 4 người",
      category: "Lều",
      price: 150000,
      priceUnit: "ngày",
      description: "Lều rộng rãi cho 4 người",
      maxQuantity: 8,
    },
    {
      id: 3,
      name: "Bếp gas mini",
      category: "Nấu ăn",
      price: 80000,
      priceUnit: "ngày",
      description: "Bếp gas nhỏ gọn, tiết kiệm",
      maxQuantity: 15,
    },
    {
      id: 4,
      name: "Bộ nồi cắm trại",
      category: "Nấu ăn",
      price: 100000,
      priceUnit: "ngày",
      description: "Bộ nồi nhôm nhẹ, chống dính",
      maxQuantity: 12,
    },
    {
      id: 5,
      name: "Đèn pin LED",
      category: "Chiếu sáng",
      price: 50000,
      priceUnit: "ngày",
      description: "Đèn pin siêu sáng, pin lâu",
      maxQuantity: 20,
    },
    {
      id: 6,
      name: "Đèn lồng cắm trại",
      category: "Chiếu sáng",
      price: 70000,
      priceUnit: "ngày",
      description: "Đèn lồng chiếu sáng khu vực",
      maxQuantity: 15,
    },
    {
      id: 7,
      name: "Túi ngủ mùa hè",
      category: "Ngủ nghỉ",
      price: 100000,
      priceUnit: "ngày",
      description: "Túi ngủ nhẹ cho thời tiết ấm",
      maxQuantity: 20,
    },
    {
      id: 8,
      name: "Túi ngủ mùa đông",
      category: "Ngủ nghỉ",
      price: 150000,
      priceUnit: "ngày",
      description: "Túi ngủ ấm cho thời tiết lạnh",
      maxQuantity: 10,
    },
    {
      id: 9,
      name: "Bàn gấp",
      category: "Nội thất",
      price: 120000,
      priceUnit: "ngày",
      description: "Bàn gấp gọn, chắc chắn",
      maxQuantity: 8,
    },
    {
      id: 10,
      name: "Ghế gấp",
      category: "Nội thất",
      price: 80000,
      priceUnit: "ngày",
      description: "Ghế gấp thoải mái",
      maxQuantity: 20,
    },
  ]

  const activities = [
    "Trekking/Leo núi",
    "Câu cá",
    "BBQ/Nướng",
    "Chụp ảnh thiên nhiên",
    "Quan sát sao",
    "Yoga/Thiền",
    "Team building",
    "Lặn ngắm san hô",
    "Kayak",
    "Đi bộ đường dài",
  ]

  const mealOptions = [
    { value: "breakfast", label: "Ăn sáng", price: 50000 },
    { value: "lunch", label: "Ăn trưa", price: 80000 },
    { value: "dinner", label: "Ăn tối", price: 100000 },
    { value: "bbq", label: "BBQ đặc biệt", price: 150000 },
  ]

  const addEquipment = (item: any) => {
    const existing = selectedEquipment.find((eq) => eq.id === item.id)
    if (existing) {
      if (existing.quantity < item.maxQuantity) {
        setSelectedEquipment((prev) =>
          prev.map((eq) => (eq.id === item.id ? { ...eq, quantity: eq.quantity + 1 } : eq)),
        )
      }
    } else {
      setSelectedEquipment((prev) => [...prev, { ...item, quantity: 1 }])
    }
  }

  const removeEquipment = (id: number) => {
    setSelectedEquipment((prev) => prev.filter((eq) => eq.id !== id))
  }

  const updateEquipmentQuantity = (id: number, change: number) => {
    setSelectedEquipment((prev) =>
      prev
        .map((eq) => {
          if (eq.id === id) {
            const newQuantity = eq.quantity + change
            if (newQuantity <= 0) return null
            if (newQuantity > eq.maxQuantity) return eq
            return { ...eq, quantity: newQuantity }
          }
          return eq
        })
        .filter(Boolean),
    )
  }

  const calculateTotal = () => {
    const equipmentTotal = selectedEquipment.reduce(
      (sum, item) => sum + item.price * item.quantity * serviceData.duration,
      0,
    )

    const accommodationPrice = accommodationTypes.find((acc) => acc.value === serviceData.accommodation)?.price || 0
    const accommodationTotal = accommodationPrice * serviceData.people * serviceData.duration

    const mealTotal = serviceData.meals.reduce((sum, meal) => {
      const mealPrice = mealOptions.find((m) => m.value === meal)?.price || 0
      return sum + mealPrice * serviceData.people * serviceData.duration
    }, 0)

    const basePrice = 200000 * serviceData.people * serviceData.duration // Base service fee

    return basePrice + equipmentTotal + accommodationTotal + mealTotal
  }

  const handleActivityToggle = (activity: string) => {
    setServiceData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }))
  }

const handleMealToggle = (meal: string) => {
    setServiceData((prev) => ({
      ...prev,
      meals: prev.meals.includes(meal.value) ? prev.meals.filter((m) => m !== meal.value) : [...prev.meals, meal.value],
    }))
  }


  const handleSubmit = () => {
    const customService = {
      ...serviceData,
      equipment: selectedEquipment,
      totalPrice: calculateTotal(),
      createdAt: new Date().toISOString(),
    }

    console.log("Custom service created:", customService)
    setCurrentStep(4) // Success step
  }

  const categories = [...new Set(equipment.map((item) => item.category))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <img src="/ai-avatar.jpg" className="h-12 w-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
           <span className="text-3xl font-bold text-green-800">OG Camping</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/services" className="text-gray-600 hover:text-green-600 transition-colors">
              Dịch vụ
            </Link>
            <Link href="/equipment" className="text-gray-600 hover:text-green-600 transition-colors">
              Thuê thiết bị
            </Link>
            <Link href="/ai-consultant" className="text-gray-600 hover:text-green-600 transition-colors">
              Tư vấn AI
            </Link>
            <Link
              href="/about"
              className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium relative group"
            >
              Về chúng tôi
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="text-gray-800 hover:text-green-600 transition-all duration-300 font-medium relative group"
            >
              Liên hệ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/register">Đăng ký</Link>
            </Button>
          </div>
        </div>
      </header>

     <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Tạo gói dịch vụ riêng</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Thiết kế chuyến cắm trại hoàn hảo theo sở thích của bạn với thiết bị và dịch vụ tùy chọn
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-80 h-1 mx-5 ${currentStep > step ? "bg-green-600" : "bg-gray-200"}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? "text-green-600 font-medium" : "text-gray-500"}>Thông tin</span>
            <span className={currentStep >= 2 ? "text-green-600 font-medium" : "text-gray-500"}>Xác nhận</span>
            <span className={currentStep >= 3 ? "text-green-600 font-medium" : "text-gray-500"}>Thanh toán</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>Thiết lập thông tin chuyến cắm trại của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Tên gói dịch vụ *</Label>
                      <Input
                        id="name"
                        value={serviceData.name}
                        onChange={(e) => setServiceData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ví dụ: Cắm trại núi Sapa của tôi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Địa điểm *</Label>
                      <Select
                        value={serviceData.location}
                        onValueChange={(value) => setServiceData((prev) => ({ ...prev, location: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn địa điểm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sapa">Sapa, Lào Cai</SelectItem>
                          <SelectItem value="dalat">Đà Lạt, Lâm Đồng</SelectItem>
                          <SelectItem value="phuquoc">Phú Quốc, Kiên Giang</SelectItem>
                          <SelectItem value="cattien">Cát Tiên, Đồng Nai</SelectItem>
                          <SelectItem value="muine">Mũi Né, Bình Thuận</SelectItem>
                          <SelectItem value="halong">Hạ Long, Quảng Ninh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration">Số ngày</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setServiceData((prev) => ({ ...prev, duration: Math.max(1, prev.duration - 1) }))
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input className="text-center" value={serviceData.duration} readOnly />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setServiceData((prev) => ({ ...prev, duration: Math.min(10, prev.duration + 1) }))
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="people">Số người</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setServiceData((prev) => ({ ...prev, people: Math.max(1, prev.people - 1) }))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input className="text-center" value={serviceData.people} readOnly />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setServiceData((prev) => ({ ...prev, people: Math.min(20, prev.people + 1) }))}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Ngày bắt đầu</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={serviceData.startDate}
                        onChange={(e) => setServiceData((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                  </div>

                    <div>
                    <Label>Loại chỗ ở</Label>
                    <div className="grid md:grid-cols-3 gap-3 mt-2">
                      {accommodationTypes.map((type) => (
                        <div
                          key={type.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            serviceData.accommodation === type.value
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setServiceData((prev) => ({ ...prev, accommodation: type.value }))}
                        >
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="text-sm text-gray-600">+{type.price.toLocaleString("vi-VN")}đ/người/ngày</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Hoạt động mong muốn</Label>
                    <div className="grid md:grid-cols-2 gap-2 mt-2">
                      {activities.map((activity) => (
                        <div key={activity} className="flex items-center space-x-2">
                          <Checkbox
                            id={activity}
                            checked={serviceData.activities.includes(activity)}
                            onCheckedChange={() => handleActivityToggle(activity)}
                          />
                          <Label htmlFor={activity} className="text-sm">
                            {activity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Bữa ăn</Label>
                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                      {mealOptions.map((meal) => (
                        <div key={meal.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={meal.value}
                            checked={serviceData.meals.includes(meal.value)}
                            onCheckedChange={() => handleMealToggle(meal)}
                          />
                          <Label htmlFor={meal.value} className="text-sm flex-1">
                            {meal.label} (+{meal.price.toLocaleString("vi-VN")}đ/người/ngày)
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Mô tả thêm</Label>
                    <Textarea
                      id="description"
                      value={serviceData.description}
                      onChange={(e) => setServiceData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả thêm về yêu cầu đặc biệt, sở thích cá nhân..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setCurrentStep(2)} disabled={!serviceData.name || !serviceData.location}>
                      Tiếp tục chọn thiết bị
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chọn thiết bị cắm trại</CardTitle>
                    <CardDescription>Thêm thiết bị cần thiết cho chuyến đi của bạn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categories.map((category) => (
                      <div key={category} className="mb-6">
                        <h3 className="font-semibold text-lg mb-3">{category}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {equipment
                            .filter((item) => item.category === category)
                            .map((item) => (
                              <div key={item.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium">{item.name}</h4>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                    <p className="text-green-600 font-semibold">
                                      {item.price.toLocaleString("vi-VN")}đ/{item.priceUnit}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => addEquipment(item)}
                                    disabled={
                                      selectedEquipment.find((eq) => eq.id === item.id)?.quantity >= item.maxQuantity
                                    }
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="text-xs text-gray-500">Còn lại: {item.maxQuantity}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        Quay lại
                      </Button>
                      <Button onClick={() => setCurrentStep(3)}>Xem tóm tắt</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 3 && (
               <Card>
                <CardHeader>
                  <CardTitle>Xác nhận gói dịch vụ</CardTitle>
                  <CardDescription>Kiểm tra lại thông tin trước khi tạo gói</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Thông tin chuyến đi</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tên gói:</span> {serviceData.name}
                      </div>
                      <div>
                        <span className="font-medium">Địa điểm:</span> {serviceData.location}
                      </div>
                      <div>
                        <span className="font-medium">Thời gian:</span> {serviceData.duration} ngày
                      </div>
                      <div>
                        <span className="font-medium">Số người:</span> {serviceData.people} người
                      </div>
                      <div>
                        <span className="font-medium">Ngày bắt đầu:</span> {serviceData.startDate || "Chưa chọn"}
                      </div>
                      <div>
                        <span className="font-medium">Chỗ ở:</span>{" "}
                        {accommodationTypes.find((acc) => acc.value === serviceData.accommodation)?.label ||
                          "Chưa chọn"}
                      </div>
                    </div>
                  </div>

                  {serviceData.activities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Hoạt động</h3>
                      <div className="flex flex-wrap gap-2">
                        {serviceData.activities.map((activity) => (
                          <Badge key={activity} variant="secondary">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {serviceData.meals.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Bữa ăn</h3>
                      <div className="flex flex-wrap gap-2">
                        {serviceData.meals.map((meal) => (
                          <Badge key={meal} variant="secondary">
                            {mealOptions.find((m) => m.value === meal)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEquipment.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Thiết bị đã chọn</h3>
                      <div className="space-y-2">
                        {selectedEquipment.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="font-medium">
                              {(item.price * item.quantity * serviceData.duration).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Quay lại
                    </Button>
                    <Button onClick={handleSubmit}>Tạo gói dịch vụ</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Tạo gói thành công!</h2>
                  <p className="text-gray-600 mb-6">
                    Gói dịch vụ tùy chỉnh của bạn đã được tạo thành công. Chúng tôi sẽ liên hệ để xác nhận chi tiết.
                  </p>
                  <div className="space-y-2 mb-6">
                    <p>
                      <span className="font-medium">Mã gói:</span> #CUSTOM{Date.now()}
                    </p>
                    <p>
                      <span className="font-medium">Tổng giá trị:</span> {calculateTotal().toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button asChild>
                      <Link href="/dashboard">Xem trong dashboard</Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentStep(1)
                        setServiceData({
                          name: "",
                          location: "",
                          duration: 1,
                          people: 2,
                          startDate: "",
                          description: "",
                          accommodation: "",
                          activities: [],
                          meals: [],
                        })
                        setSelectedEquipment([])
                      }}
                    >
                      Tạo gói mới
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Selected Equipment */}
            {selectedEquipment.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Thiết bị đã chọn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedEquipment.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600">
                            {item.price.toLocaleString("vi-VN")}đ x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => updateEquipmentQuantity(item.id, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateEquipmentQuantity(item.id, 1)}
                            disabled={item.quantity >= item.maxQuantity}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeEquipment(item.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Summary */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Tóm tắt giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Dịch vụ cơ bản:</span>
                  <span>{(200000 * serviceData.people * serviceData.duration).toLocaleString("vi-VN")}đ</span>
                </div>

                {serviceData.meals.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Bữa ăn:</span>
                    <span>
                      {serviceData.meals
                        .reduce((sum, meal) => {
                          const mealPrice = mealOptions.find((m) => m.value === meal)?.price || 0
                          return sum + mealPrice * serviceData.people * serviceData.duration
                        }, 0)
                        .toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>
                )}

                {selectedEquipment.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Thiết bị:</span>
                    <span>
                      {selectedEquipment
                        .reduce((sum, item) => sum + item.price * item.quantity * serviceData.duration, 0)
                        .toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>
                )}

                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{calculateTotal().toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Bao gồm hướng dẫn viên</p>
                  <p>✓ Bảo hiểm du lịch</p>
                  <p>✓ Hỗ trợ 24/7</p>
                </div>

                {currentStep < 4 && (
                  <Button className="w-full" asChild>
                    <Link href="/ai-consultant">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Tư vấn với AI
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
