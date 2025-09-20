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
  customerAvatar?: string; //thêm avatar
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
      // sort theo createdAt giảm dần
      const sorted = res.data.sort(
        (a: Review, b: Review) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(sorted);
      // ✅ sau khi load xong, reset về trang 1 (tránh giữ page cũ)
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // Lấy thông tin service (để hiển thị rating trung bình, tổng số review)
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

  // Submit review mới
  const submitReview = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để viết đánh giá");
      return;
    }

    files.forEach((file) => {
      console.log("Uploading:", file.name, file.type, file.size);
    });

    try {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("content", content);

      // Thêm file ảnh / video
      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          formData.append("images", file); // key trùng với @RequestPart("images")
        } else if (file.type.startsWith("video/")) {
          formData.append("videos", file); // key trùng với @RequestPart("videos")
        }
      });

      const res = await axios.post(
        `http://localhost:8080/apis/v1/reviews/service/${serviceId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // ❌ KHÔNG set Content-Type thủ công
            // axios + FormData sẽ tự thêm boundary cho multipart
          },
        }
      );

      // Reset form
      setContent("");
      setRating(5);
      setFiles([]);
      fetchReviews(); // reload danh sách review
      fetchServiceInfo();
      toast({
        title: "Đánh giá thành công",
        description: "Cảm ơn bạn đã chia sẻ trải nghiệm!",
        variant: "success",
      });
    } catch (err) {
      console.error("Error submitting review:", err);
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
    setCurrentIndex(imgIndex); // imgIndex là index trong phần images
    setLightboxOpen(true);
  };

  const openLightboxFromVideo = (review: Review, vidIndex: number) => {
    const media = buildMediaList(review);
    const imgCount = (review.images || []).length;
    setCurrentMedia(media);
    setCurrentIndex(imgCount + vidIndex); // video index offset bởi số ảnh
    setLightboxOpen(true);
  };

  useEffect(() => {
    fetchReviews();
    fetchServiceInfo();
  }, [serviceId]);

  // clamp currentPage nếu số trang thay đổi (ví dụ xóa review làm giảm totalPages)
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));
    if (currentPage > newTotal) {
      setCurrentPage(newTotal);
    }
    // nếu reviews giảm về 0 thì đảm bảo currentPage = 1
  }, [reviews, currentPage]);

  // mở lightbox
  const handleOpenLightbox = (media: MediaItem[], index: number) => {
    setCurrentMedia(media);
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  // hàm fetch bookings
  const fetchPermission = async () => {
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

    const bookings = res.data || [];
    const now = new Date();

    const permitted = bookings.some((b: any) => {
      if (b.status !== "COMPLETED" || !b.checkOutDate) return false;

      const checkout = new Date(b.checkOutDate);
      const diffDays =
        (now.getTime() - checkout.getTime()) / (1000 * 60 * 60 * 24);

      // check dịch vụ trong booking có serviceId này không
      const hasService = b.services?.some(
        (s: any) => s.serviceId === serviceId
      );

      return checkout < now && diffDays <= 7 && hasService;
    });

    setIsPermitted(permitted);
  } catch (err) {
    console.error("Error checking review permission:", err);
  }
};

useEffect(() => {
  fetchReviews();
  fetchServiceInfo();
  if (isLoggedIn) {
    fetchPermission();
  }
}, [serviceId, isLoggedIn]);

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
                Đánh giá của bạn là động lực để Og Camping hoàn thiện và mang đến trải nghiệm tốt hơn 🌿
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nội dung */}
              <textarea
                className="w-full min-h-[100px] border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hãy viết đôi điều về trải nghiệm của bạn..."
              />

              {/* Rating */}
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

              {/* Upload */}
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
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    />
                  </label>
                </Button>

                {/* Preview files */}
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

              {/* Submit */}
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
    // paginatedReviews (chỉ render 6 item mỗi trang)
    paginatedReviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review.customerAvatar || ""} alt={review.customerName || "User"} />
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

              {/* render ảnh */}
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

              {/* render video */}
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

              {/* Hiển thị reply nếu có */}
              {review.reply && (
                <div className="mt-3 ml-10 p-3 bg-gray-50 rounded-lg border flex gap-3">
                  <Avatar>
                    {/* ✅ Avatar Og Camping (ảnh em set sau) */}
                    <AvatarImage src="/ai-avatar.jpg" alt="Og Camping" />
                    <AvatarFallback>OG</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Og Camping</h4>
                      <span className="text-xs text-gray-400 italic">Đã trả lời</span>
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

            {/* optional: show page numbers */}
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
