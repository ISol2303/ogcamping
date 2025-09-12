"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { log } from "console";

type Review = {
  id: number;
  customerName: string;
  rating: number;
  content: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
};

export default function Reviews({ serviceId }: { serviceId: number }) {
  const { user, token, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [files, setFiles] = useState<File[]>([]);
    console.log("sending token: ", token);
  // Lấy danh sách review
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/apis/v1/reviews/service/${serviceId}`
      );
      setReviews(res.data);``
    } catch (err) {
      console.error("Error fetching reviews:", err);
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

    console.log("Review submitted", res.data);

    // Reset form
    setContent("");
    setRating(5);
    setFiles([]);

    fetchReviews(); // reload danh sách review
  } catch (err) {
    console.error("Error submitting review:", err);
  }
};

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Đánh giá từ khách hàng</CardTitle>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">
              {reviews.length > 0
                ? (
                    reviews.reduce((sum, r) => sum + r.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "0"}
            </span>
            <span className="text-gray-500">
              ({reviews.length} đánh giá)
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Form tạo review */}
        {isLoggedIn && (
          <div className="mb-6 space-y-2">
            <textarea
              className="w-full border rounded p-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết đánh giá của bạn..."
            />
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-5 h-5 cursor-pointer ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={submitReview}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Gửi đánh giá
            </button>

            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </div>
        )}

        {/* Danh sách review */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b pb-4 last:border-b-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {review.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {review.customerName}
                    </h4>
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
              {/* ✅ render ảnh */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {review.images.map((img, i) => (
                    <img
                      key={i}
                      src={`http://localhost:8080${img}`}  // nếu BE trả "/uploads/..."
                      alt={`review-img-${i}`}
                      className="w-32 h-32 object-cover rounded"
                    />
                  ))}
                </div>
              )}

              {/* ✅ render video */}
              {review.videos && review.videos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {review.videos.map((vid, i) => (
                    <video
                      key={i}
                      controls
                      className="w-64 rounded"
                      src={`http://localhost:8080${vid}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
