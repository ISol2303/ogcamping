"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Blog {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  status: string;
  type?: "USER" | "AI";
  thumbnail?: string;
  imageUrl?: string;
  location?: { name?: string; description?: string };
  rejectedReason?: string;
}

export default function BlogDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [feedback, setFeedback] = useState("");

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/apis/blogs/admin/${blogId}`);
      if (!res.ok) throw new Error("Không lấy được blog");
      const data = await res.json();
      setBlog(data);
    } catch (err) {
      console.error(err);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) fetchBlog();
  }, [blogId]);

  

  // const handleAIGen = async () => {
  //   if (!confirm("Bạn có muốn AI gen lại nội dung cho bài này? (bài vẫn giữ trạng thái PENDING)")) return;
  //   setActionLoading(true);
  //   try {
  //     const res = await fetch(`http://localhost:8080/apis/blogs/admin/${blogId}/aigen`, {
  //       method: "POST",
  //     });
  //     if (!res.ok) {
  //       const txt = await res.text();
  //       alert("AI Gen lỗi: " + txt);
  //     } else {
  //       alert("AI Gen xong, admin review lại.");
  //       await fetchBlog();
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Lỗi khi gọi AI Gen");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handlePublish = async () => {
    if (!confirm("Xác nhận publish bài viết này?")) return;
    setActionLoading(true);
    try {
      await fetch(`http://localhost:8080/apis/blogs/admin/${blogId}/publish`, { method: "POST" });
      alert("Đã publish");
      router.push("/admin/blogs");
    } catch (err) {
      console.error(err);
      alert("Publish lỗi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert("Vui lòng nhập lý do reject để gửi về staff");
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8080/apis/blogs/admin/${blogId}/reject?feedback=${encodeURIComponent(feedback)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        alert("Reject lỗi: " + txt);
      } else {
        const updatedBlog = await res.json(); // ✅ parse blog từ backend
        console.log("📢 Admin đã gửi reject tới staff:", updatedBlog);

        alert("Đã trả về DRAFT cho staff kèm feedback.");
        router.push("/admin/blogs");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi gửi feedback");
    } finally {
      setActionLoading(false);
    }
  };



  if (loading) return <div className="text-center py-20">Đang tải bài viết...</div>;
  if (!blog) return <div className="text-center py-20">Bài viết không tìm thấy.</div>;

  return (
    <div className="container mx-auto py-20 px-4 max-w-3xl">
      <Button onClick={() => router.back()} className="mb-6 bg-gray-200 hover:bg-gray-300">
        ← Quay lại
      </Button>

      <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
      <p className="text-sm text-gray-600 mb-4">Tác giả: <strong>{blog.createdBy}</strong></p>
      <p className="text-sm text-gray-600 mb-6">Trạng thái: <strong>{blog.status}</strong> • Loại: <strong>{blog.type || "USER"}</strong></p>

      {blog.imageUrl || blog.thumbnail ? (
        <div className="mb-6 rounded overflow-hidden shadow-sm">
          <img
            src={blog.imageUrl ? `http://localhost:8080${blog.imageUrl}` : `http://localhost:8080/uploads/${blog.thumbnail}`}
            alt={blog.title}
            className="w-full h-64 object-cover"
          />
        </div>
      ) : null}

      <div className="prose prose-lg mb-6 whitespace-pre-line">
        {blog.content}
      </div>

      {blog.location && (blog.location.name || blog.location.description) && (
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="font-semibold mb-2">Thông tin địa điểm</h4>
          {blog.location.name && <p><strong>Tên:</strong> {blog.location.name}</p>}
          {blog.location.description && <p><strong>Mô tả:</strong> {blog.location.description}</p>}
        </div>
      )}

      {blog.rejectedReason && (
        <div className="bg-red-50 p-4 rounded mb-6 border border-red-100">
          <h4 className="font-semibold text-red-600 mb-2">Lý do đã bị trả về</h4>
          <p>{blog.rejectedReason}</p>
        </div>
      )}

      <div className="flex gap-3">
        {/* <Button onClick={handleAIGen} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={actionLoading}>
          {actionLoading ? "Đang..." : "AI Gen"}
        </Button> */}

        <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white" disabled={actionLoading}>
          Publish
        </Button>

        <Button onClick={() => setShowReject(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
          Trả về (Reject)
        </Button>
      </div>

      {showReject && (
        <div className="mt-6 p-4 border rounded bg-white shadow-sm">
          <h4 className="font-semibold mb-2">Ghi lý do trả về cho Staff</h4>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full border rounded p-2 mb-3"
            placeholder="Ghi rõ chỗ sai, cần sửa gì..."
          />
          <div className="flex gap-2">
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white">
              Gửi trả về
            </Button>
            <Button onClick={() => setShowReject(false)} className="bg-gray-200">
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
