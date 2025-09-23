"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Location {
  id: number;
  name: string;
  description: string; // thêm description
}


export default function EditBlogPage() {
  const params = useParams();
  const blogId = params.id;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [status, setStatus] = useState("DRAFT");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("");
  const [locationDescription, setLocationDescription] = useState("");


  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [blogRes, locRes] = await Promise.all([
          fetch(`http://localhost:8080/apis/blogs/staff/${blogId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8080/apis/locations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!blogRes.ok) throw new Error("Lấy blog thất bại");
        if (!locRes.ok) throw new Error("Lấy locations thất bại");

        const blogData = await blogRes.json();
        const locData = await locRes.json();

        setTitle(blogData.title || "");
        setContent(blogData.content || "");
        setPreview(blogData.imageUrl ? `http://localhost:8080${blogData.imageUrl}` : (blogData.thumbnail ? `http://localhost:8080/uploads/${blogData.thumbnail}` : ""));
        setStatus(blogData.status || "DRAFT");
        setLocationId(blogData.location?.id ?? "");

        setLocations(Array.isArray(locData) ? locData : locData.content ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Lỗi khi load dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [blogId, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (locationId !== "") {
      formData.append("locationName", locationName);
      formData.append("locationDescription", locationDescription);
    }
    // backend expects name/description if creating new; we send id via locationId param originally but your backend update expects locationName/locationDescription; keep existing behavior from your backend
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      const res = await fetch(`http://localhost:8080/apis/blogs/staff/${blogId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      router.push("/staff/blogs");
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Cập nhật thất bại");
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Sửa Blog</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Tiêu đề</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Nội dung</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Thumbnail</label>
          {preview && <img src={preview} alt="preview" className="w-32 h-20 object-cover rounded mb-2" />}
          <input type="file" accept="image/*" onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setThumbnail(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }
          }} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block font-medium mb-1">Location</label>
          <select
            value={locationId}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : "";
              setLocationId(id);

              if (id) {
                // Tìm location tương ứng
                const loc = locations.find((l) => l.id === id);
                if (loc) {
                  setLocationName(loc.name);         // tự động điền name
                  setLocationDescription(loc.description); // tự động điền description
                }
              } else {
                // Reset nếu không chọn
                setLocationName("");
                setLocationDescription("");
              }
            }}
            className="w-full border rounded p-2"
          >
            <option value="">-- Không chọn --</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>



        <div>
          <label className="block font-medium mb-1">Trạng thái</label>
          <input type="text" value={status} disabled className="w-full border rounded p-2 bg-gray-100" />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Cập nhật</button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-gray-300 rounded">Quay lại</button>
        </div>
      </form>
    </div>
  );
}
