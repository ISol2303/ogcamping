'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Tent,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Bell,
  Settings,
  LogOut,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  Plus,
  Trash2,
  Upload,
  Edit,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { DialogHeader } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import React from 'react';
import { BarChart } from 'recharts/types/chart/BarChart';
import { LineChart, Bar, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';



interface Order {
  id: string;
  orderCode: string;
  customerName: string;        // sửa từ customer -> customerName
  email: string;               // thêm email
  phone: string;
  people: number;              // thêm số lượng người
  bookingDate: string;         // sửa từ date -> bookingDate
  totalPrice: number;          // thêm tổng giá
  specialRequests: string;     // thêm yêu cầu đặc biệt
  emergencyContact: string;    // thêm thông tin liên hệ khẩn cấp
  emergencyPhone: string;      // thêm số điện thoại khẩn cấp
  priority: 'NORMAL' | 'HIGH' | 'LOW';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; // sửa status cho trùng backend
  emailSentAt?: string | null;
  items: OrderItem[];
}



interface EquipmentCheck {
  _id: string;
  name: string;
  code: string;
  lastCheck: string;
  nextCheck: string;
  status: 'due' | 'upcoming' | 'overdue';
}

interface Stat {
  title: string;
  value: string;
  icon: keyof typeof iconMap; // Restrict to iconMap keys
  color: string;
}

// Define iconMap with explicit types
const iconMap: { [key: string]: LucideIcon } = {
  Calendar,
  Clock,
  CheckCircle,
  Package,
};
interface OrderItem {
  orderId: number;
  dishId: number;
  dishName: string;
  category: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderDetails {
  orderId: number;
  orderCode: string;
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  totalOrderPrice: number;
  status: 'ALL' | 'PENDING' | 'CONFIRMED';
}
interface Props {
  orderId: number | null;
  customerName: string; // Có thể null khi chưa chọn đơn
}
interface HorizontalTablePaginationProps {
  items: any[];
  columnsPerPage: number;
  renderCell: (item: any, colIndex: number) => React.ReactNode;
}
function parseJwt(token: string): { role?: string; staffId?: string | number } | null {
  try {
    const base64Payload = token.split('.')[1]; // phần payload
    if (!base64Payload) return null;
    const jsonPayload = atob(base64Payload); // decode base64
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Lỗi parse JWT:', err);
    return null;
  }
}

export default function StaffDashboard({ orderId }: Props) {
  const [selectedTab, setSelectedTab] = useState('orders');
  const [stats, setStats] = useState<Stat[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [equipmentChecks, setEquipmentChecks] = useState<EquipmentCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOrders, setSearchOrders] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [ordersForDishes, setOrdersForDishes] = useState<Order[]>([]); // dùng để list order
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, any[]>>({}); // orderId -> items[]
  const [loadingDetailsFor, setLoadingDetailsFor] = useState<string | null>(null);
  const [loadingBatchCheck, setLoadingBatchCheck] = useState(false);
  const [selectedOrderForItems, setSelectedOrderForItems] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  // ==== UPLOAD IMAGE (CARD RIÊNG) ====
  const [showUploadCard, setShowUploadCard] = useState(false);
  const [uploadTargetDish, setUploadTargetDish] = useState<any | null>(null);
  const [uploadImageFile, setUploadImageFile] = useState<File | null>(null);
  const [uploadImagePreview, setUploadImagePreview] = useState<string | null>(null);
  const [sendingEmailIds, setSendingEmailIds] = useState<string[]>([]); // lưu id các đơn đang gửi
  const [sendingAllEmail, setSendingAllEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sentEmailIds, setSentEmailIds] = useState<number[]>([]);
  //DISH
  const [dishes, setDishes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  //Add DISH
  const [showAddCard, setShowAddCard] = useState(false);
  const [newDish, setNewDish] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    category: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  //EDIT DISH
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  // State dùng để polling dữ liệu order mới từ backend
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null);
  const [lastItemId, setLastItemId] = useState<number | null>(null);
  const [pageMap, setPageMap] = useState<{ [orderId: string]: number }>({});

  const [message, setMessage] = useState("");

  const itemsPerPage = 5;
  const [selectedCustomerOrder, setSelectedCustomerOrder] = useState<any | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsFilterStatus, setReviewsFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'>('PENDING');
  const [searchReviews, setSearchReviews] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null); // để show modal xem chi tiết
  const [replyText, setReplyText] = useState('');
  const [processingIds, setProcessingIds] = useState<number[]>([]); // ids đang xử lý (loading)







  const router = useRouter();
  // const [selectedTab, setSelectedTab] = useState("orders")
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token =
          localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          console.log('Token không tồn tại, redirect login');
          router.push('/login');
          return;
        }

        // Set default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 1️⃣ Lấy user
        const userResponse = await axios.get('http://localhost:8080/apis/user');
        const role = userResponse.data.role;
        console.log('User role:', role);
        if (!['STAFF', 'manager', 'guide'].includes(role)) {
          router.push('/login');
          return;
        }

        // 2️⃣ Lấy thống kê
        const statsResponse = await axios.get('http://localhost:8080/stats/staff');
        setStats(statsResponse.data.stats);

        // 3️⃣ Lấy tất cả orders
        const ordersResponse = await axios.get('http://localhost:8080/apis/orders');
        console.log('Orders Response:', ordersResponse.data);

        // Convert bookingDate về string để frontend hiển thị
        const orders: Order[] = ordersResponse.data.map((order: any) => ({
          ...order,
          bookingDate: order.bookingDate || order.date || '', // fallback nếu khác tên field
        }));
        setPendingOrders(orders);

        // 4️⃣ Lấy equipment checks
        const equipmentResponse = await axios.get('http://localhost:8080/equipment/checks');
        setEquipmentChecks(equipmentResponse.data);
      } catch (err: any) {
        console.error('Lỗi fetchData:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          router.push('/login');
        } else {
          setError(err.response?.data?.error || 'Lỗi khi tải dữ liệu');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersResponse = await axios.get('http://localhost:8080/apis/orders/all');
        setPendingOrders(ordersResponse.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách order:", error);
      }
    };

    fetchOrders();
  }, []);
  //list order
  const handleViewOrder = (order: any) => {
    console.log("👉 handleViewOrder called with:", order); // log ngay đầu
    setSelectedOrder(order);
    try {
      if (!order) {
        throw new Error("Không tìm thấy dữ liệu đơn hàng");
      }
      setSelectedOrder(order);
      setError(null);
    } catch (err: any) {
      console.error("Lỗi khi chọn đơn hàng:", err.message);
      setError(err.message);
      setSelectedOrder(null);
    }
  };
  //xác nhận đơn hàng 
  const handleConfirmOrder = async (order: Order) => {
    try {
      if (!order || !order.id) {
        alert("Không tìm thấy đơn hàng để xác nhận!");
        return;
      }

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.patch(
        `http://localhost:8080/apis/orders/${order.id}/confirm`,
        {},
        config
      );

      if (response.data?.status === "CONFIRMED") {
        setPendingOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: 'CONFIRMED' } : o))
        );
        alert(`✅ Đơn hàng ${order.orderCode} đã được xác nhận và email gửi thành công!`);
      } else {
        alert("❌ Có lỗi xảy ra khi xác nhận đơn!");
      }

    } catch (err: any) {
      console.error("❌ Lỗi xác nhận đơn:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Không thể xác nhận đơn hàng. Vui lòng thử lại.");
    }
  };

  //xác nhận all đơn hàng 
  // Xác nhận tất cả đơn hàng đang PENDING
  const handleConfirmAllOrders = async () => {
    try {
      const response = await axios.patch(
        "http://localhost:8080/apis/orders/confirm-all",
        {}, // body rỗng
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("✅ Xác nhận tất cả đơn:", response.data);

      // Cập nhật UI: đánh dấu tất cả đơn đang PENDING thành CONFIRMED
      setPendingOrders((prev) =>
        prev.map((o) => (o.status === "PENDING" ? { ...o, status: "CONFIRMED" } : o))
      );

      alert("Đã xác nhận tất cả đơn hàng PENDING!");
    } catch (error: any) {
      console.error("❌ Lỗi xác nhận tất cả đơn:", error.response?.data || error.message);
      alert("Không thể xác nhận tất cả đơn. Vui lòng thử lại!");
    }
  };


  // // send email single
  // const handleSendEmailSingle = async (order: Order) => {
  //   if (!order || !order.id) return;

  //   // 🔥 Thêm vào danh sách đang gửi email (loading)
  //   setSendingEmailIds(prev => [...prev, order.id]);

  //   try {
  //     const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  //     if (!token) {
  //       alert("Token không tồn tại, vui lòng đăng nhập lại!");
  //       return;
  //     }

  //     const config = { headers: { Authorization: `Bearer ${token}` } };

  //     // Gửi email qua API
  //     const response = await axios.patch(
  //       `http://localhost:8080/apis/orders/${order.id}/send-email`,
  //       {},
  //       config
  //     );

  //     alert(`✅ ${response.data}`);

  //     // 🔥 Cập nhật trạng thái emailSentAt trên frontend để disable nút gửi email
  //     setPendingOrders(prev =>
  //       prev.map(o =>
  //         o.id === order.id ? { ...o, emailSentAt: new Date().toISOString() } : o
  //       )
  //     );

  //   } catch (err: any) {
  //     console.error("❌ Lỗi gửi email đơn:", err.response?.data || err.message);
  //     alert("Không thể gửi email đơn. Vui lòng thử lại!");
  //   } finally {
  //     // 🔥 Xóa khỏi danh sách đang gửi email
  //     setSendingEmailIds(prev => prev.filter(id => id !== order.id));
  //   }
  // };


  //send email all
  const handleSendEmailAll = async () => {
    // Kiểm tra pendingOrders có dữ liệu
    if (!pendingOrders || !Array.isArray(pendingOrders) || pendingOrders.length === 0) {
      console.warn("Không có đơn hàng nào đang PENDING để gửi email");
      return;
    }

    // Tất cả đơn đang gửi
    setSendingEmailIds(pendingOrders.map(o => o.id));

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.patch("http://localhost:8080/apis/orders/send-email-all", {}, config);

      const { successIds = [], failedIds = [] } = response.data || {};

      // Cập nhật trạng thái đã gửi và đang gửi
      setSentEmailIds(prev => [...prev, ...successIds]);
      setSendingEmailIds(prev => prev.filter(id => !successIds.includes(id)));

      if (failedIds.length) {
        alert(`❌ Một số đơn gửi email thất bại: ${failedIds.join(", ")}`);
      } else {
        alert("✅ Gửi email tất cả thành công!");
      }

    } catch (err: any) {
      console.error("❌ Lỗi gửi email tất cả:", err.response?.data || err.message);
      alert("❌ Không thể gửi email tất cả. Vui lòng thử lại!");
      setSendingEmailIds([]);
    }
  };


  //in hóa đơn 
  const handlePrintInvoice = async (orderId: number) => {
    try {
      // Gọi backend Spring Boot trên port 8080
      const response = await axios.get(`http://localhost:8080/apis/orders/${orderId}/invoice`, {
        responseType: "blob", // quan trọng để nhận PDF
      });

      // Kiểm tra dữ liệu trả về
      if (!response.data) {
        throw new Error("Không có dữ liệu PDF từ server");
      }

      // Tạo URL tạm cho file PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = window.URL.createObjectURL(blob);

      // Tạo link download tạm thời
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute("download", `invoice_${orderId}.pdf`);
      document.body.appendChild(fileLink);
      fileLink.click();

      // Xóa link tạm
      fileLink.remove();
      window.URL.revokeObjectURL(fileURL); // giải phóng bộ nhớ
    } catch (error: any) {
      console.error("Lỗi khi tải hóa đơn:", error);
      alert(
        error.response?.status === 404
          ? "Không tìm thấy hóa đơn. Vui lòng kiểm tra ID đơn hàng!"
          : "Không thể tải hóa đơn. Vui lòng thử lại!"
      );
    }
  };

  //DISH


  // ===== Lọc dữ liệu + reset id khi cần =====
  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    let filtered = dishes
      .filter((dish: any) =>
        dish.name?.toLowerCase().includes((search || "").toLowerCase())
      )
      .filter((dish: any) =>
        categoryFilter === "ALL"
          ? true
          : dish.category?.toUpperCase() === categoryFilter
      );

    // ⚡ CHỈNH SỬA Ở ĐÂY:
    // Nếu đang lọc category (khác ALL) → reset id tạm theo thứ tự
    if (categoryFilter !== "ALL") {
      filtered = filtered.map((dish: any, index: number) => ({
        ...dish,
        tempId: index + 1, // id hiển thị tạm (1,2,3...)
      }));
    } else {
      filtered = filtered.map((dish: any) => ({
        ...dish,
        tempId: dish.id, // giữ nguyên id gốc DB
      }));
    }

    setFilteredDishes(filtered);
  }, [dishes, search, categoryFilter]);

  const fetchDishes = async () => {
    try {
      const res = await axios.get("http://localhost:8080/apis/dishes/all");
      setDishes(res.data);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  };


  const handleDelete = async (id: number) => {
    await axios.delete(`http://localhost:8080/apis/dishes/${id}`);
    fetchDishes();
  };

  //Add DISH

  const handleAddDish = async () => {
    try {
      if (!newDish.name || !newDish.price || !newDish.quantity || !newDish.category) {
        alert("Vui lòng điền đầy đủ thông tin món ăn!");
        return;
      }

      const validCategories = ["APPETIZER", "BBQ", "HOTPOT", "SNACK", "DESSERT", "DRINK"];
      if (!validCategories.includes(newDish.category.toUpperCase())) {
        alert("Category không hợp lệ! Chọn một trong:APPETIZER, HOTPOT, BBQ, SNACK, DESSERT, DRINK");
        return;
      }

      const formData = new FormData();
      formData.append("name", newDish.name);
      formData.append("description", newDish.description || "");
      formData.append("price", String(newDish.price));
      formData.append("quantity", String(newDish.quantity));
      formData.append("category", newDish.category.toUpperCase());

      if (imageFile) {
        formData.append("file", imageFile);
      }

      const response = await axios.post(
        "http://localhost:8080/apis/dishes/createWithImage",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Thêm món ăn thành công!");
      fetchDishes();
      setShowAddCard(false);
      setNewDish({ name: "", description: "", price: 0, quantity: 0, category: "", imageUrl: "" });
      setImageFile(null);
      setImagePreview(null);

    } catch (err: any) {
      console.error("Add dish error:", err.response?.data || err.message);
      alert("Không thể thêm món ăn. Vui lòng thử lại!");
    }
  };





  // state mới


  // xử lý chọn file DISH
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // hiển thị preview
    }
  };
  //EDIT DISH


  const handleEditClick = (dish: any) => {
    setEditingDish({ ...dish });   // clone tránh sửa trực tiếp list
    setShowEditCard(true);
  };

  const handleUpdateDishText = async () => {
    try {
      if (!editingDish) return;

      await axios.put(
        `http://localhost:8080/apis/dishes/edit/${editingDish.id}`,
        editingDish
      );

      alert("Cập nhật món ăn thành công!");
      fetchDishes();
      setShowEditCard(false);
      setEditingDish(null);
    } catch (error) {
      console.error("Update dish error:", error);
      alert("Không thể cập nhật món ăn. Vui lòng thử lại!");
    }
  };





  const handleOpenUpload = (dish: any) => {
    setUploadTargetDish(dish);
    setUploadImageFile(null);
    setUploadImagePreview(null);
    setShowUploadCard(true);
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadImageFile(file);
    setUploadImagePreview(URL.createObjectURL(file));
  };

  const handleSubmitUploadImage = async () => {
    try {
      if (!uploadTargetDish || !uploadImageFile) {
        alert("Vui lòng chọn ảnh!");
        return;
      }

      const formData = new FormData();
      // 🔑 phải đúng "file" vì backend @RequestParam("file")
      formData.append("file", uploadImageFile);

      const response = await axios.put(
        `http://localhost:8080/apis/dishes/editImage/${uploadTargetDish.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Cập nhật hình ảnh thành công!");
      console.log("Server response:", response.data);

      fetchDishes();
      setShowUploadCard(false);
      setUploadTargetDish(null);
      setUploadImageFile(null);
      setUploadImagePreview(null);
    } catch (error: any) {
      console.error("❌ Update image error:", error);

      if (error.response) {
        console.error("📌 Response data:", error.response.data);
        console.error("📌 Status:", error.response.status);
        console.error("📌 Headers:", error.response.headers);
      } else if (error.request) {
        console.error("📌 Request (no response):", error.request);
      } else {
        console.error("📌 Error message:", error.message);
      }

      alert("Không thể cập nhật hình ảnh. Vui lòng thử lại!");
    }
  };



  //order
  const [orderCode, setOrderCode] = useState<string>("");
  useEffect(() => {
    const code = localStorage.getItem("orderCode"); // ✅ lấy lại từ localStorage
    if (code) {
      setOrderCode(code);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Hủy</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  // const getPriorityBadge = (priority: string) => {
  //   switch (priority.toUpperCase()) {
  //     case 'HIGH':
  //       return <Badge variant="destructive">Cao</Badge>;
  //     case 'NORMAL':
  //       return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
  //     case 'LOW':
  //       return <Badge className="bg-green-100 text-green-800">Thấp</Badge>;
  //     default:
  //       return <Badge variant="secondary">Bình thường</Badge>;
  //   }
  // };

  const filteredOrders = pendingOrders.filter((order) => {
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchOrders.toLowerCase()) ||
      order.id.toLowerCase().includes(searchOrders.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  //add thêm món 
  // const [isFirstLoad, setIsFirstLoad] = useState(true);

  // // 1️⃣ Fetch dữ liệu và return
  // const fetchAddedDishes = async (): Promise<any[]> => {
  //   try {
  //     console.log("🔹 Bắt đầu fetchAddedDishes...");
  //     const res = await axios.get("http://localhost:8080/apis/orders/all-added-dishes");
  //     console.log("✅ fetchAddedDishes thành công:", res.data);
  //     return res.data; // Trả về dữ liệu
  //   } catch (err) {
  //     console.error("❌ Lỗi fetchAddedDishesData:", err);
  //     return []; // Trả về mảng rỗng nếu lỗi
  //   }
  // };

  // // 2️⃣ Xử lý hiển thị thông báo đơn mới
  // const notifyNewOrders = (fetchedOrders: any[], currentOrders: any[]) => {
  //   try {
  //     console.log("🔹 Bắt đầu notifyNewOrders...");
  //     if (!isFirstLoad) {
  //       const newOrders = fetchedOrders.filter(
  //         (o) => !currentOrders.some((existing) => existing.orderId === o.orderId)
  //       );
  //       console.log("🔹 Các đơn mới:", newOrders);
  //       newOrders.forEach((o) => alert(`Đơn hàng mới từ khách: ${o.customerName}`));
  //     }
  //   } catch (err) {
  //     console.error("❌ Lỗi notifyNewOrders:", err);
  //   }
  // };

  // // 3️⃣ Thêm trạng thái Pending mặc định
  // const addPendingStatus = (ordersData: any[]) => {
  //   try {
  //     console.log("🔹 Bắt đầu addPendingStatus...");
  //     const result = ordersData.map((o) => ({
  //       ...o,
  //       status: o.status || "PENDING",
  //     }));
  //     console.log("✅ addPendingStatus kết quả:", result);
  //     return result;
  //   } catch (err) {
  //     console.error("❌ Lỗi addPendingStatus:", err);
  //     return ordersData;
  //   }
  // };

  // // 4️⃣ Xử lý xác nhận đơn
  // const confirmOrderAddDish = (orderIndex: number, orders: any[], setOrders: any) => {
  //   try {
  //     console.log("🔹 Bắt đầu confirmOrderAddDish cho orderIndex:", orderIndex);
  //     const newOrders = [...orders];
  //     const order = newOrders[orderIndex];
  //     if (order.status !== "CONFIRMED") {
  //       order.status = "CONFIRMED";

  //       // Gọi API backend
  //       axios
  //         .post(`http://localhost:8080/apis/orders/${order.orderId}/confirm-added-dishes`)
  //         .then(() => {
  //           console.log(`✅ Đơn ${order.orderCode} đã được xác nhận`);
  //           alert(`✅ Đơn ${order.orderCode} đã được xác nhận`);
  //         })
  //         .catch((err) => {
  //           console.error("❌ Lỗi khi gọi API xác nhận:", err);
  //           alert("❌ Xác nhận thất bại, thử lại!");
  //         });

  //       setOrders(newOrders);
  //     }
  //   } catch (err) {
  //     console.error("❌ Lỗi confirmOrderAddDish:", err);
  //   }
  // };

  // // 5️⃣ useEffect load dữ liệu khi mount component
  // useEffect(() => {
  //   const loadOrders = async () => {
  //     try {
  //       console.log("🔹 Bắt đầu loadOrders...");
  //       const fetched = await fetchAddedDishes(); // fetched là mảng dữ liệu
  //       const withStatus = addPendingStatus(fetched); // thêm status Pending
  //       setOrders(withStatus);                     // cập nhật state

  //       if (!isFirstLoad) {                        // chỉ thông báo nếu không phải lần đầu
  //         notifyNewOrders(withStatus, orders);     // hiển thị alert cho đơn mới
  //       }

  //       console.log("✅ loadOrders hoàn tất, orders set:", withStatus);
  //       setIsFirstLoad(false);                     // đánh dấu đã load lần đầu
  //     } catch (err) {
  //       console.error("❌ Lỗi loadOrders useEffect:", err);
  //     }
  //   };

  //   loadOrders();
  // }, []);
  // Fetch tất cả đơn hàng

  // const fetchAllOrders = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const token =
  //       localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  //     if (!token) return;

  //     const res = await axios.get<OrderDetails[]>(
  //       "http://localhost:8080/apis/orders/all-details",
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     // Lọc ra đơn mới so với state hiện tại
  //     const prevOrderIds = orders.map((o) => o.orderId);
  //     const newOrders = res.data.filter((o) => !prevOrderIds.includes(o.orderId));

  //     if (newOrders.length > 0) {
  //       // Hiển thị thông báo email khách hàng
  //       newOrders.forEach((order) =>
  //         alert(`Đơn hàng mới từ: ${order.email}`)
  //       );

  //       // Cập nhật state với toàn bộ đơn hàng mới
  //       setOrders(res.data);

  //       // Nếu muốn load lại toàn bộ trang:
  //       // window.location.reload();
  //       console.log("✅ Cập nhật đơn hàng mới:", res.data);
  //     }
  //   } catch (err: any) {
  //     setError(
  //       err.response?.data?.message || err.message || "Lỗi không xác định"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Polling mỗi 5 giây
  // useEffect(() => {
  //   fetchAllOrders();

  // }, [orders]); // thêm orders vào dependency để so sánh


  const fetchAllOrders = async () => {
    try {
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) return;

      const res = await axios.get<any[]>(
        "http://localhost:8080/apis/orders/all-items",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const ordersData = res.data; // Đây là mảng orders

      // Cập nhật state (thay vì push từng order thì set toàn bộ luôn)
      setOrders(ordersData);

      console.log("✅ Danh sách đơn hàng:", ordersData);
    } catch (err: any) {
      console.error("❌ Lỗi fetchAllOrders:", err);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);
  // Lọc đơn hàng món thêm theo searchTerm


  const searchedOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const getCurrentItems = (orderId: string, items: OrderItem[]) => {
    const page = pageMap[orderId] || 1;
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  // Chuyển trang
  const changePage = (orderId: string, newPage: number, totalPages: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPageMap((prev) => ({ ...prev, [orderId]: newPage }));
  };

  // Ví dụ handle gửi tin nhắn
  const handleSendMessage = () => {
    if (!selectedOrder) return;
    console.log("Gửi tin nhắn đến:", selectedOrder.customerName, message);
    setMessage("");
    setSelectedOrder(null);
  };

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log("✅ Connected to WS");
      // Subscribe channel
      stompClient.subscribe("/topic/order-updates", (message) => {
        const data = JSON.parse(message.body);
        alert(data.message);
        console.log("📩 WS update:", data);
        // TODO: gọi API refresh list orders
      });
    });

    return () => {
      stompClient.disconnect();
    };
  }, []);
  const handlePrintDishesInvoice = async (orderId: number) => {
    if (!orderId) return;

    try {
      const res = await axios.get(`http://localhost:8080/pdf/bill/dishes/${orderId}`, {
        responseType: 'blob', // quan trọng: nhận file dạng blob
      });

      // Tạo link để tải PDF
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("❌ Lỗi khi in hóa đơn:", err);
      alert("Lỗi khi in hóa đơn! Vui lòng thử lại.");
    }
  };

  const revenues = [
    { month: 1, value: 8000000 },
    { month: 2, value: 9500000 },
    { month: 3, value: 12000000 },
    { month: 4, value: 10500000 },
    { month: 5, value: 15000000 },
    { month: 6, value: 9000000 },
    { month: 7, value: 11000000 },
    { month: 8, value: 20000000 },
    { month: 9, value: 9500000 },
  ];

  // Tính toán thông số
  const { total, average, maxMonth } = useMemo(() => {
    const total = revenues.reduce((sum, r) => sum + r.value, 0);
    const average = Math.round(total / revenues.length);
    const maxMonth = revenues.reduce((max, r) =>
      r.value > max.value ? r : max
    );
    return { total, average, maxMonth };
  }, [revenues]);

  useEffect(() => {
    // chỉ fetch khi switch tab sang reviews
    if (selectedTab !== 'reviews') return;
    fetchReviews();
  }, [selectedTab, reviewsFilterStatus]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      // backend: nếu status=ALL thì backend trả tất cả, hoặc ta truyền 'ALL'
      const statusParam = reviewsFilterStatus || 'ALL';
      const res = await axios.get(`http://localhost:8080/apis/v1/reviews/staff?status=${statusParam}`);
      console.log("Fetched reviews:", res.data);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy reviews:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const setProcessing = (id: number, adding: boolean) => {
    setProcessingIds(prev => adding ? [...prev, id] : prev.filter(x => x !== id));
  };

  const handleUpdateStatus = async (reviewId: number, status: 'APPROVED' | 'REJECTED' | 'HIDDEN', reason = '') => {
    try {
      setProcessing(reviewId, true);
      await axios.put(`http://localhost:8080/apis/v1/reviews/${reviewId}/status`, {
        status,
        reason
      });
      // cập nhật local list nhanh UI
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
    } catch (err) {
      console.error("Lỗi cập nhật status:", err);
      alert("Không thể cập nhật trạng thái. Thử lại.");
    } finally {
      setProcessing(reviewId, false);
    }
  };

  const handleReply = async (reviewId: number) => {
    if (!replyText.trim()) {
      alert("Nhập nội dung phản hồi trước khi gửi.");
      return;
    }
    try {
      setProcessing(reviewId, true);
      // backend expects raw body string
      await axios.put(`http://localhost:8080/apis/v1/reviews/${reviewId}/reply`, replyText, {
        headers: { 'Content-Type': 'text/plain' }
      });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: replyText } : r));
      setReplyText('');
      alert("Đã phản hồi review.");
    } catch (err) {
      console.error("Lỗi reply:", err);
      alert("Không thể phản hồi. Thử lại.");
    } finally {
      setProcessing(reviewId, false);
    }
  };



  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="container mx-auto px-4 py-8">

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Nhân viên</h1>
          <p className="text-gray-600">Quản lý đơn hàng và thiết bị</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon]; // Now properly typed
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="flex gap-2 flex-nowrap overflow-x-auto">
            <TabsTrigger value="orders" className="whitespace-nowrap px-3 py-1">Đơn hàng</TabsTrigger>
            <TabsTrigger value="dish" className="whitespace-nowrap px-3 py-1">Danh mục món ăn</TabsTrigger>
            <TabsTrigger value="customers" className="whitespace-nowrap px-3 py-1">Khách hàng</TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap px-3 py-1">Báo cáo</TabsTrigger>
            <TabsTrigger value="reviews" className="whitespace-nowrap px-3 py-1">Đánh giá</TabsTrigger>
            <TabsTrigger value="shifts" asChild>
              <Link href="/staff/shifts" className="whitespace-nowrap px-3 py-1">
                Lịch trực
              </Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đơn hàng cần xử lý</CardTitle>
                    <CardDescription>Danh sách đơn hàng đang chờ xử lý</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm đơn hàng..."
                      className="pl-10"
                      value={searchOrders}
                      onChange={(e) => setSearchOrders(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả</SelectItem>
                      <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                      <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                      <SelectItem value="CANCELLED">Hủy</SelectItem>

                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-y-auto max-h-[500px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Mã đơn hàng</TableHead>
                        <TableHead>Email khách hàng </TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead >Giá đơn</TableHead>
                        <TableHead>Ngày</TableHead>
                        {/* <TableHead>Ưu tiên</TableHead> */}
                        <TableHead className="w-[110px] text-center align-middle">Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell className="font-medium">{order.orderCode}</TableCell>

                          <TableCell className="font-medium">{order.email}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium w-[150px] truncate]" >{order.customerName}</p>
                              <p className="text-sm text-gray-600">{order.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">{order.totalPrice ? order.totalPrice.toLocaleString() + ' đ' : '-'} </TableCell>
                          <TableCell>{new Date(order.bookingDate).toLocaleString()}</TableCell>
                          {/* <TableCell>{getPriorityBadge(order.priority)}</TableCell> */}
                          <TableCell className="min-w-[180px] text-center align-middle">{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log("👉 Eye clicked for order:", order); // log khi click
                                  handleViewOrder(order);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                className="min-w-[110px] text-center align-middle "
                                size="sm"
                                disabled={order.status === 'CONFIRMED'} // disable nếu đã xác nhận
                                onClick={() => handleConfirmOrder(order)}
                              >
                                ✅ Xác nhận
                              </Button>
                              {/* <Button
                                variant="ghost"
                                size="sm"
                                disabled={!!order.emailSentAt || sendingEmailIds.includes(order.id)} // đã gửi hoặc đang gửi
                                onClick={() => handleSendEmailSingle(order)}
                              >
                                <Mail className="w-4 h-4" />
                              </Button> */}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>



                  </Table>
                </div>
              </CardContent>
            </Card>


            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Xử lý nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={handleConfirmAllOrders}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Xác nhận tất cả đơn hàng
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSendEmailAll}
                    disabled={sendingAllEmail}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {sendingAllEmail ? "Đang gửi email..." : "Gửi email tất cả"}
                  </Button>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ghi chú nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="Ghi chú về đơn hàng, khách hàng..." rows={4} />
                  <Button className="w-full mt-3">Lưu ghi chú</Button>
                </CardContent>
              </Card>
            </div>
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="text-center mb-4">
                    {/* Logo */}
                    <div className="flex items-left justify-left mb-2">
                      <Tent className="h-6 w-6 text-green-600" />
                      <span className="text-xl font-bold text-green-800">OG CAMPING BILL </span>
                    </div>
                    {/* Hóa đơn */}
                    <h2 className="text-2xl font-bold text-gray-800">🧾 Hóa đơn đặt tour</h2>
                    <p className="text-sm text-gray-500 mt-1">Mã đơn hàng: #{selectedOrder.id}</p>
                  </div>

                  {/* Body */}
                  <div className="divide-y divide-gray-200 border rounded-lg">
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Tên khách hàng</p>
                      <p className="text-gray-800">{selectedOrder.customerName}</p>
                    </div>
                    <div className="grid grid-cols-2 p-3 break-words">
                      <p className="font-semibold text-gray-600">Email</p>
                      <p className="text-gray-800">{selectedOrder.email}</p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Số điện thoại</p>
                      <p className="text-gray-800">{selectedOrder.phone}</p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">Ngày đặt</p>
                      <p className="text-gray-800">
                        {new Date(selectedOrder.bookingDate).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Giá tiền</p>
                      <p className="text-gray-800 font-medium">
                        {selectedOrder.totalPrice?.toLocaleString("vi-VN")} VND
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">Tour đặt</p>
                      <p className="text-gray-800">
                        {selectedOrder.service?.name || "Chưa có thông tin"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Dịch vụ đã chọn</p>
                      <p className="text-gray-800">
                        {selectedOrder.serviceName || "Chưa có thông tin"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">Thiết bị thuê</p>
                      <p className="text-gray-800">
                        {selectedOrder.equipment || "Không thuê"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Số người tham gia</p>
                      <p className="text-gray-800">{selectedOrder.people}</p>
                    </div>
                    <div className="grid grid-cols-2 p-3 break-words">
                      <p className="font-semibold text-gray-600">Yêu cầu đặc biệt</p>
                      <p className="text-gray-800">
                        {selectedOrder.specialRequests || "Không có"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-gray-50">
                      <p className="font-semibold text-gray-600">Người liên hệ khẩn cấp</p>
                      <p className="text-gray-800">
                        {selectedOrder.emergencyContact || "Không có"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <p className="font-semibold text-gray-600">SĐT khẩn cấp</p>
                      <p className="text-gray-800">
                        {selectedOrder.emergencyPhone || "Không có"}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <p className="text-center text-gray-500 text-sm mt-6">
                    🎉 Cảm ơn quý khách đã tin tưởng dịch vụ của chúng tôi!
                  </p>

                  <div className="flex justify-end mt-4">
                    <button
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      onClick={() => handlePrintInvoice(selectedOrder.id)}
                    >
                      In hóa đơn
                    </button>
                    <button
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}




          </TabsContent>

          <TabsContent value="dish">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý món ăn</CardTitle>
                <CardDescription>Danh sách và thao tác quản lý món ăn</CardDescription>
              </CardHeader>
              <div className="flex justify-start items-center px-8 py-4">
                <Button className="flex items-center" onClick={() => setShowAddCard(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Thêm món ăn
                </Button>
              </div>
              {/* Card thêm món ăn */}
              {showAddCard && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="flex items-left justify-left mb-2">
                        <Plus className="h-6 w-6 text-green-600" />
                        <span className="text-xl font-bold text-green-800">THÊM MÓN ĂN</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Điền thông tin món ăn mới</p>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-4">

                      <Input
                        placeholder="Tên món ăn"
                        value={newDish.name}
                        onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                      />
                      <Input
                        placeholder="Mô tả"
                        value={newDish.description}
                        onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                      />

                      <Input
                        type="text"
                        placeholder="Giá (VNĐ)"
                        value={newDish.price === 0 ? "" : newDish.price}
                        onChange={(e) =>
                          setNewDish({ ...newDish, price: Number(e.target.value) || 0 })
                        }
                      />

                      <Input
                        type="text"
                        placeholder="Số lượng"
                        value={newDish.quantity === 0 ? "" : newDish.quantity}
                        onChange={(e) =>
                          setNewDish({ ...newDish, quantity: Number(e.target.value) || 0 })
                        }
                      />

                      {/* Chọn phân loại */}
                      <Select
                        value={newDish.category}
                        onValueChange={(val) => setNewDish({ ...newDish, category: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phân loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPETIZER">APPETIZER</SelectItem>
                          <SelectItem value="BBQ">BBQ</SelectItem>
                          <SelectItem value="HOTPOT">HOTPOT</SelectItem>
                          <SelectItem value="SNACK">SNACK</SelectItem>
                          <SelectItem value="DRINK">DRINK</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Upload ảnh riêng */}
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Hình ảnh món ăn</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="w-32 h-32 object-cover rounded-md"
                          />
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddCard(false)}>Hủy</Button>
                      <Button onClick={handleAddDish}>Lưu</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ShowEdit card */}
              {showEditCard && editingDish && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="flex items-left justify-left mb-2">
                        <Edit className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold text-blue-800">CHỈNH SỬA MÓN ĂN</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin món ăn</p>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-4">
                      <Input
                        placeholder="Tên món ăn"
                        value={editingDish.name}
                        onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                      />
                      <Input
                        placeholder="Mô tả"
                        value={editingDish.description}
                        onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                      />
                      <Input
                        type="text"
                        placeholder="Giá (VNĐ)"
                        value={editingDish.price}
                        onChange={(e) =>
                          setEditingDish({ ...editingDish, price: Number(e.target.value) || 0 })
                        }
                      />
                      <Input
                        type="text"
                        placeholder="Số lượng"
                        value={editingDish.quantity}
                        onChange={(e) =>
                          setEditingDish({ ...editingDish, quantity: Number(e.target.value) || 0 })
                        }
                      />

                      {/* Chọn phân loại */}
                      <Select
                        value={editingDish.category}
                        onValueChange={(val) => setEditingDish({ ...editingDish, category: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phân loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPETIZER">APPETIZER</SelectItem>
                          <SelectItem value="BBQ">BBQ</SelectItem>
                          <SelectItem value="HOTPOT">HOTPOT</SelectItem>
                          <SelectItem value="SNACK">SNACK</SelectItem>
                          <SelectItem value="DESSERT">DESSERT</SelectItem>
                          <SelectItem value="DRINK">DRINK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowEditCard(false)}>Hủy</Button>
                      <Button onClick={handleUpdateDishText}>Lưu</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show edit Image */}
              {showUploadCard && uploadTargetDish && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-[460px] max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="flex items-left justify-left mb-2">
                        <Upload className="h-6 w-6 text-purple-600" />
                        <span className="text-xl font-bold text-purple-800">CẬP NHẬT ẢNH MÓN ĂN</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Chọn ảnh mới cho: <b>{uploadTargetDish.name}</b></p>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-3">
                      {/* Ảnh hiện tại */}
                      {uploadTargetDish.imageUrl && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ảnh hiện tại:</p>
                          <img
                            src={`http://localhost:8080${uploadTargetDish.imageUrl}`}
                            alt={uploadTargetDish.name}
                            className="w-28 h-28 object-cover rounded-md border"
                          />
                        </div>
                      )}

                      {/* Chọn ảnh mới */}
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Ảnh mới</label>
                        <input type="file" accept="image/*" onChange={handleUploadFileChange} />
                        {uploadImagePreview && (
                          <img
                            src={uploadImagePreview}
                            alt="preview"
                            className="w-28 h-28 object-cover rounded-md border"
                          />
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => { setShowUploadCard(false); setUploadTargetDish(null); setUploadImageFile(null); setUploadImagePreview(null); }}
                      >
                        Hủy
                      </Button>
                      <Button onClick={handleSubmitUploadImage} disabled={!uploadImageFile}>
                        Lưu ảnh
                      </Button>
                    </div>
                  </div>
                </div>
              )}


              {/* Card danh sách món ăn */}
              <CardContent>
                {/* Thanh tìm kiếm + lọc category */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2 relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Tìm kiếm theo tên..."
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select onValueChange={setCategoryFilter} defaultValue="ALL">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc theo loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả</SelectItem>
                      <SelectItem value="APPETIZER">APPETIZER</SelectItem>
                      <SelectItem value="BBQ">BBQ</SelectItem>
                      <SelectItem value="HOTPOT">HOTPOT</SelectItem>
                      <SelectItem value="SNACK">SNACK</SelectItem>
                      <SelectItem value="DESSERT">DESSERT</SelectItem>
                      <SelectItem value="DRINK">DRINK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bảng dữ liệu món ăn với scroll */}
                <div className="overflow-y-auto max-h-[500px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Hình ảnh</TableHead>
                        <TableHead>Tên món</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Giá (VNĐ)</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Phân loại</TableHead>
                        <TableHead>Trạng thái</TableHead>

                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDishes.map((dish: any) => (
                        <TableRow key={dish.id}>
                          <TableCell>{dish.tempId}</TableCell>
                          <TableCell>
                            {dish.imageUrl ? (
                              <img
                                src={`http://localhost:8080${dish.imageUrl}`}
                                alt={dish.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            ) : (
                              <span className="text-gray-400 italic">Chưa có ảnh</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{dish.name}</TableCell>
                          <TableCell>{dish.description}</TableCell>
                          <TableCell className="px-2 w-[105px]">
                            {dish.price.toLocaleString()} đ
                          </TableCell>
                          <TableCell className="w-[105px]  text-center align-middle">
                            {dish.quantity}
                          </TableCell>
                          <TableCell>{dish.category}</TableCell>
                          <TableCell>
                            {dish.quantity > 0 ? (
                              <span className="text-green-600 font-semibold">AVAILABLE</span>
                            ) : (
                              <span className="text-red-500 font-semibold">SOLD OUT</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditClick(dish)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenUpload(dish)}>
                                <Upload className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(dish.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="customers">
            <div className="min-h-screen bg-gray-50 p-6 w-full">
              <div className="flex gap-6">

                {/* Bên trái: danh sách khách hàng */}
                <div className="w-1/3 bg-white rounded-2xl shadow-lg p-4 overflow-y-auto max-h-[80vh]">
                  {searchedOrders.length === 0 ? (
                    <p className="text-gray-400 text-center py-6 text-base italic">
                      Không tìm thấy đơn hàng
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {searchedOrders.map((order) => (
                        <li
                          key={order.orderId}
                          onClick={() => setSelectedCustomerOrder(order)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 shadow-sm 
  hover:shadow-md hover:border-blue-400 
  ${selectedCustomerOrder?.orderId === order.orderId
                              ? "bg-blue-50 border-blue-400"
                              : "bg-white border-gray-200"
                            }`}
                        >
                          {/* Header: Tên + Mã đơn */}
                          <div className="flex justify-between items-center mb-2">

                            <p className="font-semibold text-gray-800 text-base">
                              👤 {order.customerName}
                            </p>
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              {order.orderCode}
                            </span>
                          </div>

                          {/* Body: Email + Phone */}
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-2">
                              <span className="text-gray-400">📧</span>
                              <span className="truncate">{order.email}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="text-gray-400">📞</span>
                              <span>{order.phone}</span>
                            </p>
                          </div>
                        </li>

                      ))}
                    </ul>
                  )}
                </div>


                {/* Bên phải: chi tiết đơn hàng */}
                <div className="w-2/3">
                  {selectedCustomerOrder ? (
                    <Card className="shadow rounded-lg overflow-hidden">
                      <CardHeader className="bg-blue-600 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <CardTitle className="text-xl font-bold">
                            Đơn hàng: {selectedCustomerOrder.orderCode}
                          </CardTitle>
                          <CardDescription className="text-sm text-blue-100">
                            Khách hàng: {selectedCustomerOrder.customerName} | 📧 {selectedCustomerOrder.email} | 📞 {selectedCustomerOrder.phone}
                          </CardDescription>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-xs">Tổng giá</p>
                            <p className="text-lg font-extrabold text-yellow-300">
                              {selectedCustomerOrder.totalOrderPrice.toLocaleString()} đ
                            </p>
                          </div>

                        </div>

                      </CardHeader>

                      <CardContent className="p-6 bg-white">
                        <h3 className="text-lg font-semibold mb-2">Danh sách món ăn</h3>
                        <div className="overflow-x-auto border rounded-md max-w-full">
                          <table className="w-full table-auto text-sm min-w-[500px]">
                            <thead className="bg-gray-100 text-gray-700 sticky top-0">
                              <tr>
                                <th className="px-4 py-2 text-left">Tên món</th>
                                <th className="px-4 py-2 text-left">Loại</th>
                                <th className="px-4 py-2 text-center w-[90px]">Số lượng</th>
                                <th className="px-4 py-2 text-right w-[120px]">Giá (VNĐ)</th>
                                <th className="px-4 py-2 text-right w-[120px]">Tổng (VNĐ)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCustomerOrder.items.map((item: OrderItem, index: number) => (
                                <tr key={`${item.dishId}-${index}`} className="border-b hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-2 font-medium">{item.dishName}</td>
                                  <td className="px-4 py-2">{item.category}</td>
                                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                                  <td className="px-4 py-2 text-right">{item.price.toLocaleString()} đ</td>
                                  <td className="px-4 py-2 text-right font-semibold text-green-600">{item.totalPrice.toLocaleString()} đ</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => handlePrintDishesInvoice(selectedCustomerOrder.orderId)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                          >
                            In hóa đơn
                          </button>
                        </div>

                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-gray-400 text-center mt-10">Chọn khách hàng để xem chi tiết món ăn</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="reports">
            <div className="min-h-screen bg-gray-50 p-6 w-full">
              {/* Tiêu đề */}
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                📊 Báo cáo doanh thu
              </h2>

              {/* Cards tổng quan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-2xl shadow-lg text-white">
                  <p className="text-sm opacity-80">Tổng doanh thu</p>
                  <p className="text-2xl font-extrabold">
                    {total.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-2xl shadow-lg text-white">
                  <p className="text-sm opacity-80">Tháng cao nhất</p>
                  <p className="text-2xl font-extrabold">Tháng {maxMonth.month}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-5 rounded-2xl shadow-lg text-white">
                  <p className="text-sm opacity-80">Trung bình / tháng</p>
                  <p className="text-2xl font-extrabold">
                    {average.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>

              {/* Biểu đồ */}
              <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
                <p className="text-lg font-semibold mb-4 text-gray-700">
                  Biểu đồ doanh thu
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenues}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tickFormatter={(m) => `Th${m}`} />
                      <YAxis
                        tickFormatter={(v) =>
                          v.toLocaleString("vi-VN", { maximumFractionDigits: 0 })
                        }
                      />
                      <Tooltip
                        formatter={(value: number) =>
                          `${value.toLocaleString("vi-VN")} đ`
                        }
                        labelFormatter={(label) => `Tháng ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bảng chi tiết */}
              <div className="overflow-x-auto bg-white border rounded-xl shadow-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Tháng</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Doanh thu (VNĐ)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {revenues.map((r) => (
                      <tr key={r.month} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2">Tháng {r.month}</td>
                        <td className="px-4 py-2 text-right">
                          {r.value.toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đánh giá</CardTitle>
                    <CardDescription>Kiểm duyệt review: chờ duyệt, đã duyệt, từ chối</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fetchReviews()}>
                      <Filter className="w-4 h-4 mr-2" /> Làm mới
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm theo tên khách / nội dung..."
                      className="pl-10"
                      value={searchReviews}
                      onChange={(e) => setSearchReviews(e.target.value)}
                    />
                  </div>

                  <Select value={reviewsFilterStatus} onValueChange={(v) => setReviewsFilterStatus(v as any)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả</SelectItem>
                      <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                      <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                      <SelectItem value="REJECTED">Từ chối</SelectItem>
                      <SelectItem value="HIDDEN">Ẩn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-y-auto max-h-[560px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Khách</TableHead>
                        <TableHead>Dịch vụ</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead className="text-center">Ảnh/Video</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingReviews ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">Đang tải...</TableCell>
                        </TableRow>
                      ) : (
                        reviews
                          .filter(r => {
                            const q = searchReviews.trim().toLowerCase();

                            if (!q) return true;
                            return (
                              (r.customerName || '').toLowerCase().includes(q) ||
                              (r.content || '').toLowerCase().includes(q) ||
                              (r.serviceName || '').toLowerCase().includes(q)
                            );
                          })
                          .map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">{r.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    {r.customerAvatar ? (
                                      <AvatarImage src={`http://localhost:8080${r.customerAvatar}`} />
                                    ) : (
                                      <AvatarFallback>{(r.customerName || '?').slice(0, 2)}</AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{r.customerName}</p>
                                    <p className="text-sm text-gray-500">{r.customerEmail || ''}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{r.serviceName}</TableCell>
                              <TableCell>{'⭐'.repeat(r.rating || 0)}</TableCell>
                              <TableCell className="max-w-[300px] truncate">{r.content || '-'}</TableCell>
                              <TableCell className="text-center">
                                {((r.images || []).length + (r.videos || []).length) > 0 ? (
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedReview(r)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {r.status === 'PENDING' && <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>}
                                {r.status === 'APPROVED' && <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>}
                                {r.status === 'REJECTED' && <Badge className="bg-red-100 text-red-800">Từ chối</Badge>}
                                {r.status === 'HIDDEN' && <Badge variant="secondary">Ẩn</Badge>}
                              </TableCell>
                              <TableCell>{new Date(r.createdAt).toLocaleString("vi-VN")}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={processingIds.includes(r.id) || r.status === 'APPROVED'}
                                    onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                                  >
                                    ✅
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={processingIds.includes(r.id) || r.status === 'REJECTED'}
                                    onClick={() => {
                                      const reason = prompt("Lý do từ chối review (tùy chọn):", "") || "";
                                      if (confirm("Xác nhận từ chối review này?")) {
                                        handleUpdateStatus(r.id, 'REJECTED', reason);
                                      }
                                    }}
                                  >
                                    ❌
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedReview(r);
                                      setReplyText(r.reply || '');
                                    }}
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Modal xem chi tiết review + reply */}
            {selectedReview && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20 px-4">
                <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">Review #{selectedReview.id}</h3>
                      <p className="text-sm text-gray-500">Người review: {selectedReview.customerName}</p>
                      <p className="text-sm text-gray-500">Dịch vụ: {selectedReview.serviceName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setSelectedReview(null)}>Đóng</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">Nội dung</p>
                      <div className="p-3 bg-gray-50 rounded">{selectedReview.content || '-'}</div>
                    </div>

                    {selectedReview.images && selectedReview.images.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Ảnh</p>
                        <div className="flex gap-2 overflow-x-auto">
                          {selectedReview.images.map((img: string, idx: number) => (
                            <img key={idx} src={`http://localhost:8080${img}`} alt={`img-${idx}`} className="w-32 h-24 object-cover rounded-md border" />
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReview.videos && selectedReview.videos.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Video</p>
                        <div className="flex gap-2 overflow-x-auto">
                          {selectedReview.videos.map((v: string, idx: number) => (
                            <video key={idx} src={`http://localhost:8080${v}`} controls className="w-48 h-32 rounded-md border" />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">Phản hồi hiện tại</p>
                      <div className="p-3 bg-gray-50 rounded">{selectedReview.reply || <span className="text-gray-400">Chưa có phản hồi</span>}</div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Viết phản hồi</p>
                      <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" onClick={() => { setReplyText(''); setSelectedReview(null); }}>Hủy</Button>
                        <Button onClick={() => handleReply(selectedReview.id)} disabled={processingIds.includes(selectedReview.id)}>Gửi phản hồi</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}