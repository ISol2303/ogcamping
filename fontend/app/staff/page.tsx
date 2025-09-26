'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
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

// Helper function to get booking dates with priority logic
const getBookingDates = (booking: any) => {
  // Priority 1: Use booking-level dates if available
  if (booking.checkInDate && booking.checkOutDate) {
    return {
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate
    };
  }

  // Priority 2: Find first service with dates
  const serviceWithDates = booking.services?.find((service: any) =>
    service.checkInDate && service.checkOutDate
  );

  if (serviceWithDates) {
    return {
      checkInDate: serviceWithDates.checkInDate,
      checkOutDate: serviceWithDates.checkOutDate
    };
  }

  // Priority 3: Find first combo with dates
  const comboWithDates = booking.combos?.find((combo: any) =>
    combo.checkInDate && combo.checkOutDate
  );

  if (comboWithDates) {
    return {
      checkInDate: comboWithDates.checkInDate,
      checkOutDate: comboWithDates.checkOutDate
    };
  }

  // Fallback: Return null if no dates found
  return {
    checkInDate: null,
    checkOutDate: null
  };
};

// Helper function to format date safely
const formatBookingDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '-';
  }
};

// Helper function to get number of people with priority logic
const getNumberOfPeople = (booking: any) => {
  // Priority 1: Use booking-level numberOfPeople if available
  if (booking.numberOfPeople) {
    return booking.numberOfPeople;
  }

  // Priority 2: Find first service with numberOfPeople
  const serviceWithPeople = booking.services?.find((service: any) =>
    service.numberOfPeople
  );

  if (serviceWithPeople) {
    return serviceWithPeople.numberOfPeople;
  }

  // Priority 3: Find first combo with numberOfPeople
  const comboWithPeople = booking.combos?.find((combo: any) =>
    combo.numberOfPeople
  );

  if (comboWithPeople) {
    return comboWithPeople.numberOfPeople;
  }

  // Fallback: Return null if no numberOfPeople found
  return null;
};

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

interface OrderItem {
  orderId: number;
  dishId: number;
  dishName: string;
  category: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

// BookingItem chung cho service, combo, equipment
interface BookingItem {
  id: number;
  type: "SERVICE" | "COMBO" | "EQUIPMENT";
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  numberOfPeople?: number | null;
}

interface Booking {
  id: number;
  bookingCode?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalPrice: number;
  status: string;
  note?: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  bookingDate: string | null;
  numberOfPeople: number | null;
  services: BookingItem[];
  combos: BookingItem[];
  equipments: BookingItem[];
}

interface PaymentDTO {
  id?: number;
  method?: string;
  status?: string;
  amount?: number;
  providerTransactionId?: string;
  createdAt?: string | null;
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
  const [reason, setReason] = useState("");
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);








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

        // // 2️⃣ Lấy thống kê
        // const statsResponse = await axios.get('http://localhost:8080/stats/staff');
        // setStats(statsResponse.data.stats);

        // // 3️⃣ Lấy tất cả orders
        // const ordersResponse = await axios.get('http://localhost:8080/apis/orders');
        // console.log('Orders Response:', ordersResponse.data);

        // // Convert bookingDate về string để frontend hiển thị
        // const orders: Order[] = ordersResponse.data.map((order: any) => ({
        //   ...order,
        //   bookingDate: order.bookingDate || order.date || '', // fallback nếu khác tên field
        // }));
        // setPendingOrders(orders);

