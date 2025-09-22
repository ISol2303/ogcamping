"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tent,
  Users,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  CalendarPlus,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string;
  department: string | null;
  joinDate: string | null;
  status: string;
  address: string | null;
  createdAt: string;
}

interface ShiftAssignment {
  userId: number;
  userName: string;
  role: string;
}

interface Shift {
  id: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: string;
  assignments: ShiftAssignment[];
}

interface ShiftWithStaff extends Shift {
  // Keep assignments as is from API
}

interface CreateShiftData {
  shiftDate: string;
  startTime: string;
  endTime: string;
  status?: string;
}

interface UpdateShiftData {
  shiftDate?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}
// API Service Functions
const API_BASE_URL = "http://localhost:8080/apis/v1/admin";

const shiftAPI = {
  // Get all shifts
  getShifts: async (): Promise<ShiftWithStaff[]> => {
    const response = await fetch(`${API_BASE_URL}/shifts`);
    if (!response.ok) throw new Error('Failed to fetch shifts');
    return response.json();
  },

  // Create new shift
  createShift: async (data: CreateShiftData): Promise<Shift> => {
    const response = await fetch(`${API_BASE_URL}/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create shift');
    return response.json();
  },

  // Update shift
  updateShift: async (shiftId: number, data: UpdateShiftData): Promise<Shift> => {
    const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update shift');
    return response.json();
  },

  // Delete shift
  deleteShift: async (shiftId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete shift');
  },

  // Get shift staff
  getShiftStaff: async (shiftId: number): Promise<ShiftAssignment[]> => {
    const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}/staff`);
    if (!response.ok) throw new Error('Failed to fetch shift staff');
    return response.json();
  },

  // Add staff to shift
  addStaffToShift: async (shiftId: number, staffId: number): Promise<ShiftAssignment> => {
    const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId }),
    });
    if (!response.ok) throw new Error('Failed to add staff to shift');
    return response.json();
  },

  // Remove staff from shift
  removeStaffFromShift: async (shiftId: number, staffId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}/staff/${staffId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove staff from shift');
  },
};

