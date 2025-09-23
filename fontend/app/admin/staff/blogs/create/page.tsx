"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (locationName) formData.append("locationName", locationName);
    if (locationDescription) formData.append("locationDescription", locationDescription);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      const res = await fetch("http://localhost:8080/apis/blogs/staff/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        alert("Lỗi tạo blog: " + txt);
        return;
      }

      router.push("/staff/blogs");
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Lỗi mạng khi tạo blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Tạo Blog mới</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Tiêu đề</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Nội dung</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Tên địa điểm (tuỳ chọn)</label>
          <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block font-medium mb-1">Mô tả địa điểm (tuỳ chọn)</label>
          <textarea value={locationDescription} onChange={(e) => setLocationDescription(e.target.value)} rows={3} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block font-medium mb-1">Thumbnail</label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} className="w-full" />
          {thumbnail && <p className="text-sm text-gray-500 mt-1">Đã chọn: {thumbnail.name}</p>}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo Blog"}
          </button>

          <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-gray-300 rounded">Hủy</button>
        </div>
      </form>
    </div>
  );
}
