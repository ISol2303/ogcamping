"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import * as Select from "@radix-ui/react-select";
import { Check, Filter, Search } from "lucide-react";
import OpenAI from "openai";

interface Blog {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  thumbnail?: string;
  imageUrl?: string;
  status: string;
  rejectedReason?: string;
  location?: { id?: number; name?: string };
}

export default function StaffBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const stompClientRef = useRef<Client | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");




  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // check role
        let userResponse;
        try {
          userResponse = await axios.get("http://localhost:8080/apis/user");
        } catch (err) {
          userResponse = null;
        }
        if (userResponse && userResponse.data?.role !== "STAFF") {
          router.push("/login");
          return;
        }

        // fetch blogs ban đầu
        const blogsResponse = await axios.get(
          "http://localhost:8080/apis/blogs/staff/all"
        );
        setBlogs(Array.isArray(blogsResponse.data) ? blogsResponse.data : []);

        // --- Kết nối WebSocket ---
        const sock = new SockJS("http://localhost:8080/ws");
        const client = new Client({
          webSocketFactory: () => sock,
          reconnectDelay: 5000,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          onConnect: () => {
            console.log("✅ WebSocket connected!");

            // Hàm dùng chung cho private và broadcast
            const handleBlogUpdate = (message: IMessage) => {
              if (!message.body) return;

              const updatedBlog: Blog = JSON.parse(message.body);
              console.log("📩 Received blog update:", updatedBlog);

              // Cập nhật blogs
              setBlogs((prev) => {
                const map = new Map(prev.map((b) => [b.id, b]));
                map.set(updatedBlog.id, updatedBlog);
                return Array.from(map.values());
              });

              // Tạo thông báo
              let notification = "";
              if (updatedBlog.status === "DRAFT" && updatedBlog.rejectedReason) {
                notification = `Blog có tên "${updatedBlog.title}" bị từ chối bởi Admin có nội dung: ${updatedBlog.rejectedReason}`;
              } else {
                notification = `Blog "${updatedBlog.title}" đã được Admin cập nhật!`;
              }

              // Cập nhật notifications
              setNotifications((prev) => [...prev, notification]);

              // Hiển thị alert 1 lần duy nhất
              alert(notification);
            };

            // Subscribe riêng cho staff
            client.subscribe("/user/queue/blog-updates", handleBlogUpdate);

            // // Subscribe broadcast cho tất cả
            // client.subscribe("/topic/blog-updates", handleBlogUpdate);
          },
          onStompError: (frame) => {
            console.error("❌ Broker error:", frame.headers["message"]);
          },
        });

        client.activate();
        stompClientRef.current = client;
      } catch (err: any) {
        console.error("Lỗi fetchData:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          router.push("/login");
        } else {
          setError(err?.response?.data?.message || "Lỗi khi tải dữ liệu");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [router]);


  const handleSubmitForReview = async (id: number) => {
    if (!confirm("Gửi bài này lên Admin để duyệt chứ?")) return;
    try {
      await axios.put(`http://localhost:8080/apis/blogs/staff/${id}/submit`);
      setBlogs((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "PENDING" } : b))
      );
      alert("Đã gửi cho Admin");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Gửi thất bại");
    }
  };
  const filteredBlogs = blogs.filter((blog) => {
    const matchQuery =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.createdBy?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === "ALL" || blog.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">DRAFT</span>;
      case "PENDING":
        return <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">PENDING</span>;
      case "PUBLISHED":
        return <span className="bg-green-200 text-green-800 px-2 py-1 rounded">PUBLISHED</span>;
      case "UNPUBLISHED":
        return <span className="bg-red-200 text-red-800 px-2 py-1 rounded">UNPUBLISHED</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{status}</span>;
    }
  };
  const handleDeleteBlog = async (id: number) => {
    if (!confirm(`Bạn có chắc muốn xóa blog này không?`)) return;
    try {
      await fetch(`http://localhost:8080/api/blogs/${id}`, { method: "DELETE" });
      // Cập nhật blogs
      setBlogs(prev => prev.filter(blog => blog.id !== id));
      alert("Xóa blog thành công!");
    } catch (error) {
      console.error(error);
      alert("Xóa blog thất bại!");
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 text-center md:text-left">
          Quản lý Blogs
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/staff/blogs/create">
            <Button className="h-12 px-6 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition">
              + Tạo Blog mới
            </Button>
          </Link>

          <Button asChild className="h-12 px-6 bg-gray-700 hover:bg-gray-800 text-white shadow-md transition">
            <Link href="/" className="flex items-center gap-2">
              🏠 Về Home
            </Link>
          </Button>
        </div>
      </div>


      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            placeholder="Tìm theo tiêu đề hoặc tác giả..."
            className="pl-10 pr-3 border border-gray-300 rounded-lg w-full h-11 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>


        <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger className="w-44 h-11 border border-gray-300 rounded-lg flex items-center justify-between px-3 focus:ring-2 focus:ring-blue-400 transition">
            <Select.Value placeholder="Trạng thái" />
            <Select.Icon>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </Select.Icon>
          </Select.Trigger>

          {/* Content portalled để không ảnh hưởng aria-hidden */}
          <Select.Portal>
            <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-44 overflow-hidden z-50">
              <Select.Viewport>
                {["ALL", "DRAFT", "PENDING", "PUBLISHED", "UNPUBLISHED"].map((status) => (
                  <Select.Item
                    key={status}
                    value={status}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 relative flex items-center"
                  >
                    <Select.ItemText>{status === "ALL" ? "Tất cả" : status}</Select.ItemText>
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

      {/* Blog List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto pr-2">
        {filteredBlogs.map(blog => (
          <Card key={blog.id} className="shadow-md hover:shadow-xl transition rounded-lg overflow-hidden">
            {blog.imageUrl || blog.thumbnail ? (
              <img
                src={blog.imageUrl ? `http://localhost:8080${blog.imageUrl}` : `http://localhost:8080/uploads/${blog.thumbnail}`}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 italic">Không có ảnh</span>
              </div>
            )}
            <CardContent className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-800">{blog.title}</h3>
              <p className="text-sm text-gray-500">Tác giả: {blog.createdBy}</p>
              <p className="text-sm text-gray-700 line-clamp-3">{blog.content}</p>

              <div className="flex items-center justify-between mt-2 mb-2">
                {getStatusBadge(blog.status)}
                <span className="text-xs text-gray-400">{blog.location?.name || "-"}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {/* Trường hợp DRAFT */}
                {blog.status === "DRAFT" && (
                  <>
                    <Link href={`/staff/blogs/${blog.id}/edit`}>
                      <Button size="sm" variant="outline">Sửa</Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => handleSubmitForReview(blog.id)}>Submit</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa blog "${blog.title}" không?`)) {
                          handleDeleteBlog(blog.id);
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  </>
                )}
                {(blog.status === "PENDING" || blog.status === "PUBLISHED" || blog.status === "UNPUBLISHED") && (
                  <Link href={`/staff/blogs/${blog.id}`}>
                    <Button size="sm" variant="outline">Xem chi tiết</Button>
                  </Link>
                )}
              </div>

              {blog.status === "DRAFT" && blog.rejectedReason && (
                <div className="mt-2 text-red-700 text-sm bg-red-50 p-2 rounded border border-red-200">
                  <strong>Bị từ chối:</strong> {blog.rejectedReason}
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

}