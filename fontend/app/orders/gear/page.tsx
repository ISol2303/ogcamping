"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Package, DollarSign, Eye } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: number;
  itemType: string;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  rentalDays?: number;
  productName?: string;
  productImage?: string;
  productDescription?: string;
}

interface Order {
  id: number;
  orderCode: string;
  status: string;
  totalPrice: number;
  createdOn: string;
  orderDate: string;
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
}

export default function GearOrderHistory() {
  const { user, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchOrders();
    }
  }, [isLoggedIn, user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:8080/apis/gear-orders/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        // Sắp xếp theo ngày tạo mới nhất trước
        const sortedOrders = data.sort((a: Order, b: Order) => 
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/apis/gear-orders/${user?.id}/details/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", text: string } } = {
      'PENDING': { variant: 'secondary', text: 'Chờ xử lý' },
      'CONFIRMED': { variant: 'default', text: 'Đã xác nhận' },
      'CANCELLED': { variant: 'destructive', text: 'Đã hủy' },
      'COMPLETED': { variant: 'outline', text: 'Hoàn thành' }
    };
    
    const statusInfo = statusMap[status] || { variant: 'secondary', text: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập để xem lịch sử đơn hàng</h1>
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
          <p className="mt-4">Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lịch sử đơn hàng thiết bị</h1>
        <p className="text-gray-600">Xem tất cả đơn hàng thiết bị camping của bạn</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-gray-600 mb-4">Bạn chưa mua thiết bị camping nào</p>
            <Link href="/store">
              <Button>Mua sắm ngay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Đơn hàng #{order.orderCode}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      <CalendarDays className="inline h-4 w-4 mr-1" />
                      {formatDate(order.createdOn)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-lg font-semibold mt-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                    <p className="text-sm">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-sm">{order.email}</p>
                  </div>
                  <div>
                    {order.phone && (
                      <>
                        <p className="text-sm font-medium text-gray-600">Số điện thoại</p>
                        <p className="text-sm">{order.phone}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} sản phẩm
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchOrderDetails(order.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                  
                  {/* Hiển thị thông tin thuê nếu có */}
                  {order.items?.some(item => item.rentalDays && item.rentalDays > 0) && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        Thuê {order.items
                          .filter(item => item.rentalDays && item.rentalDays > 0)
                          .map(item => `${item.quantity} thiết bị x ${item.rentalDays} ngày`)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Chi tiết đơn hàng #{selectedOrder.orderCode}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng tiền</p>
                    <p className="text-lg font-semibold">{formatPrice(selectedOrder.totalPrice)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-3">Sản phẩm đã mua</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center p-3 border rounded-lg">
                        {item.productImage && (
                          <div className="w-16 h-16 mr-3 flex-shrink-0">
                            <img 
                              src={`http://localhost:8080${item.productImage}`} 
                              alt={item.productName || `Thiết bị #${item.itemId}`}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.productName || (item.itemType === 'GEAR' ? 'Thiết bị' : item.itemType)} #{item.itemId}
                          </p>
                          {item.productDescription && (
                            <p className="text-sm text-gray-600 mb-1">{item.productDescription}</p>
                          )}
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Số lượng: {item.quantity}</p>
                            {item.rentalDays && item.rentalDays > 0 && (
                              <p className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4 text-blue-500" />
                                Thuê {item.rentalDays} ngày
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {formatPrice(item.unitPrice)}/ngày
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

