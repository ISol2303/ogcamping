"use client";

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
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaLightbox from "@/components/MediaLightbox";
import { AvatarImage } from "@radix-ui/react-avatar";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/apis/v1/reviews/service/${serviceId}`
      );
      const sorted = (res.data || []).sort(
        (a: Review, b: Review) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(sorted);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    }
  };

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
      setServiceInfo(null);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));
    if (currentPage > newTotal) setCurrentPage(newTotal);
  }, [reviews, currentPage]);

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
            <span className="text-gray-500">({serviceInfo ? serviceInfo.totalReviews : 0} đánh giá)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Review list (read-only) */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center italic">Chưa có đánh giá nào cho dịch vụ này</p>
          ) : (
            paginatedReviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.customerAvatar || ""} alt={review.customerName || "User"} />
                      <AvatarFallback>{(review.customerName?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{review.customerName}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              Trước
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} size="sm" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
              Sau
            </Button>
          </div>
        )}
      </CardContent>

      {/* Lightbox */}
      {lightboxOpen && (
        <MediaLightbox media={currentMedia} initialIndex={currentIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </Card>
  );
}