        // // 4️⃣ Lấy equipment checks
        // const equipmentResponse = await axios.get('http://localhost:8080/equipment/checks');
        // setEquipmentChecks(equipmentResponse.data);


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
  //dữ liệu Booking
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token =
          localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!token) {
          console.log("Token không tồn tại, redirect login");
          router.push("/login");
          return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // ✅ gọi API booking mới
        const response = await axios.get(
          "http://localhost:8080/apis/v1/bookings"
        );

        console.log("Bookings response:", response.data);

        // Map về đúng format frontend đang dùng
        const mapped: Booking[] = response.data.map((b: any) => ({
          id: b.id,
          bookingCode: b.bookingCode,
          customerName: b.customerName || "-",
          email: b.email || "-",
          phone: b.phone || "-",
          address: b.address || "-",
          totalPrice: b.totalPrice || 0,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          bookingDate: b.bookingDate,          // ✅ booking date
          numberOfPeople: b.numberOfPeople,    // ✅ number of people
          status: b.status,
          note: b.note || "",
          services: b.services || [],
          combos: b.combos || [],
          equipments: b.equipments || [],
        }));


        setBookings(mapped);
        setFilteredBookings(mapped); // nếu bạn có filter
      } catch (error) {
        console.error("Lỗi khi lấy danh sách booking:", error);
      }
    };

    fetchBookings();
  }, [router]);

  //list order
  const handleViewBooking = (booking: Booking) => {
    if (!booking) {
      setError("Không tìm thấy dữ liệu booking");
      setSelectedBooking(null);
      return;
    }
    // Map dữ liệu trực tiếp từ backend, không gán mặc định
    // Log toàn bộ booking object để kiểm tra dữ liệu
    console.log("👉 handleViewBooking called with booking:", booking);
    console.log("Number of people:", booking.numberOfPeople);
    console.log("Booking date:", booking.bookingDate);

    setSelectedBooking(booking);
    console.log("Selected booking:", selectedBooking);

    console.log("Received booking:", booking);
    setError(null);
  };




  const handleConfirmBooking = async (booking: Booking) => {
    if (!booking?.id) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.put(
        `http://localhost:8080/apis/v1/bookings/${booking.id}/confirm`,
        {},
        config
      );

      console.log('Backend response after confirm:', res.data);

      toast({ title: `Đã xác nhận booking #${booking.id}`, variant: 'success' });

      // Update state
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, ...res.data } : b))
      );
      setSelectedBooking((prev) => (prev?.id === booking.id ? { ...prev, ...res.data } : prev));
    } catch (err: any) {
      console.error('Lỗi xác nhận booking:', err?.response?.data ?? err.message);
      toast({
        title: err?.response?.data?.error ?? 'Lỗi xác nhận booking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

      toast({
        title: "Đã xác nhận tất cả đơn hàng PENDING!",
        variant: "success",
      });
    } catch (error: any) {
      console.error("❌ Lỗi xác nhận tất cả đơn:", error.response?.data || error.message);
      toast({
        title: "Không thể xác nhận tất cả đơn. Vui lòng thử lại!",
        variant: "destructive",
      });
    }
  };





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
        toast({
          title: "❌ Gửi email thất bại",
          description: `Một số đơn không gửi được: ${failedIds.join(", ")}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "✅ Thành công",
          description: "Tất cả email đã được gửi đi thành công!",
          variant: "default",
        })
      }

    } catch (err: any) {
      console.error("❌ Lỗi gửi email tất cả:", err.response?.data || err.message);
      toast({
        title: "❌ Gửi email thất bại",
        description: "Không thể gửi tất cả email. Vui lòng thử lại!",
        variant: "destructive",
      })
      setSendingEmailIds([]);
    }
  };


  //in hóa đơn 
  const handlePrintInvoice = async (booking: Booking) => {
    try {
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token không tồn tại");

      const response = await axios.get(
        `http://localhost:8080/pdf/bill/${booking.id}/invoice`,
        {
          responseType: "blob", // quan trọng để nhận PDF
          headers: {
            Authorization: `Bearer ${token}`, // nếu backend bảo vệ bằng JWT
          },
          validateStatus: (status) => status < 500, // tránh throw khi server lỗi 500
        }
      );

      // Kiểm tra nếu server trả về lỗi
      if (!response.data || response.data.size === 0) {
        throw new Error(
          `Không có dữ liệu PDF từ server. Status: ${response.status}`
        );
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = window.URL.createObjectURL(blob);

      // Tải file PDF
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute(
        "download",
        `invoice_${booking.bookingCode || booking.id}.pdf`
      );
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (error: any) {
      console.error("Lỗi khi tải hóa đơn:", error);
      toast({
        title: "❌ Lỗi khi tải hóa đơn",
        description:
          error.response?.status === 404
            ? "Không tìm thấy hóa đơn. Vui lòng kiểm tra ID đơn hàng!"
            : error.message || "Không thể tải hóa đơn. Vui lòng thử lại!",
      });
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
        toast({
          title: "⚠️ Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin món ăn!",
          variant: "destructive",
        })
        return;
      }

      const validCategories = ["APPETIZER", "BBQ", "HOTPOT", "SNACK", "DESSERT", "DRINK"];
      if (!validCategories.includes(newDish.category.toUpperCase())) {
        toast({
          title: "⚠️ Danh mục không hợp lệ",
          description: "Chọn một trong: APPETIZER, HOTPOT, BBQ, SNACK, DESSERT, DRINK",
          variant: "destructive",
        });
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

      toast({
        title: "Thêm món ăn thành công!",
        variant: "default",
      });
      fetchDishes();
      setShowAddCard(false);
      setNewDish({ name: "", description: "", price: 0, quantity: 0, category: "", imageUrl: "" });
      setImageFile(null);
      setImagePreview(null);

    } catch (err: any) {
      console.error("Add dish error:", err.response?.data || err.message);
      toast({
        title: "Không thể thêm món ăn.",
        description: "Vui lòng thử lại!",
        variant: "destructive",
      });
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

      toast({
        title: "Thành công",
        description: "Cập nhật món ăn thành công!",
      })
      fetchDishes();
      setShowEditCard(false);
      setEditingDish(null);
    } catch (error) {
      console.error("Update dish error:", error);
      toast({
        title: "Không thể cập nhật món ăn.",
        description: "Vui lòng thử lại!",
        variant: "destructive",
      });
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
        toast({
          title: "⚠️ Thiếu ảnh",
          description: "Vui lòng chọn ảnh!",
          variant: "destructive",
        });
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

      toast({
        title: "✅ Cập nhật hình ảnh thành công!",
        variant: "default",
      });
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

      toast({
        title: "Không thể cập nhật hình ảnh.",
        description: "Vui lòng thử lại!",
        variant: "destructive",
      });
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
      case 'COMPLETED':
        return <Badge className="bg-purple-100 text-purple-800">Hoàn Thành</Badge>;
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
      toast({
        title: "❌ Lỗi cập nhật trạng thái",
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setProcessing(reviewId, false);
    }
  };

  const handleReply = async (reviewId: number) => {
    if (!replyText.trim()) {
      toast({
        title: "⚠️ Thiếu nội dung",
        description: "Vui lòng nhập nội dung phản hồi trước khi gửi.",
        variant: "destructive",
      });
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
      toast({
        title: "✅ Phản hồi thành công",
        description: "Đã phản hồi review.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "❌ Lỗi khi phản hồi",
        description: "Không thể phản hồi. Vui lòng thử lại.",
        variant: "destructive",
      });
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
                        {/* <TableHead>Mã booking</TableHead> */}
                        <TableHead>Email khách hàng</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Giá đơn</TableHead>
                        <TableHead>Ngày Check in</TableHead>
                        <TableHead>Ngày Check out</TableHead>
                        <TableHead className="w-[110px] text-center align-middle">Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking: Booking) => (
                        <TableRow key={booking.id}>
                          {/* ID */}
                          <TableCell className="font-medium">{booking.id}</TableCell>

                          {/* Mã booking
                          <TableCell className="font-medium">{booking.bookingCode || "-"}</TableCell> */}

                          {/* Email */}
                          <TableCell className="font-medium">{booking.email || "-"}</TableCell>

                          {/* Tên KH */}
                          <TableCell className="font-medium">{booking.customerName || "-"}</TableCell>

                          {/* Phone */}
                          <TableCell className="font-medium">{booking.phone || "-"}</TableCell>

                          {/* Address */}
                          <TableCell className="font-medium">{booking.address || "-"}</TableCell>

                          {/* Giá đơn */}
                          <TableCell className="font-medium text-green-600">
                            {booking.totalPrice
                              ? booking.totalPrice.toLocaleString() + " đ"
                              : "-"}
                          </TableCell>

                          {/* Ngày Check in */}
                          <TableCell>
                            {formatBookingDate(getBookingDates(booking).checkInDate)}
                          </TableCell>

                          {/* Ngày Check out */}
                          <TableCell>
                            {formatBookingDate(getBookingDates(booking).checkOutDate)}
                          </TableCell>

                          {/* Trạng thái */}
                          <TableCell className="min-w-[180px] text-center align-middle">
                            {getStatusBadge(booking.status)}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewBooking(booking)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                className="min-w-[110px] text-center align-middle"
                                size="sm"
                                disabled={booking.status === "CONFIRMED"}
                                onClick={() => handleConfirmBooking(booking)}
                              >
                                ✅ Xác nhận
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
            {selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-2xl shadow-xl w-[750px] max-h-[90vh] overflow-y-auto">

                  {/* Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">🧾 Hóa đơn đặt tour</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Mã đơn hàng: <span className="font-semibold">#{selectedBooking.bookingCode}</span>
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="border rounded-lg divide-y divide-gray-200 mb-6">
                    {[
                      ["Tên khách hàng", selectedBooking.customerName],
                      ["Email", selectedBooking.email],
                      ["Số điện thoại", selectedBooking.phone],
                      ["Địa chỉ", selectedBooking.address || "-"],
                      ["Ngày đặt", selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleString("vi-VN") : "-"],
                      ["Check-in", formatBookingDate(getBookingDates(selectedBooking).checkInDate)],
                      ["Check-out", formatBookingDate(getBookingDates(selectedBooking).checkOutDate)],
                      ["Số người tham gia", getNumberOfPeople(selectedBooking) ?? "-"],
                    ].map(([label, value], idx) => (
                      <div key={idx} className={`grid grid-cols-2 p-3 ${idx % 2 === 0 ? "bg-gray-50" : ""}`}>
                        <p className="font-semibold text-gray-600">{label}</p>
                        <p className="text-gray-800">{value}</p>
                      </div>
                    ))}
                    {selectedBooking.note && (
                      <div className="grid grid-cols-2 p-3">
                        <p className="font-semibold text-gray-600">Ghi chú</p>
                        <p className="text-gray-800">{selectedBooking.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  {["services", "combos", "equipments"].map((key) => {
                    const items = (selectedBooking as any)[key] || [];
                    if (items.length === 0) return null;

                    return (
                      <div key={key} className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 capitalize">
                          {key === "services" ? "Dịch vụ" : key === "combos" ? "Combo" : "Thiết bị"} đã chọn
                        </h3>
                        <table className="w-full text-sm border border-gray-200 rounded-lg">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left">Tên</th>
                              <th className="px-3 py-2 text-center">Số lượng</th>
                              <th className="px-3 py-2 text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item: any, idx: number) => (
                              <tr key={idx} className="border-t">
                                <td className="px-3 py-2">{item.name}</td>
                                <td className="px-3 py-2 text-center">{item.quantity}</td>
                                <td className="px-3 py-2 text-right">
                                  {item.price.toLocaleString("vi-VN")} ₫
                                </td>
                                {/* <td className="px-3 py-2 text-right">
                                  {item.subtotal.toLocaleString("vi-VN")} ₫
                                </td> */}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className="flex justify-end text-lg font-bold text-gray-800 mt-4">
                    Tổng cộng:{" "}
                    <span className="ml-2 text-green-600">
                      {selectedBooking.totalPrice.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end mt-4 space-x-3">
                    <button
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      onClick={() => handlePrintInvoice(selectedBooking)}
                    >
                      In hóa đơn
                    </button>
                    <button
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      onClick={() => setSelectedBooking(null)}
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
                                {r.status !== 'PENDING' ? (
                                  // Nếu không phải PENDING -> chỉ hiện nút xem chi tiết
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedReview(r);
                                      setReplyText(r.reply || '');
                                    }}
                                    disabled={processingIds.includes(r.id)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Chi tiết
                                  </Button>
                                ) : (
                                  // Nếu PENDING -> giữ các nút approve / reject / reply như trước
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={processingIds.includes(r.id) || r.status === 'APPROVED'}
                                      onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                                    >
                                      ✅
                                    </Button>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          disabled={processingIds.includes(r.id) || r.status === "REJECTED"}
                                        >
                                          ❌
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Xác nhận từ chối review?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Bạn có chắc chắn muốn từ chối review này?  
                                            <Input
                                              className="mt-3"
                                              placeholder="Lý do từ chối (tùy chọn)"
                                              value={reason}
                                              onChange={(e) => setReason(e.target.value)}
                                            />
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleUpdateStatus(r.id, "REJECTED", reason)}
                                          >
                                            Xác nhận
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

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
                                )}
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
                <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto relative">
                  {/* Close X góc phải */}
                  <button
                    aria-label="Close"
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded-full p-1"
                    onClick={() => setSelectedReview(null)}
                  >
                    ✖
                  </button>

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
                            <img
                              key={idx}
                              src={`http://localhost:8080${img}`}
                              alt={`img-${idx}`}
                              className="w-32 h-24 object-cover rounded-md border"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReview.videos && selectedReview.videos.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Video</p>
                        <div className="flex gap-2 overflow-x-auto">
                          {selectedReview.videos.map((v: string, idx: number) => (
                            <video
                              key={idx}
                              src={`http://localhost:8080${v}`}
                              controls
                              className="w-48 h-32 rounded-md border"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">Phản hồi hiện tại</p>
                      <div className="p-3 bg-gray-50 rounded">
                        {selectedReview.reply || <span className="text-gray-400">Chưa có phản hồi</span>}
                      </div>
                    </div>

                    {/* Nếu từng bị từ chối: show moderationReason */}
                    {selectedReview.status === 'REJECTED' && (
                      <div>
                        <p className="font-semibold">Lý do từ chối</p>
                        <div className="p-3 bg-red-50 text-red-700 rounded">
                          {selectedReview.moderationReason || <span className="text-gray-400">Không có lý do</span>}
                        </div>
                      </div>
                    )}

                    {/* Chỉ cho edit/ gửi phản hồi khi đang PENDING */}
                    {selectedReview.status === 'PENDING' ? (
                      <div>
                        <p className="font-semibold mb-2">Viết phản hồi</p>
                        <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button variant="outline" onClick={() => { setReplyText(''); setSelectedReview(null); }}>Hủy</Button>
                          <Button onClick={() => handleReply(selectedReview.id)} disabled={processingIds.includes(selectedReview.id)}>Gửi phản hồi</Button>
                        </div>
                      </div>
                    ) : (
                      // Nếu không phải PENDING thì hiển thị 1 note nhỏ (read-only)
                      <div className="text-sm text-gray-500">
                        <p>Trạng thái: <span className="font-medium">
                          {selectedReview.status === 'PENDING' && 'Chờ duyệt'}
                          {selectedReview.status === 'APPROVED' && 'Đã duyệt'}
                          {selectedReview.status === 'REJECTED' && 'Từ chối'}
                          {selectedReview.status === 'HIDDEN' && 'Ẩn'}
                        </span></p>     
                      </div>
                    )}
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