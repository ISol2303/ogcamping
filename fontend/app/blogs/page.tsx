"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Blog {
  id: number;
  title: string;
  content: string;
  thumbnail?: string;
  imageUrl?: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/apis/blogs/public")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlogs(data);
        else if (Array.isArray(data.content)) setBlogs(data.content);
        else setBlogs([]);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setBlogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="container mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-10 text-center">Tất cả Blogs</h1>

      {blogs.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có bài blog nào.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-xl rounded-lg transition">
              <div className="h-48 overflow-hidden">
                <img
                  src={
                    blog.imageUrl
                      ? `http://localhost:8080${blog.imageUrl}`
                      : blog.thumbnail
                      ? `http://localhost:8080/uploads/${blog.thumbnail}`
                      : "/default-blog.jpg"
                  }
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{blog.title}</CardTitle>
                <CardDescription className="text-gray-700">{(blog.content || "").substring(0, 120)}...</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href={`/blogs/${blog.id}`}>Đọc thêm</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
