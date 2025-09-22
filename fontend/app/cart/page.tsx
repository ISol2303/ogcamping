"use client"

import { useEffect, useMemo, useState } from "react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
    Tent,
    Mountain,
    Users,
    Star,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    ArrowLeft,
    Gift,
    Shield,
    CreditCard,
    Sparkles,
    Settings,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"


export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart } = useCart()
    const { user: authUser, isLoggedIn: authIsLoggedIn } = useAuth()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    //const [user, setUser] = useState<{ id: number; email: string; name: string; role: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    // const [user, setUser] = useState<{ id: number; email: string; name: string; role: string } | null>(null)
    const { user, logout } = useAuth()
    const router = useRouter()

    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

    // Load initial data
//    useEffect(() => {
//        const token = localStorage.getItem('authToken')
//        const userData = localStorage.getItem('user')
  //      console.log('Initial load - token:', !!token, 'userData:', !!userData)
        
 //      if (token && userData) {
  //          setIsLoggedIn(true)
  //          setUser(JSON.parse(userData))
  //      } else {
  //          setIsLoggedIn(false)
  //          setUser(null)
  //      }
  //      setIsLoading(false)
  //  }, [])
  
    // useEffect(() => {
    //     const token = localStorage.getItem('authToken')
    //     const userData = localStorage.getItem('user')
    //     if (token && userData) {
    //         setIsLoggedIn(true)
    //         setUser(JSON.parse(userData))
    //     }
    // }, [])

    // Sync with AuthContext (ưu tiên AuthContext)
    useEffect(() => {
        console.log('AuthContext changed - authIsLoggedIn:', authIsLoggedIn, 'authUser:', authUser)
        if (authIsLoggedIn && authUser) {
            setIsLoggedIn(true)
            setUser({
                id: parseInt(authUser.id), // AuthContext id là string, cần parse thành number
                email: authUser.email,
                name: authUser.name || '',
                role: authUser.role
            })
        }
    }, [authIsLoggedIn, authUser])

    // Cart items are now managed by CartContext


    // updateQuantity is now provided by CartContext
    const handleGoToCart = () => {
        router.push("/cart");
    };


    // removeFromCart is now provided by CartContext


    const applyPromoCode = () => {
        if (promoCode.toLowerCase() === "camping20") {
            setAppliedPromo("CAMPING20");
            setPromoCode("");
        }
    };

    // Handle logout
    const handleLogout = () => {
        // Sử dụng AuthContext logout
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            sessionStorage.removeItem('authToken')
            sessionStorage.removeItem('user')
        }
        setIsLoggedIn(false)
    }

    // Handle dashboard navigation based on role
    const handleDashboardNavigation = () => {
        if (user?.role === 'ADMIN') {
            router.push('/admin')
        } else if (user?.role === 'STAFF') {
            router.push('/staff')
        } else {
            router.push('/dashboard')
        }
    }
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = appliedPromo ? subtotal * 0.2 : 0;
    const shipping = 0; // Bỏ phí ship
    const total = subtotal - discount + shipping;
    
    // Debug logs
    console.log('=== CART PAGE DEBUG ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('user:', user);
    console.log('authIsLoggedIn:', authIsLoggedIn);
    console.log('authUser:', authUser);
    console.log('cartItems:', cartItems);
    console.log('subtotal:', subtotal);
    console.log('total:', total);
    console.log('localStorage authToken:', localStorage.getItem('authToken'));
    console.log('localStorage user:', localStorage.getItem('user'));
    console.log('========================');
    
    // Nếu không có token nhưng có user data cũ, xóa user data
    if (!localStorage.getItem('authToken') && localStorage.getItem('user')) {
        console.log('Clearing old user data - no token found');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userId');
    }
    
    // Function để xóa dữ liệu cũ và đăng nhập lại
    const handleClearAndLogin = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    }
    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    
    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        )
    }
    
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
                {/* Empty Cart */}
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShoppingCart className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các dịch vụ cắm trại tuyệt vời của chúng tôi!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                asChild
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            >
                                <Link href="/services">
                                    <Mountain className="w-5 h-5 mr-2" />
                                    Xem dịch vụ
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/equipment">
                                    <Tent className="w-5 h-5 mr-2" />
                                    Thuê thiết bị
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    // CartPage.tsx
    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert("Giỏ hàng trống");
            return;
        }
        if (!user || !user.email) {
            alert("Bạn cần đăng nhập trước khi thanh toán");
            return;
        }

        // Redirect to checkout - cart is already managed by CartContext
        window.location.href = "/checkout";
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">

            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/" className="hover:text-green-600 transition-colors">
                        Trang chủ
                    </Link>
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">Giỏ hàng</span>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-20">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Danh sách của bạn</h1>
                        <p className="text-gray-600">{cartItems.length} dịch vụ hoặc thiết bị đã được thêm</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.map((item) => (
                            <Card
                                key={item.id}
                                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                            >
                                <CardContent className="p-6">
                                    <div className="flex gap-6">
                                        {/* Product Image */}
                                        <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-green-200 flex-shrink-0">
                                            <Image
                                                src={item.item.imageUrl ? `http://localhost:8080${item.item.imageUrl}` : "/placeholder.svg"}
                                                alt={item.item.name}
                                                fill
                                                className="object-cover"
                                            />

                                            {item.type === "SERVICE" && (
                                                <Badge className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white border-0 text-xs">
                                                    Dịch vụ
                                                </Badge>
                                            )}
                                            {item.type === "EQUIPMENT" && (
                                                <Badge className="absolute top-2 left-2 bg-purple-500 hover:bg-purple-600 text-white border-0 text-xs">
                                                    Thiết bị
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                        {item.item.name}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {item.item.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-medium text-gray-900">4.6</span>
                                                            {/* <span className="font-medium text-gray-900">{item.rating}</span> */}
                                                            <span>(125)</span>
                                                            {/* <span>({item.reviews})</span> */}
                                                        </div>

                                                        {/* Duration */}
                                                        {item.item.duration && item.item.duration !== "null-null ngày" && (
                                                            <div className="flex items-center gap-1">
                                                                <span>{item.item.duration}</span>
                                                            </div>
                                                        )}

                                                        {/* Capacity */}
                                                        {item.item.capacity && item.item.capacity !== "1-1 người" && (
                                                            <div className="flex items-center gap-1">
                                                                <Users className="w-4 h-4" />
                                                                <span>{item.item.capacity}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Price and Quantity */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (item.type === "SERVICE" && item.quantity > 1) {
                                                                updateQuantity(item.id, item.quantity - 1);
                                                            } else if (item.type !== "SERVICE") {
                                                                updateQuantity(item.id, item.quantity - 1);
                                                            }
                                                        }}
                                                        disabled={item.type === "SERVICE" ? item.quantity <= 1 : item.quantity <= 0}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>

                                                    <span className="w-12 text-center font-medium">{item.quantity}</span>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (item.type === "SERVICE") {
                                                                const maxPeople = item.item.allowExtraPeople
                                                                    ? item.item.maxCapacity + item.item.maxExtraPeople
                                                                    : item.item.maxCapacity;
                                                                if (item.quantity < maxPeople) {
                                                                    updateQuantity(item.id, item.quantity + 1);
                                                                }
                                                            } else {
                                                                updateQuantity(item.id, item.quantity + 1);
                                                            }
                                                        }}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                    {item.type === "SERVICE" && item.item.capacity && item.item.capacity !== "null-null người" && (
                                                        <span className="w-12 text-center font-medium">Người</span>
                                                    )}
                                                    {item.type === "EQUIPMENT" && (
                                                        <span className="w-12 text-center font-medium">Thiết bị</span>
                                                    )}
                                                </div>

                                                <div className="text-xl font-bold text-green-600">
                                                    {formatPrice(
                                                        item.type === "SERVICE"
                                                            ? item.item.price + Math.max(0, item.quantity - item.item.maxCapacity) * (item.item.extraFeePerPerson || 0)
                                                            : item.totalPrice
                                                    )}
                                                </div>
                                            </div>

                                            {/* Equipment specific info */}
                                            {item.type === "EQUIPMENT" && item.rentalDays && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <span>Thuê {item.rentalDays} ngày</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{item.item.price?.toLocaleString('vi-VN')}đ/ngày</span>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Continue Shopping */}
                        < div className="flex justify-center pt-6 gap-3" >
                            <Button
                                variant="outline"
                                asChild
                                className="border-gray-300 text-gray-800 hover:bg-gray-50 bg-transparent"
                            >
                                <Link href="/services">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Tìm thêm dịch vụ phù hợp
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                className="border-gray-300 text-gray-800 hover:bg-gray-50 bg-transparent"
                            >
                                <Link href="/equipment">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Tìm thêm thiết bị
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        {/* Promo Code */}
                        <Card className="border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Gift className="w-5 h-5 text-green-600" />
                                    Mã giảm giá
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {appliedPromo ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">{appliedPromo}</Badge>
                                            <span className="text-sm text-green-700">Giảm 20%</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setAppliedPromo(null)}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nhập mã giảm giá"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={applyPromoCode}
                                            variant="outline"
                                            className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
                                        >
                                            Áp dụng
                                        </Button>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">Thử mã "CAMPING20" để được giảm 20%</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá ({appliedPromo})</span>
                                        <span>-{formatPrice(discount)}</span>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng</span>
                                    <span className="text-green-600">{formatPrice(total)}</span>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        onClick={handleCheckout}
                                    >
                                        <CreditCard /> Thanh toán ngay
                                    </Button>
                                    
                                    {/* Debug button - chỉ hiển thị khi có vấn đề */}
                                    {!isLoggedIn && (
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 border-red-600 hover:bg-red-50"
                                            onClick={handleClearAndLogin}
                                        >
                                            🔧 Xóa dữ liệu cũ & Đăng nhập lại
                                        </Button>
                                    )}

                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        <span>Thanh toán an toàn & bảo mật</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trust Badges */}
                        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
                            <CardContent className="p-6">
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                                        <Shield className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">Cam kết chất lượng</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">Hoàn tiền 100% nếu không hài lòng với dịch vụ</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div >
    )
}