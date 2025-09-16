"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Blog {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  thumbnail?: string;
  imageUrl?: string;
  location?: { id?: number; name?: string; description?: string };
}

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params.id;
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    fetch(`http://localhost:8080/apis/blogs/public/${blogId}`) // note: your backend earlier used /public/{id}
      .then(async (res) => {
        if (!res.ok) {
          // try fallback to /apis/blogs/{id} (if your public endpoint is different)
          const fallback = await fetch(`http://localhost:8080/apis/blogs/${blogId}`);
          if (!fallback.ok) throw new Error("Not found");
          return fallback.json();
        }
        return res.json();
      })
      .then((data) => setBlog(data))
      .catch((err) => {
        console.error("Error fetching blog:", err);
        setBlog(null);
      })
      .finally(() => setLoading(false));
  }, [blogId]);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!blog) return <div className="text-center py-20">Bài viết không tìm thấy.</div>;

  return (
    <div className="container mx-auto py-20 px-4 max-w-3xl">
      <Button onClick={() => router.back()} className="mb-6 bg-gray-200">← Quay lại</Button>

      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

      {(blog.imageUrl || blog.thumbnail) && (
        <div className="mb-6">
          <img
            src={blog.imageUrl ? `http://localhost:8080${blog.imageUrl}` : `http://localhost:8080/uploads/${blog.thumbnail}`}
            alt={blog.title}
            className="w-full h-72 object-cover rounded"
          />
        </div>
      )}

      <div className="prose prose-lg whitespace-pre-line mb-6">{blog.content}</div>

      <p className="text-sm text-gray-600 mb-4"><strong>Tác giả:</strong> {blog.createdBy}</p>

      {blog.location && (
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Địa điểm</h4>
          {blog.location.name && <p><strong>Tên:</strong> {blog.location.name}</p>}
          {blog.location.description && <p><strong>Mô tả:</strong> {blog.location.description}</p>}
        </div>
      )}
    </div>
  );
}
