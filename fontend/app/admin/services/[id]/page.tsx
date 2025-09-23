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
  DoorOpen,
} from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { format, parseISO, compareAsc } from "date-fns";
import { Service } from "@/app/api/serviceApi"


interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
  date: string
  avatar?: string
}
interface BookingItemDTO {
  id: number;
  price: number;
  serviceName: string;
}

interface BookingGetByServiceDTO {
  bookingId: number;
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfPeople: number;
  status: string;
  items: BookingItemDTO[];
}
interface BookingStats {
  totalBookings: number;
  monthlyBookings: number;
  revenue: number;
  monthlyRevenue: number;
  averageRating: number;
  completionRate: number;
}
interface Availability {
  id: number;
  date: string;
  totalSlots: number;
  bookedSlots: number;
}

interface Props {
  serviceId?: number; // ID của service, có thể undefined nếu chưa chọn
}
export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string
  const [availability, setAvailability] = useState<Availability[] | null>(null);
  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null)
  const [bookings, setBookings] = useState<BookingGetByServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const [singleDate, setSingleDate] = useState("");
  const [singleSlots, setSingleSlots] = useState(5);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [batchSlots, setBatchSlots] = useState(5);
  const now = new Date();
  const offset = 7 * 60;
  const vietnamTime = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60 * 1000);

  const today = vietnamTime.toISOString().split("T")[0];
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const reloadAvailability = async () => {
    if (!serviceId) return; // kiểm tra serviceId
    try {
      const res = await fetch(
        `http://localhost:8080/apis/v1/services/${serviceId}/availability`
      );
      if (!res.ok) throw new Error("Failed to fetch availability");
      const data = await res.json();
      setAvailability(data); // cập nhật state
    } catch (error) {
      console.error("Error loading availability:", error);
    }
  };
  useEffect(() => {
    if (!serviceId) {
      setAvailability(null);
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/apis/v1/services/${serviceId}/availability`);
        if (!res.ok) throw new Error("Failed to fetch availability");
        const data: Availability[] = await res.json();
        setAvailability(data);
      } catch (err) {
        console.error(err);
        setAvailability([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
    // reloadAvailability();
  }, [serviceId]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        // 1. Lấy thông tin service
        const res = await fetch(`http://localhost:8080/apis/v1/services/${serviceId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Không tìm thấy service");
        }

        const data: Service = await res.json();
        setService(data);

        // 2. Lấy booking stats thật từ API
        const statsRes = await fetch(`http://localhost:8080/apis/v1/bookings/services/${serviceId}`, {
          cache: "no-store",
        });

        if (statsRes.ok) {
          const stats: BookingStats = await statsRes.json();
          setBookingStats(stats);
        } else {
          console.warn("Không lấy được booking stats");
        }

        // 3. (Tuỳ chọn) Reviews vẫn mock
        const mockReviews: Review[] = [
          {
            id: 1,
            customerName: "Nguyễn Văn A",
            rating: 5,
            comment:
              "Trải nghiệm tuyệt vời! Cảnh quan Sapa thật sự ngoạn mục, hướng dẫn viên rất nhiệt tình và am hiểu. Sẽ quay lại lần nữa!",
            date: "2024-01-18",
            avatar: "/avatar1.png",
          },
          {
            id: 2,
            customerName: "Trần Thị B",
            rating: 4,
            comment:
              "Dịch vụ tốt, đồ ăn ngon. Chỉ có điều thời tiết hơi lạnh nhưng đó là điều tự nhiên. Nhìn chung rất hài lòng.",
            date: "2024-01-16",
            avatar: "/avatar2.png",
          },
        ];
        setReviews(mockReviews);
      } catch (error) {
        console.error("Fetch service error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/apis/v1/bookings/service/${serviceId}`
        );
        if (!res.ok) throw new Error("Không thể tải bookings");
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [serviceId]);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div >;
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 text-lg">Không tìm thấy dịch vụ phù hợp</p>
        <Link href="/admin/services">
          <Button>Trở lại Dịch vụ</Button>
        </Link>
      </div>
    );
  }
  if (!serviceId || availability === null) {
    return (
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <DoorOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Tính năng đang được phát triển</p>
          <p className="text-sm">
            Sẽ hiển thị lịch đã cài đặt và thống kê chi tiết slots theo từng ngày
          </p>
        </div>
      </CardContent>
    );
  }

  if (loading) {
    return (
      <CardContent>
        <div className="text-center py-8 text-gray-500">Đang tải lịch...</div>
      </CardContent>
    );
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-0">Hoạt động</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-0">Tạm dừng</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const handleDeleteService = async () => {
    try {
      // In production, call API to delete service
      console.log("Deleting service:", serviceId)
      setIsDeleteDialogOpen(false)
      router.push("/admin")
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }
  const handleSlotChange = async (availabilityId: number, newTotalSlots: number) => {
    if (!serviceId) return; // serviceId hiện tại

    try {
      // Gọi API PUT để cập nhật slot
      const response = await fetch(
        `http://localhost:8080/apis/v1/services/${serviceId}/availability/${availabilityId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalSlots: newTotalSlots }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Update failed: ${errText}`);
      }

      const updated: Availability = await response.json();
      console.log("Updated availability:", updated);

      // Reload lại danh sách availability
      await reloadAvailability();
    } catch (error) {
      console.error("Error updating slots:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin dịch vụ...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy dịch vụ</h2>
          <p className="text-gray-600 mb-4">Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/admin">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
           
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/admin" className="hover:text-green-600">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/admin/services" className="hover:text-green-600">
                Dịch vụ
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{service.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/services/${serviceId}/edit`}>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
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
                  <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa dịch vụ "{service.name}"? Hành động này không thể hoàn tác và sẽ ảnh hưởng
                    đến tất cả booking liên quan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteService} className="bg-red-600 hover:bg-red-700 text-white">
                    Xóa dịch vụ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Service Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {service.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {service.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {service.capacity}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">{formatPrice(service.price)}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{service.averageRating}</span>
              <span className="text-gray-600">({service.totalReviews} đánh giá)</span>
            </div> */}
            {/* {getStatusBadge(service.status)} */}
            <div className="flex flex-wrap gap-1">
              {/* {service.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                  {tag}
                </Badge>
              ))} */}
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
                    <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                    <p className="text-3xl font-bold text-gray-900">{bookingStats.averageRating}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= Math.floor(bookingStats.averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
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
                  <TrendingUp className="w-8 h-8 text-purple-600" />
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
            <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Đánh giá
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Booking
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Lịch đặt chỗ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Service Description */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Mô tả dịch vụ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">{service.description}</p>
                  <div className="text-sm text-gray-500">
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

          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Lịch sử booking</CardTitle>
                <CardDescription>
                  Danh sách các booking cho dịch vụ này
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Chưa có booking nào cho dịch vụ này</p>
                    <p className="text-sm">
                      Sẽ hiển thị danh sách booking chi tiết
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                            ID Booking
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                            Khách hàng
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                            Giá tiền
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                            Thao tác
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {bookings.map((b) => {
                          // Tính tổng giá tiền từ items (nếu cần)
                          const totalPrice = b.items?.reduce((sum, i) => sum + (i.price || 0), 0) || 0;

                          return (
                            <tr key={b.bookingId} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-800 border-b">
                                OG00000{b.bookingId}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-800 border-b">
                                {b.customerName}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-800 border-b">
                                {totalPrice.toLocaleString("vi-VN")} ₫
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-800 border-b">
                                <Link
                                  href={`/admin/bookings/${b.bookingId}`}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <Eye className="w-4 h-4" />
                                  Chi tiết
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Thống kê chỗ trống</CardTitle>
                  <CardDescription>Thêm và kiểm tra chỗ còn trống</CardDescription>

                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSingleModal(true)}
                  >
                    + Thêm ngày
                  </Button>
                  <Button
                    onClick={() => setShowBatchModal(true)}
                  >
                    + Tạo lịch dài ngày
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {availability
                    .slice() // copy để sort
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((a) => {
                      const isFull = a.bookedSlots >= a.totalSlots;

                      return (
                        <div
                          key={a.id}
                          className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center
              ${isFull ? 'bg-red-100 border-red-300' : 'bg-green-50 border-green-200'}`}
                        >
                          <div className="font-medium mb-1">
                            {new Date(a.date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {a.bookedSlots} / {a.totalSlots} slots đã đặt
                          </div>

                          {/* Nếu full hoặc muốn chỉnh số lượng, hiển thị input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={a.totalSlots}
                              onChange={(e) => handleSlotChange(a.id, Number(e.target.value))}
                              className="w-16 text-center border rounded px-1 py-0.5"
                            />
                            <span>slots</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>


              {showSingleModal && (
                <Dialog open={showSingleModal} onOpenChange={setShowSingleModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm chỗ trống cho 1 ngày</DialogTitle>
                    </DialogHeader>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();

                        const exists = availability.some(a => a.date === singleDate);
                        if (exists) {
                          setShowErrorMessage(true); // bật message
                          return;
                        }

                        setShowErrorMessage(false); // reset nếu chưa tồn tại
                        await fetch(
                          `http://localhost:8080/apis/v1/services/${serviceId}/availability`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ date: singleDate, totalSlots: singleSlots }),
                          }
                        );

                        setShowSingleModal(false);
                        reloadAvailability();
                      }}
                      className="space-y-4"
                    >
                      <Input
                        type="date"
                        value={singleDate}
                        onChange={(e) => setSingleDate(e.target.value)}
                        required
                        min={today}
                      />
                      <Input
                        type="number"
                        min="1"
                        value={singleSlots}
                        onChange={(e) => setSingleSlots(Number(e.target.value))}
                        required
                      />

                      {/* Message toggle */}
                      {showErrorMessage && (
                        <div className="text-red-600 text-sm text-center">
                          Ngày {singleDate} đã được tạo!
                        </div>
                      )}

                      <Button type="submit" className="w-full">Lưu</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}


              {showBatchModal && (
                <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tạo lịch theo tháng</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await fetch(`http://localhost:8080/apis/v1/services/${serviceId}/availability/batch`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            startDate,
                            endDate,
                            totalSlots: batchSlots,
                          }),
                        });
                        setShowBatchModal(false);
                        reloadAvailability();
                      }}
                      className="space-y-4"
                    >

                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        min={today} // chặn ngày trước hôm nay
                      />

                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        min={startDate || today} // endDate không thể trước startDate
                      />

                      <Input
                        type="number"
                        min="1"
                        value={batchSlots}
                        onChange={(e) => setBatchSlots(Number(e.target.value))}
                        required
                      />
                      <Button type="submit" className="w-full">Tạo batch</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