export default function StaffManagement() {
  const [selectedTab, setSelectedTab] = useState("staff")
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false)
  const [isEditShiftOpen, setIsEditShiftOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<ShiftWithStaff | null>(null)

  const [staffList, setStaffList] = useState<User[]>([]);
  const [shifts, setShifts] = useState<ShiftWithStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShiftsLoading, setIsShiftsLoading] = useState(true);
  const [selectedStaffForShift, setSelectedStaffForShift] = useState<{ [key: number]: string }>({});
  const [shiftDateFilter, setShiftDateFilter] = useState<string>('all'); // 'all', 'today', 'week'

  // Form states for shift creation/editing
  const [shiftForm, setShiftForm] = useState<CreateShiftData>({
    shiftDate: '',
    startTime: '',
    endTime: '',
    status: 'REGISTERED',
  });

  // Fetch users and shifts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/apis/v1/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const users: User[] = await res.json();

        // Lọc các user có role === "STAFF"
        const staff = users.filter(u => u.role === "STAFF");
        console.log(staff);
        setStaffList(staff);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchShifts = async () => {
      try {
        const shiftsData = await shiftAPI.getShifts();
        setShifts(shiftsData);
      } catch (err) {
        console.error('Error fetching shifts:', err);
      } finally {
        setIsShiftsLoading(false);
      }
    };

    fetchUsers();
    fetchShifts();
  }, []);

  // Helper function to format time display
  const formatTimeSlot = (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`;
  };

  // Helper function to calculate shift status based on assignments
  const getShiftStatus = (assignments: ShiftAssignment[]): string => {
    if (assignments.length === 0) return 'EMPTY';
    if (assignments.length < 4) return 'UNDERSTAFFED'; // Assuming 4 is ideal
    return 'FULL';
  };

  // Helper functions for date filtering
  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const shiftDate = new Date(dateString);
    return today.toDateString() === shiftDate.toDateString();
  };

  const isThisWeek = (dateString: string): boolean => {
    const today = new Date();
    const shiftDate = new Date(dateString);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Chủ nhật đầu tuần
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Thứ 7 cuối tuần

    return shiftDate >= startOfWeek && shiftDate <= endOfWeek;
  };

  // Check if shift is in the past
  const isShiftPast = (shiftDate: string, endTime: string): boolean => {
    const now = new Date();
    const shiftDateTime = new Date(`${shiftDate}T${endTime}`);
    return shiftDateTime < now;
  };

  // Filter shifts based on date filter
  const filteredShifts = shifts.filter(shift => {
    switch (shiftDateFilter) {
      case 'today':
        return isToday(shift.shiftDate);
      case 'week':
        return isThisWeek(shift.shiftDate);
      default:
        return true; // 'all'
    }
  });

  // Handle shift creation
  const handleCreateShift = async () => {
    try {
      const newShift = await shiftAPI.createShift(shiftForm);
      const shiftWithStaff: ShiftWithStaff = {
        ...newShift,
        assignments: []
      };
      setShifts(prev => [...prev, shiftWithStaff]);
      setIsAddShiftOpen(false);
      setShiftForm({
        shiftDate: '',
        startTime: '',
        endTime: '',
        status: 'REGISTERED',
      });
    } catch (err) {
      console.error('Error creating shift:', err);
      alert('Có lỗi xảy ra khi tạo ca trực');
    }
  };

  // Handle shift update
  const handleUpdateShift = async () => {
    if (!editingShift) return;

    try {
      const updatedShift = await shiftAPI.updateShift(editingShift.id, shiftForm);
      setShifts(prev => prev.map(shift =>
        shift.id === editingShift.id
          ? { ...shift, ...updatedShift }
          : shift
      ));
      setIsEditShiftOpen(false);
      setEditingShift(null);
      setShiftForm({
        shiftDate: '',
        startTime: '',
        endTime: '',
        status: 'REGISTERED',
      });
    } catch (err) {
      console.error('Error updating shift:', err);
      alert('Có lỗi xảy ra khi cập nhật ca trực');
    }
  };

  // Handle shift deletion
  const handleDeleteShift = async (shiftId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ca trực này?')) return;

    try {
      await shiftAPI.deleteShift(shiftId);
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    } catch (err) {
      console.error('Error deleting shift:', err);
      alert('Có lỗi xảy ra khi xóa ca trực');
    }
  };

  // Handle adding staff to shift
  const handleAddStaffToShift = async (shiftId: number) => {
    const selectedStaffId = selectedStaffForShift[shiftId];
    if (!selectedStaffId) return;

    try {
      await shiftAPI.addStaffToShift(shiftId, parseInt(selectedStaffId));

      // Tìm thông tin nhân viên từ staffList
      const selectedStaff = staffList.find(staff => staff.id === parseInt(selectedStaffId));

      if (selectedStaff) {
        const newAssignment: ShiftAssignment = {
          userId: selectedStaff.id,
          userName: selectedStaff.name || `${selectedStaff.firstName || ''} ${selectedStaff.lastName || ''}`.trim() || 'Chưa có tên',
          role: selectedStaff.role
        };

        setShifts(prev => prev.map(shift => {
          if (shift.id === shiftId) {
            const updatedAssignments = [...shift.assignments, newAssignment];
            return {
              ...shift,
              assignments: updatedAssignments
              // Giữ nguyên shift.status từ API, không thay đổi
            };
          }
          return shift;
        }));
      }

      setSelectedStaffForShift(prev => ({ ...prev, [shiftId]: '' }));
    } catch (err) {
      console.error('Error adding staff to shift:', err);
      alert('Có lỗi xảy ra khi thêm nhân viên vào ca trực');
    }
  };

  // Handle removing staff from shift
  const handleRemoveStaffFromShift = async (shiftId: number, userId: number) => {
    try {
      await shiftAPI.removeStaffFromShift(shiftId, userId);
      setShifts(prev => prev.map(shift => {
        if (shift.id === shiftId) {
          const updatedAssignments = shift.assignments.filter((assignment: ShiftAssignment) => assignment.userId !== userId);
          return {
            ...shift,
            assignments: updatedAssignments
            // Giữ nguyên shift.status từ API, không thay đổi
          };
        }
        return shift;
      }));
    } catch (err) {
      console.error('Error removing staff from shift:', err);
      alert('Có lỗi xảy ra khi xóa nhân viên khỏi ca trực');
    }
  };

  // Handle edit shift
  const handleEditShift = (shift: ShiftWithStaff) => {
    setEditingShift(shift);
    setShiftForm({
      shiftDate: shift.shiftDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: shift.status,
    });
    setIsEditShiftOpen(true);
  };

  if (isLoading || isShiftsLoading) return <div>Đang tải dữ liệu...</div>;

  // Badge cho staff status (ACTIVE/INACTIVE)
  const getStaffStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Đang làm việc</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Tạm nghỉ</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  // Badge cho shift status (API enum)
  const getShiftStatusBadge = (status: string) => {
    switch (status) {
      case "REGISTERED":
        return <Badge className="bg-yellow-100 text-yellow-800">🟡 Nhân viên đăng ký</Badge>
      case "APPROVED":
        return <Badge className="bg-blue-100 text-blue-800">🟢 Quản lý duyệt</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-purple-100 text-purple-800">🔵 Đang trực</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">✅ Đã xong</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">❌ Bị hủy</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  // Badge cho assignment status (tính toán cục bộ)
  const getAssignmentStatusBadge = (status: string) => {
    switch (status) {
      case "UNDERSTAFFED":
        return <Badge className="bg-yellow-100 text-yellow-800">Thiếu nhân viên</Badge>
      case "FULL":
        return <Badge className="bg-green-100 text-green-800">Đủ nhân viên</Badge>
      case "EMPTY":
        return <Badge className="bg-red-100 text-red-800">Chưa có ai</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      
      <div className="container mx-auto flex items-center justify-between mb-1 pt-4">
        {/* Back Button */}
        <Link
          href="/admin"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Quay lại</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Add Staff */}
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm nhân viên mới</DialogTitle>
                <DialogDescription>Nhập thông tin nhân viên mới</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" placeholder="Nhập họ và tên" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Nhập email" />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" placeholder="Nhập số điện thoại" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Thêm nhân viên</Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsAddStaffOpen(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Shift */}
          <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Tạo ca trực
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo ca trực mới</DialogTitle>
                <DialogDescription>Tạo ca trực cho nhân viên</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shift-date">Ngày</Label>
                  <Input
                    id="shift-date"
                    type="date"
                    value={shiftForm.shiftDate}
                    onChange={(e) =>
                      setShiftForm((prev) => ({ ...prev, shiftDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="start-time">Giờ bắt đầu</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) =>
                      setShiftForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">Giờ kết thúc</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) =>
                      setShiftForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleCreateShift}>
                    Tạo ca trực
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setIsAddShiftOpen(false);
                      setShiftForm({
                        shiftDate: "",
                        startTime: "",
                        endTime: "",
                        status: "REGISTERED",
                      });
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Shift */}
          <Dialog open={isEditShiftOpen} onOpenChange={setIsEditShiftOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa ca trực</DialogTitle>
                <DialogDescription>Cập nhật thông tin ca trực</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-shift-date">Ngày</Label>
                  <Input
                    id="edit-shift-date"
                    type="date"
                    value={shiftForm.shiftDate}
                    onChange={(e) =>
                      setShiftForm((prev) => ({ ...prev, shiftDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-start-time">Giờ bắt đầu</Label>
                  <Input
                    id="edit-start-time"
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) =>
                      setShiftForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-time">Giờ kết thúc</Label>
                  <Input
                    id="edit-end-time"
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) =>
                      setShiftForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleUpdateShift}>
                    Cập nhật
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setIsEditShiftOpen(false);
                      setEditingShift(null);
                      setShiftForm({
                        shiftDate: "",
                        startTime: "",
                        endTime: "",
                        status: "REGISTERED",
                      });
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang làm việc</p>
                  <p className="text-3xl font-bold text-gray-900">18</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ca trực hôm nay</p>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cần tuyển</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <UserPlus className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-3">
            <TabsTrigger value="staff">Danh sách nhân viên</TabsTrigger>
            <TabsTrigger value="shifts">Lịch ca trực</TabsTrigger>
            <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Danh sách nhân viên</CardTitle>
                    <CardDescription>Quản lý thông tin nhân viên</CardDescription>
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
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Tìm kiếm nhân viên..." className="pl-10" />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={staff.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {staff.name
                                  ? staff.name.split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                  : (staff.firstName && staff.lastName 
                                      ? `${staff.firstName[0]}${staff.lastName[0]}`
                                      : "??")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {staff.name || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Chưa có tên'}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                <span>{staff.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-3 h-3" />
                                <span>{staff.phone}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell>{getStaffStatusBadge(staff.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lịch ca trực</CardTitle>
                    <CardDescription>Quản lý và phân công ca trực</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Hiển thị: <span className="font-medium">{filteredShifts.length}</span> / <span className="font-medium">{shifts.length}</span> ca trực
                    </div>
                    <Select value={shiftDateFilter} onValueChange={setShiftDateFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Lọc theo ngày" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">📅 Tất cả</SelectItem>
                        <SelectItem value="today">🌅 Hôm nay</SelectItem>
                        <SelectItem value="week">📆 Tuần này</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredShifts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {shifts.length === 0
                          ? "Chưa có ca trực nào. Tạo ca trực mới để bắt đầu!"
                          : `Không có ca trực nào ${shiftDateFilter === 'today' ? 'hôm nay' : shiftDateFilter === 'week' ? 'tuần này' : ''}`
                        }
                      </p>
                    </div>
                  ) : (
                    filteredShifts.map((shift: ShiftWithStaff) => (
                      <div
                        key={shift.id}
                        className={`border rounded-lg p-6 ${isShiftPast(shift.shiftDate, shift.endTime)
                          ? 'bg-gray-50 border-gray-300 opacity-75'
                          : 'bg-white border-gray-200'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className={`text-lg font-semibold ${isShiftPast(shift.shiftDate, shift.endTime) ? 'text-gray-500' : ''
                              }`}>
                              {shift.shiftDate} - {formatTimeSlot(shift.startTime, shift.endTime)}
                              {isShiftPast(shift.shiftDate, shift.endTime) && (
                                <span className="ml-2 text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                  ⏰ Đã qua
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600">
                              {getShiftStatusBadge(shift.status)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getAssignmentStatusBadge(getShiftStatus(shift.assignments))}
                            <span className="text-sm text-gray-600">
                              {shift.assignments.length} người
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditShift(shift)}
                                disabled={isShiftPast(shift.shiftDate, shift.endTime)}
                                title={isShiftPast(shift.shiftDate, shift.endTime) ? "Không thể chỉnh sửa ca trực đã qua" : "Chỉnh sửa ca trực"}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteShift(shift.id)}
                                disabled={isShiftPast(shift.shiftDate, shift.endTime)}
                                title={isShiftPast(shift.shiftDate, shift.endTime) ? "Không thể xóa ca trực đã qua" : "Xóa ca trực"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Nhân viên đã phân công</h4>
                            <div className="space-y-2">
                              {shift.assignments && shift.assignments.length > 0 ? (
                                shift.assignments.map((assignment: ShiftAssignment, index: number) => {
                                  const displayName = assignment.userName || "Chưa rõ";
                                  const initials = displayName && displayName !== "Chưa rõ"
                                    ? displayName
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                    : "??";

                                  return (
                                    <div
                                      key={assignment.userId ?? `${assignment.userId}-${index}`}
                                      className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                    >
                                      <Avatar className="w-8 h-8">
                                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">{displayName}</p>
                                        <p className="text-xs text-gray-600">
                                          {assignment.role || "Không rõ"}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto"
                                        onClick={() =>
                                          handleRemoveStaffFromShift(shift.id, assignment.userId)
                                        }
                                        disabled={isShiftPast(shift.shiftDate, shift.endTime)}
                                        title={isShiftPast(shift.shiftDate, shift.endTime) ? "Không thể xóa nhân viên khỏi ca trực đã qua" : "Xóa nhân viên khỏi ca"}
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-gray-500 text-sm">Chưa có nhân viên nào</p>
                              )}
                            </div>

                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Thêm nhân viên</h4>
                            <div className="space-y-3">
                              <Select
                                value={selectedStaffForShift[shift.id] || ''}
                                onValueChange={(value) => setSelectedStaffForShift(prev => ({ ...prev, [shift.id]: value }))}
                                disabled={isShiftPast(shift.shiftDate, shift.endTime)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={isShiftPast(shift.shiftDate, shift.endTime) ? "Ca trực đã qua" : "Chọn nhân viên"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {staffList
                                    .filter((s) => s.status === "ACTIVE" && !shift.assignments.some((sa: ShiftAssignment) => sa.userId === s.id))
                                    .map((staff) => (
                                      <SelectItem key={staff.id} value={staff.id.toString()}>
                                        {staff.name || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Chưa có tên'} - {staff.role}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleAddStaffToShift(shift.id)}
                                disabled={!selectedStaffForShift[shift.id] || isShiftPast(shift.shiftDate, shift.endTime)}
                                title={isShiftPast(shift.shiftDate, shift.endTime) ? "Không thể thêm nhân viên vào ca trực đã qua" : "Thêm nhân viên vào ca"}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                {isShiftPast(shift.shiftDate, shift.endTime) ? "Ca trực đã qua" : "Thêm vào ca"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Hiệu suất làm việc</CardTitle>
                <CardDescription>Theo dõi hiệu suất và đánh giá nhân viên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Tính năng đang được phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
