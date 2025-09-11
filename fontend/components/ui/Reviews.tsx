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
  createdAt: string;
};

export default function Reviews({ serviceId }: { serviceId: number }) {
  const { user, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(5);
    
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

  try {
    const token = localStorage.getItem("authToken"); // lấy token từ localStorage
    await axios.post(
      `http://localhost:8080/apis/v1/reviews/service/${serviceId}`,
      {
        rating,
        content,
        images: [],
        videos: [],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // gắn token vào header
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Review submitted", { rating, content });

    setContent(""); // reset form
    fetchReviews(); // reload list
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
