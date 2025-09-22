"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaLightbox from "@/components/MediaLightbox";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useToast } from "@/components/ui/use-toast";

type Review = {
  id: number;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  content: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
  reply?: string;
};

type ServiceInfo = {
  averageRating: number;
  totalReviews: number;
};

type MediaItem = {
  type: "image" | "video";
  url: string;
};

export default function Reviews({ serviceId }: { serviceId: number }) {
  const { user, token, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [files, setFiles] = useState<File[]>([]);
  const [isPermitted, setIsPermitted] = useState(false);

  // bookings state (gộp fetch)
  const [bookings, setBookings] = useState<any[]>([]);
  // booking hợp lệ để gửi review (id booking)
  const [eligibleBookingId, setEligibleBookingId] = useState<number | null>(
    null
  );

  const { toast } = useToast();

  // state cho lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1); // trang hiện tại
  const reviewsPerPage = 6; // số review trên mỗi trang
  const totalPages = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  // Lấy danh sách review
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/apis/v1/reviews/service/${serviceId}`
      );
      console.log(res.data);
      
      const sorted = res.data.sort(
        (a: Review, b: Review) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(sorted);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // Lấy thông tin service
  const fetchServiceInfo = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/apis/v1/services/${serviceId}`
      );
      setServiceInfo({
        averageRating: res.data.averageRating || 0,
        totalReviews: res.data.totalReviews || 0,
      });
    } catch (err) {
      console.error("Error fetching service info:", err);
    }
  };

  // Fetch bookings 1 lần, tính isPermitted + eligibleBookingId
  const loadBookingsAndCompute = async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/apis/v1/bookings/customer/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data || [];
      setBookings(data); // lưu local

      const now = new Date();

      // tìm booking hợp lệ (COMPLETED, có service này, chưa hasReview, checkout trong vòng 7 ngày)
      let foundBookingId: number | null = null;
      const permitted = data.some((b: any) => {
        if (b.status !== "COMPLETED" || !b.checkOutDate || b.hasReview) return false;

        const checkout = new Date(b.checkOutDate);
        const diffDays =
          (now.getTime() - checkout.getTime()) / (1000 * 60 * 60 * 24);

        const hasService = b.services?.some(
          (s: any) => s.serviceId === serviceId && !s.hasReview
        );

        const ok = checkout < now && diffDays <= 7 && hasService;
        if (ok && foundBookingId == null) {
          foundBookingId = b.id;
        }
        return ok;
      });

      setIsPermitted(permitted);
      setEligibleBookingId(foundBookingId);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
      setIsPermitted(false);
      setEligibleBookingId(null);
    }
  };

  // Submit review: dùng eligibleBookingId từ state (không fetch lại)
  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để viết đánh giá",
        variant: "error",
      });
      return;
    }

    if (!eligibleBookingId) {
      toast({
        title: "Không hợp lệ",
        description:
          "Không tìm thấy booking hợp lệ để viết đánh giá (có thể đã hết 7 ngày hoặc đã đánh giá).",
        variant: "error",
      });
      setIsPermitted(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("content", content);
      formData.append("bookingId", eligibleBookingId.toString());

      // Thêm file ảnh / video
      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          formData.append("images", file);
        } else if (file.type.startsWith("video/")) {
          formData.append("videos", file);
        }
      });

      const res = await axios.post(
        `http://localhost:8080/apis/v1/reviews/service/${serviceId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form
      setContent("");
      setRating(5);
      setFiles([]);
      fetchReviews();
      fetchServiceInfo();

      // cập nhật local booking -> tránh fetch lại ngay
      setBookings((prev) =>
        prev.map((b) =>
          b.id === eligibleBookingId ? { ...b, hasReview: true } : b
        )
      );
      setIsPermitted(false);
      setEligibleBookingId(null);

      toast({
        title: "Đánh giá thành công",
        description: "Cảm ơn bạn đã chia sẻ trải nghiệm!",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error submitting review:", err);

      // nếu backend trả conflict hoặc thông báo đã review
      if (err?.response?.status === 409) {
        toast({
          title: "Bạn đã đánh giá rồi",
          description: "Mỗi booking chỉ được đánh giá 1 lần.",
          variant: "warning",
        });
        // sync: mark local booking as reviewed
        setBookings((prev) =>
          prev.map((b) =>
            b.id === eligibleBookingId ? { ...b, hasReview: true } : b
          )
        );
        setIsPermitted(false);
        setEligibleBookingId(null);
      } else {
        toast({
          title: "Có lỗi xảy ra",
          description: "Vui lòng thử lại sau.",
          variant: "error",
        });
      }
    }
  };

  // helper: build merged media list (images first, then videos)
  const buildMediaList = (review: Review): MediaItem[] => {
    const imgs = (review.images || []).map((url) => ({
      type: "image" as const,
      url: url.startsWith("http") ? url : `http://localhost:8080${url}`,
    }));
    const vids = (review.videos || []).map((url) => ({
      type: "video" as const,
      url: url.startsWith("http") ? url : `http://localhost:8080${url}`,
    }));
    return [...imgs, ...vids];
  };

  const openLightboxFromImage = (review: Review, imgIndex: number) => {
    const media = buildMediaList(review);
    setCurrentMedia(media);
    setCurrentIndex(imgIndex);
    setLightboxOpen(true);
  };

  const openLightboxFromVideo = (review: Review, vidIndex: number) => {
    const media = buildMediaList(review);
    const imgCount = (review.images || []).length;
    setCurrentMedia(media);
    setCurrentIndex(imgCount + vidIndex);
    setLightboxOpen(true);
  };

  useEffect(() => {
    fetchReviews();
    fetchServiceInfo();
  }, [serviceId]);

  // load bookings & compute once when login or service change
  useEffect(() => {
    if (isLoggedIn) {
      loadBookingsAndCompute();
    } else {
      setBookings([]);
      setIsPermitted(false);
      setEligibleBookingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, isLoggedIn]);

  // clamp currentPage nếu số trang thay đổi
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));
    if (currentPage > newTotal) {
      setCurrentPage(newTotal);
    }
  }, [reviews, currentPage]);

  // mở lightbox
  const handleOpenLightbox = (media: MediaItem[], index: number) => {
    setCurrentMedia(media);
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Đánh giá từ khách hàng</CardTitle>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">
              {serviceInfo ? serviceInfo.averageRating.toFixed(1) : "0"}
            </span>
            <span className="text-gray-500">
              ({serviceInfo ? serviceInfo.totalReviews : 0} đánh giá)
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Form tạo review */}
        {isLoggedIn && isPermitted && (
          <Card className="mb-6 p-4 shadow-md">
            <CardHeader>
              <CardTitle>Viết đánh giá của bạn</CardTitle>
              <CardDescription>
                Đánh giá của bạn là động lực để Og Camping hoàn thiện và mang
                đến trải nghiệm tốt hơn 🌿
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full min-h-[100px] border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hãy viết đôi điều về trải nghiệm của bạn..."
              />

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-7 h-7 cursor-pointer transition ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  />
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {rating} / 5 sao
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-fit flex items-center gap-2 cursor-pointer"
                >
                  <label>
                    <Upload className="w-4 h-4" />
                    Chọn ảnh/video
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setFiles(Array.from(e.target.files || []))
                      }
                    />
                  </label>
                </Button>

                {files.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="w-20 h-20 rounded-lg overflow-hidden border relative"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={submitReview}
                  disabled={rating === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Gửi đánh giá
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/*Danh sách review*/}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center italic">
              Chưa có đánh giá nào cho dịch vụ này
            </p>
          ) : (
            paginatedReviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={review.customerAvatar || ""}
                        alt={review.customerName || "User"}
                      />
                      <AvatarFallback>
                        {(review.customerName?.charAt(0) || "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{review.customerName}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <p className="text-gray-700">{review.content}</p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {review.images.map((img, i) => (
                      <img
                        key={i}
                        src={`http://localhost:8080${img}`}
                        alt={`review-img-${i}`}
                        className="w-32 h-32 object-cover rounded cursor-pointer"
                        onClick={() => openLightboxFromImage(review, i)}
                      />
                    ))}
                  </div>
                )}

                {review.videos && review.videos.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {review.videos.map((vid, i) => (
                      <video
                        key={i}
                        className="w-64 rounded cursor-pointer"
                        src={`http://localhost:8080${vid}`}
                        onClick={() => openLightboxFromVideo(review, i)}
                      />
                    ))}
                  </div>
                )}

                {review.reply && (
                  <div className="mt-3 ml-10 p-3 bg-gray-50 rounded-lg border flex gap-3">
                    <Avatar>
                      <AvatarImage src="/ai-avatar.jpg" alt="Og Camping" />
                      <AvatarFallback>OG</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Og Camping</h4>
                        <span className="text-xs text-gray-400 italic">
                          Đã trả lời
                        </span>
                      </div>
                      <p className="text-gray-700">{review.reply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </Button>
          </div>
        )}
      </CardContent>

      {/* Lightbox */}
      {lightboxOpen && (
        <MediaLightbox
          media={currentMedia}
          initialIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </Card>
  );
}
