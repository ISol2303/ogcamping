"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as Select from "@radix-ui/react-select";
import { Search, Check } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  content: string;
  thumbnail?: string;
  imageUrl?: string;
  createdBy: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "UNPUBLISHED";
  type?: "USER" | "AI";
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/apis/blogs/admin");
      const data = await res.json();
      let blogsArray: Blog[] = [];
      if (Array.isArray(data)) blogsArray = data;
      else if (Array.isArray(data.content)) blogsArray = data.content;

      // Chỉ lấy PENDING và PUBLISHED
      blogsArray = blogsArray.filter(
        (b) => b.status === "PENDING" || b.status === "PUBLISHED"
      );
      setBlogs(blogsArray);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // WebSocket nhận blog mới từ staff
  useEffect(() => {
    const sock = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Admin WebSocket connected!");

        client.subscribe("/topic/admin/blog-updates", (message: IMessage) => {
          if (!message.body) return;
          const newBlog: Blog = JSON.parse(message.body);

          // Chỉ thêm blog PENDING hoặc PUBLISHED
          if (newBlog.status === "PENDING" || newBlog.status === "PUBLISHED") {
            setBlogs((prev) => [newBlog, ...prev]);
            alert(
              `📢 Staff vừa gửi blog: "${newBlog.title}" từ ${newBlog.createdBy}`
            );
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ Broker error:", frame.headers["message"]);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, []);

  // Action: Publish
  const handlePublish = async (id: number) => {
    setActionLoading(id);
    try {
      await fetch(`http://localhost:8080/apis/blogs/admin/${id}/publish`, {
        method: "POST",
      });
      await fetchBlogs();
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Action: Unpublish
  const handleUnpublish = async (id: number) => {
    setActionLoading(id);
    try {
      await fetch(`http://localhost:8080/apis/blogs/admin/${id}/unpublish`, {
        method: "POST",
      });
      await fetchBlogs();
    } catch (err) {
      console.error("Unpublish error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Action: AI Gen
  const handleAIGen = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetch(
        `http://localhost:8080/apis/blogs/admin/${id}/aigen`,
        { method: "POST" }
      );
      if (!res.ok) {
        const txt = await res.text();
        alert("AI Gen thất bại: " + txt);
        return;
      }
      const data = await res.json();
      if (data.status === "quota_exceeded") {
        alert("⚠️ AI Gen thất bại: Quota OpenAI đã hết. " + data.message);
      } else {
        alert(data.message);
      }
      await fetchBlogs();
    } catch (err) {
      console.error("AI gen error:", err);
      alert("Lỗi khi gọi AI Gen");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Filter blogs theo search + status
  const filteredBlogs = blogs.filter((blog) => {
    const query = searchQuery.toLowerCase();
    const matchQuery =
      blog.title.toLowerCase().includes(query) ||
      blog.createdBy.toLowerCase().includes(query);

    const matchStatus = statusFilter === "ALL" || blog.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
            DRAFT
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
            PENDING
          </span>
        );
      case "PUBLISHED":
        return (
          <span className="bg-green-200 text-green-800 px-2 py-1 rounded">
            PUBLISHED
          </span>
        );
      case "UNPUBLISHED":
        return (
          <span className="bg-red-200 text-red-800 px-2 py-1 rounded">
            UNPUBLISHED
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {status}
          </span>
        );
    }
  };

  if (loading)
    return <div className="text-center py-20">Đang tải danh sách...</div>;

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-center md:text-left mb-4 md:mb-0">
          Quản lý Blogs (Admin)
        </h1>
        <Button asChild className="bg-gray-700 hover:bg-gray-800 text-white">
          <Link href="/" className="px-4 py-2 rounded">
            🏠 Về Home
          </Link>
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            placeholder="Tìm theo tiêu đề hoặc tác giả..."
            className="pl-10 pr-3 border border-gray-300 rounded-lg w-full h-11 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter */}
        <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger className="w-44 h-11 border border-gray-300 rounded-lg flex items-center justify-between px-3 focus:ring-2 focus:ring-blue-400 transition">
            <Select.Value placeholder="Trạng thái" />
            <Select.Icon>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-44 overflow-hidden z-50">
              <Select.Viewport>
                {["ALL", "PENDING", "PUBLISHED"].map((status) => (
                  <Select.Item
                    key={status}
                    value={status}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 relative flex items-center"
                  >
                    <Select.ItemText>
                      {status === "ALL" ? "Tất cả" : status}
                    </Select.ItemText>
                    <Select.ItemIndicator className="absolute left-1">
                      <Check className="w-4 h-4 text-blue-600" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p>Không có blog nào phù hợp với tìm kiếm / bộ lọc.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((b) => (
            <Card
              key={b.id}
              className="shadow-lg hover:shadow-2xl transition rounded-lg overflow-hidden"
            >
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={
                    b.imageUrl
                      ? `http://localhost:8080${b.imageUrl}`
                      : b.thumbnail
                      ? `http://localhost:8080/uploads/${b.thumbnail}`
                      : "/default-blog.jpg"
                  }
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader className="px-4 pt-4">
                <CardTitle className="text-xl font-semibold">
                  {b.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Tác giả: <span className="font-medium">{b.createdBy}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Trạng thái:{" "}
                  <span className="font-semibold">{getStatusBadge(b.status)}</span>
                </p>
              </CardHeader>

              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <Link
                      href={`/admin/blogs/${b.id}`}
                      className="w-full text-center"
                    >
                      Xem chi tiết
                    </Link>
                  </Button>

                  {b.status === "PENDING" && (
                    <>
                      <Button
                        onClick={() => handleAIGen(b.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={actionLoading === b.id}
                      >
                        {actionLoading === b.id ? "Đang xử lý..." : "AI Gen"}
                      </Button>

                      <Button
                        onClick={() => handlePublish(b.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={actionLoading === b.id}
                      >
                        {actionLoading === b.id ? "Đang xử lý..." : "PUBLISH"}
                      </Button>
                    </>
                  )}

                  {b.status === "PUBLISHED" && (
                    <Button
                      onClick={() => handleUnpublish(b.id)}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      disabled={actionLoading === b.id}
                    >
                      {actionLoading === b.id
                        ? "Đang xử lý..."
                        : "UNPUBLISH"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
