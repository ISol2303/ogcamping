"use client";

import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Package, Eye, Star as StarIcon, Upload, X } from 'lucide-react';
import Link from 'next/link';

interface ServiceItem {
  id: number;
  serviceId?: number | null;
  comboId?: number | null;
  euipmentId?: number | null;
  bookingId?: number | null;
  type: string;
  name?: string;
  quantity: number;
  price: number;
  total: number;
  hasReview?: boolean;
}

interface Booking {
  id: number;
  customerId?: number;
  services: ServiceItem[];
  combos?: any[];
  equipments?: any[];
  checkInDate?: string | null;
  checkOutDate?: string | null;
  bookingDate?: string | null;
  bookingCreatedAt?: string | null;
  numberOfPeople?: number;
  status: string;
  payment?: any;
  note?: string;
  staff?: any;
  internalNotes?: any;
  totalPrice: number;
  hasReview?: boolean;
}

export default function ServiceBookingHistory() {
  // existing hooks/logic left untouched (fetchBookings, filters, review modal, etc.)
  const { user, isLoggedIn, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewServiceId, setReviewServiceId] = useState<number | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user, token]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/apis/v1/bookings/customer/${user?.id}`, {
        headers,
      });

      if (!res.ok) {
        console.error('Failed to fetch bookings:', res.status, await res.text());
        setBookings([]);
        return;
      }

      const data: Booking[] = await res.json();

      const sorted = data.sort((a, b) => {
        const aDate = new Date(a.bookingDate || a.bookingCreatedAt || a.checkInDate || 0).getTime();
        const bDate = new Date(b.bookingDate || b.bookingCreatedAt || b.checkInDate || 0).getTime();
        return bDate - aDate;
      });

      setBookings(sorted);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- helper/logic functions (unchanged) ----------
  function isServiceReviewEligible(booking: Booking, item: ServiceItem) {
    if (!booking || !item) return false;
    if (booking.status !== "COMPLETED") return false;
    if (booking.hasReview) return false;
    if (!booking.checkOutDate) return false;
    const checkout = new Date(booking.checkOutDate);
    const now = new Date();
    const diffDays = (now.getTime() - checkout.getTime()) / (1000 * 60 * 60 * 24);
    return checkout < now && diffDays <= 7;
  }

  const getFirstEligibleServiceId = (booking: Booking): number | null => {
    if (!booking || !booking.services) return null;
    for (const it of booking.services) {
      if (isServiceReviewEligible(booking, it) && !it.hasReview) {
        return it.serviceId ?? it.id ?? null;
      }
    }
    return null;
  };

  const openReviewModal = (serviceId: number, bookingId: number) => {
    setReviewServiceId(serviceId);
    setReviewBookingId(bookingId);
    setReviewContent("");
    setReviewRating(5);
    setReviewFiles([]);
    setReviewModalOpen(true);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setReviewFiles(Array.from(files));
  };

  const clearSelectedFiles = () => {
    setReviewFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitReviewForService = async () => {
    if (!user || !token) {
      toast({ title: "Lỗi", description: "Bạn cần đăng nhập để viết đánh giá", variant: "error" });
      return;
    }
    if (!reviewServiceId || !reviewBookingId) {
      toast({ title: "Lỗi", description: "Dữ liệu không hợp lệ", variant: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("rating", reviewRating.toString());
      formData.append("content", reviewContent || "");
      formData.append("bookingId", reviewBookingId.toString());

      reviewFiles.forEach((f) => {
        if (f.type.startsWith("image/")) formData.append("images", f);
        else if (f.type.startsWith("video/")) formData.append("videos", f);
      });

      await axios.post(
        `http://localhost:8080/apis/v1/reviews/service/${reviewServiceId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === reviewBookingId) {
            const updatedServices = (b.services || []).map((it: any) =>
              (it.serviceId === reviewServiceId || it.id === reviewServiceId) ? { ...it, hasReview: true } : it
            );
            return { ...b, hasReview: true, services: updatedServices };
          }
          return b;
        })
      );

      setReviewModalOpen(false);
      setReviewServiceId(null);
      setReviewBookingId(null);
      setReviewContent("");
      setReviewRating(5);
      setReviewFiles([]);

      toast({ title: "Cảm ơn!", description: "Cảm ơn bạn đã chia sẻ trải nghiệm ❤️", variant: "success" });
    } catch (err: any) {
      console.error("Error submitting review:", err);
      if (err?.response?.status === 409) {
        toast({ title: "Bạn đã đánh giá rồi", description: "Mỗi booking chỉ được đánh giá 1 lần.", variant: "warning" });
        setBookings((prev) => prev.map((b) => b.id === reviewBookingId ? { ...b, hasReview: true } : b));
        setReviewModalOpen(false);
      } else {
        toast({ title: "Có lỗi xảy ra", description: "Vui lòng thử lại sau.", variant: "error" });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; classes: string }> = {
      PENDING: { text: 'Chờ xử lý', classes: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { text: 'Đã xác nhận', classes: 'bg-green-100 text-green-800' },
      CANCELLED: { text: 'Đã hủy', classes: 'bg-red-100 text-red-800' },
      COMPLETED: { text: 'Hoàn thành', classes: 'bg-emerald-100 text-emerald-800' },
    };
    const info = map[status] || { text: status, classes: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${info.classes} border border-transparent`}>
        {info.text}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statuses = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xử lý' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' },
  ];

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter && statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (dateFrom) {
      const start = new Date(dateFrom + 'T00:00:00');
      const bookingDate = new Date(b.bookingDate || b.bookingCreatedAt || b.checkInDate || 0);
      if (bookingDate < start) return false;
    }
    if (dateTo) {
      const end = new Date(dateTo + 'T23:59:59');
      const bookingDate = new Date(b.bookingDate || b.bookingCreatedAt || b.checkInDate || 0);
      if (bookingDate > end) return false;
    }
    return true;
  });

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập để xem lịch sử đặt dịch vụ</h1>
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Đang tải lịch sử đặt dịch vụ...</p>
        </div>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header row: title on left, device-history button on right */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold mb-1">Lịch sử đặt dịch vụ</h1>
          <p className="text-gray-600">Xem tất cả booking dịch vụ của bạn</p>
        </div>

        {/* Device history button aligned to the right of header */}
        <div className="flex-shrink-0">
          <Link href="./gear">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Lịch sử đơn hàng thiết bị</Button>
          </Link>
        </div>
      </div>

      {/* Filters row: put below title and inside a card-like container so it spans the same width as cards */}
      <div className="mb-6 bg-white border border-gray-100 rounded-md p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* left: status chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map(s => (
              <button
                key={s.key}
                aria-pressed={statusFilter === s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`text-sm px-3 py-1 rounded-full border transition ${
                  statusFilter === s.key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* right: date pickers + reset + result count */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <CalendarDays className="w-4 h-4" />
              </span>
              <input
                aria-label="Từ ngày"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-md border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              {dateFrom && (
                <button
                  onClick={() => setDateFrom('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 mr-1 p-1 rounded text-gray-500 hover:bg-gray-100"
                  aria-label="Xóa từ ngày"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <CalendarDays className="w-4 h-4" />
              </span>
              <input
                aria-label="Đến ngày"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-md border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              {dateTo && (
                <button
                  onClick={() => setDateTo('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 mr-1 p-1 rounded text-gray-500 hover:bg-gray-100"
                  aria-label="Xóa đến ngày"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo(''); }}>
              Reset
            </Button>

            <div className="text-sm text-gray-600 ml-2">{filteredBookings.length} kết quả</div>
          </div>
        </div>
      </div>

      {/* bookings list (unchanged visuals) */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có booking nào</h3>
            <p className="text-gray-600 mb-4">Bạn chưa đặt dịch vụ nào</p>
            <Link href="/services">
              <Button>Đặt dịch vụ ngay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((b) => {
            const eligibleServiceId = getFirstEligibleServiceId(b);
            return (
              <Card key={b.id} className="hover:shadow-lg transition-shadow border border-gray-200 bg-white">
                <CardHeader className="bg-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-800">Booking #{b.id}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        <CalendarDays className="inline h-4 w-4 mr-1 text-gray-500" />
                        {formatDate(b.bookingDate || b.bookingCreatedAt || b.checkInDate)}
                      </p>
                      {b.note && <p className="text-sm text-gray-600 mt-1">Ghi chú: {b.note}</p>}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(b.status)}
                      <p className="text-lg font-semibold mt-2 text-gray-800">
                        Tổng tiền: {formatPrice(b.totalPrice || b.services?.reduce((s, it) => s + (it.total || 0), 0))}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-700">Số khách</p>
                      <p className="text-sm">{b.numberOfPeople ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Check-in / Check-out</p>
                      <p className="text-sm">{formatDate(b.checkInDate)} — {formatDate(b.checkOutDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Số dịch vụ</p>
                      <p className="text-sm">{b.services?.length ?? 0}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-700">{b.services?.length || 0} dịch vụ</p>

                    <div className="flex items-center gap-2">
                      {b.hasReview ? (
                        <Button size="sm" variant="outline" disabled className="opacity-80 cursor-not-allowed border-gray-200 text-gray-500">
                          Bạn đã đánh giá
                        </Button>
                      ) : eligibleServiceId ? (
                        <Button size="sm" onClick={() => openReviewModal(eligibleServiceId, b.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                          Viết đánh giá
                        </Button>
                      ) : null}

                      <Button variant="outline" size="sm" onClick={() => setSelectedBooking(b)} className="border-gray-200 text-gray-700">
                        <Eye className="h-4 w-4 mr-2 text-gray-500" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* rest of modals unchanged (details modal + review modal) */}
      {/* ... (keep your modal code as in previous version) */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Chi tiết Booking #{selectedBooking.id}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>✕</Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* ... booking detail content unchanged ... */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-600">Trạng thái</p>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600">Tổng tiền</p>
                    <p className="text-lg font-semibold">{formatPrice(selectedBooking.totalPrice || 0)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Dịch vụ trong booking</h4>
                  <div className="space-y-3">
                    {selectedBooking.services?.map((item, idx) => (
                      <div key={idx} className="flex items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.name || `Dịch vụ #${item.serviceId ?? item.id}`}</p>
                          <p className="text-sm text-gray-600">Số lượng: {item.quantity} — Giá: {formatPrice(item.price)}</p>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          {item.serviceId && (
                            <Link href={`/services/${item.serviceId}#reviews`}>
                              <Button size="sm">Xem dịch vụ</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedBooking.note && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-bold text-gray-600">Ghi chú</p>
                      <p>{selectedBooking.note}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <Card className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <CardHeader className="flex items-center justify-between p-4">
              <div>
                <CardTitle>Viết đánh giá</CardTitle>
                <p className="text-sm text-gray-500">Chia sẻ trải nghiệm của bạn để giúp người khác lựa chọn</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-yellow-600 flex items-center">
                  <StarIcon className="w-4 h-4 mr-1" /> {reviewRating} sao
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReviewModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* review form unchanged */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Đánh giá</label>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" aria-label={`${s} sao`} onClick={() => setReviewRating(s)} className={`p-1 rounded ${s <= reviewRating ? 'bg-yellow-100' : 'hover:bg-gray-100'}`}>
                        <StarIcon className={`w-7 h-7 ${s <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}

                    <span className="ml-3 text-sm text-gray-600">Bạn đang chọn <strong>{reviewRating}</strong> sao</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Nội dung</label>
                  <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} className="w-full min-h-[120px] border rounded p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ảnh/Video (tùy chọn)</label>

                  <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />

                  <div className="flex items-center gap-3">
                    <Button onClick={() => fileInputRef.current?.click()} size="sm" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Chọn ảnh/Video
                    </Button>

                    {reviewFiles.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">Đã chọn <strong>{reviewFiles.length}</strong> file</div>
                        <Button variant="outline" size="sm" onClick={clearSelectedFiles}>Xóa</Button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Tối đa 5 ảnh / video. Dung lượng khuyến nghị nhỏ hơn 10MB mỗi file.</div>
                    )}
                  </div>

                  {reviewFiles.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {reviewFiles.map((f, i) => (
                        <div key={i} className="w-full h-20 border rounded overflow-hidden relative">
                          {f.type.startsWith("image/") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            <video src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute top-1 right-1">
                            <button type="button" onClick={() => setReviewFiles(prev => prev.filter((_, idx) => idx !== i))} className="bg-white bg-opacity-70 rounded-full p-1">
                              <X className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Hủy</Button>
                  <Button onClick={submitReviewForService} className="bg-emerald-600 hover:bg-emerald-700 text-white">Gửi đánh giá</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}