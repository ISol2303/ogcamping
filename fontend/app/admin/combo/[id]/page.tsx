"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tent,
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Utensils,
  Wrench,
  Briefcase,
  Percent,
} from "lucide-react"
import Link from "next/link"
interface ComboItem {
  id: number
  name: string
  type: string
  price: number
  quantity?: number
  included: boolean
}

interface Combo {
  id: number
  name: string
  description: string
  price: number
  originalPrice: number
  discount: number
  duration: string
  maxPeople: number
  rating: number
  reviewCount: number
  image: string
  active: boolean
  items: { serviceId: number; serviceName: string; quantity: number }[];
  equipment: string[];
  foods: string[];
  highlights: string[]
  tags: string[]
  location: string
  bookingCount: number
  createdAt: string
  updatedAt: string
}

interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
  date: string
  avatar?: string
}

interface BookingStats {
  totalBookings: number
  monthlyBookings: number
  revenue: number
  monthlyRevenue: number
  averageRating: number
  completionRate: number
  totalSavings: number
}

export default function ComboDetailPage() {
  const params = useParams()
  const router = useRouter()
  const comboId = params.id as string

  const [combo, setCombo] = useState<Combo | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    fetchComboData()
    const success = sessionStorage.getItem("successUpdate")
    if (success) {
      setShowMessage(true)
      sessionStorage.removeItem("successUpdate") // xoá ngay để tránh hiển thị lại khi reload
    }
  }, [comboId])
  const fetchComboData = async () => {
    try {
      setLoading(true)

      const response = await fetch(`http://localhost:8080/apis/v1/combos/${comboId}`)
      if (!response.ok) {
        throw new Error("Không thể fetch combo")
      }

      const comboData: Combo = await response.json()
      setCombo(comboData)
      // Lấy tổng số booking confirmed

      // Mock reviews
      const mockReviews: Review[] = [
        {
          id: 1,
          customerName: "Nguyễn Văn A",
          rating: 5,
          comment:
            "Combo tuyệt vời! Tiết kiệm được nhiều tiền và dịch vụ rất chất lượng. Thiết bị đầy đủ, đồ ăn ngon.",
          date: "2024-01-18",
          avatar: "/avatar1.png",
        },
        {
          id: 2,
          customerName: "Trần Thị B",
          rating: 4,
          comment: "Gói combo rất đáng giá. Chỉ có điều thời tiết hơi lạnh nhưng thiết bị giữ ấm rất tốt.",
          date: "2024-01-16",
          avatar: "/avatar2.png",
        },
        {
          id: 3,
          customerName: "Lê Văn C",
          rating: 5,
          comment:
            "Lần đầu đặt combo nhưng rất hài lòng. Mọi thứ đều được chuẩn bị chu đáo, không phải lo lắng gì cả!",
          date: "2024-01-14",
          avatar: "/avatar3.png",
        },
      ]
      const confirmedRes = await fetch(`http://localhost:8080/apis/v1/bookings/${comboId}/confirmed-count`)
      const confirmedCount = await confirmedRes.json()
      const revenueRes = await fetch(`http://localhost:8080/apis/v1/bookings/${comboId}/revenue`)
      const revenueData = await revenueRes.json()
      const savingsResponse = await fetch(`http://localhost:8080/apis/v1/bookings/${comboId}/savings`)
      const savingsData = await savingsResponse.json()
      // Mock booking stats
      const mockBookingStats: BookingStats = {
        totalBookings: confirmedCount || 0,
        monthlyBookings: savingsData.confirmedBookings, // nếu cần thì gọi API riêng
        revenue: revenueData.totalRevenue || 0,
        monthlyRevenue: revenueData.monthlyRevenue || 0,
        averageRating: comboData.rating || 4.8,
        completionRate: 98.5,
        totalSavings: savingsData.totalSavings || 0,
      }

      setReviews(mockReviews)
      setBookingStats(mockBookingStats)
    } catch (error) {
      console.error("Error fetching combo data:", error)
    } finally {
      setLoading(false)
    }
  }


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: boolean) => {
    switch (status) {
      case true:
        return <Badge className="bg-green-100 text-green-800 border-0">Hoạt động</Badge>
      case false:
        return <Badge className="bg-gray-100 text-gray-800 border-0">Tạm dừng</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const handleDeleteCombo = async () => {
    try {
      const response = await fetch(`/api/combos?id=${comboId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setIsDeleteDialogOpen(false)
        router.push("/admin/combo")
      }
    } catch (error) {
      console.error("Error deleting combo:", error)
    }
  }

  const getItemCounts = () => {
    if (!combo) return { serviceCount: 0, equipmentCount: 0, foodCount: 0 }

    // Đếm dịch vụ (số item trong mảng items)
    const serviceCount = combo.items?.length || 0

    // Đếm số thiết bị
    const equipmentCount = combo.equipment?.length || 0

    // Đếm số món ăn
    const foodCount = combo.foods?.length || 0

    return { serviceCount, equipmentCount, foodCount }
  }


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
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy combo</h2>
          <p className="text-gray-600 mb-4">Combo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/admin/combo">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách Combo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { serviceCount, equipmentCount, foodCount } = getItemCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/combo" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại Combo</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/admin" className="hover:text-green-600">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/admin/combo" className="hover:text-green-600">
                Combo
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{combo.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/combo/${combo.id}/edit`}>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            </Link>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa combo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa combo "{combo.name}"? Hành động này không thể hoàn tác và sẽ ảnh hưởng đến
                    tất cả booking liên quan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteCombo} className="bg-red-600 hover:bg-red-700 text-white">
                    Xóa combo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showMessage && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-800 font-medium">
            Cập nhật combo thành công!
          </div>
        )}
        {/* Combo Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{combo.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {combo.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {combo.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Tối đa {combo.maxPeople} người
                </div>
              </div>
              <p className="text-gray-600 max-w-2xl">{combo.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">{formatPrice(combo.price)}</div>
              {combo.discount > 0 && (
                <div className="space-y-1">
                  <div className="text-lg text-gray-500 line-through">{formatPrice(combo.originalPrice)}</div>
                  <Badge className="bg-red-100 text-red-800 border-0">
                    <Percent className="w-3 h-3 mr-1" />
                    Tiết kiệm {combo.discount}%
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{combo.rating}</span>
              <span className="text-gray-600">({combo.reviewCount} đánh giá)</span>
            </div>
            {getStatusBadge(combo.active)}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>{serviceCount} dịch vụ</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Wrench className="w-4 h-4 text-purple-600" />
                <span>{equipmentCount} thiết bị</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {combo.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {bookingStats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng booking</p>
                    <p className="text-3xl font-bold text-gray-900">{bookingStats.totalBookings}</p>
                    <p className="text-sm text-green-600">+{bookingStats.monthlyBookings} tháng này</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(bookingStats.revenue)}</p>
                    <p className="text-sm text-green-600">+{formatPrice(bookingStats.monthlyRevenue)} tháng này</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tiết kiệm cho KH</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPrice(bookingStats.totalSavings || 0)}
                    </p>
                    <p className="text-sm text-green-600">
                      {bookingStats.totalSavings && combo.originalPrice && combo.originalPrice > 0
                        ? `Tiết kiệm ${(
                          (bookingStats.totalSavings / combo.originalPrice) *
                          100
                        ).toFixed(0)}% / booking`
                        : ""}
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>


            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                    <p className="text-3xl font-bold text-gray-900">{bookingStats.completionRate}%</p>
                    <Progress value={bookingStats.completionRate} className="w-full mt-2" />
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-4 bg-gray-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Nội dung combo
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Đánh giá
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Thống kê
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Combo Highlights */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Điểm nổi bật</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {combo.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Combo Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Thông tin combo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Bao gồm:</h4>
                    <ul className="space-y-1">
                      {combo.highlights.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-sm text-gray-500 pt-4 border-t">
                    <p>Tạo: {formatDate(combo.createdAt)}</p>
                    <p>Cập nhật: {formatDate(combo.updatedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Services */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Dịch vụ ({serviceCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {combo.items
                      .filter((s) => s.serviceId)
                      .map((service) => (
                        <div key={service.serviceId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{service.serviceName}</div>
                            {/* <div className="text-sm text-gray-600">{formatPrice(service.price)}</div> */}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Equipment */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-purple-600" />
                    Thiết bị ({equipmentCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {combo.equipment?.map((eq, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{eq}</div>
                          <div className="text-sm text-gray-600">Số lượng: 1</div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Đánh giá từ khách hàng</CardTitle>
                <CardDescription>Tổng cộng {reviews.length} đánh giá</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                            <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">({review.rating}/5)</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Thống kê chi tiết</CardTitle>
                <CardDescription>Phân tích hiệu suất combo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Tính năng đang được phát triển</p>
                  <p className="text-sm">Sẽ hiển thị biểu đồ và thống kê chi tiết</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
