import axios from "axios";

// URL backend (trùng với @RequestMapping("/api/staffs"))
const API_BASE = "http://localhost:8080/api/staffs";

// Kiểu dữ liệu tương ứng với StaffDTO bên backend
export interface StaffDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  status: string;
}

// ✅ Lấy tất cả staff
export const getAllStaffs = async (): Promise<StaffDTO[]> => {
  const res = await axios.get(API_BASE);
  return res.data;
};

// ✅ Lấy staff theo ID
export const getStaffById = async (id: number): Promise<StaffDTO> => {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
};

// ✅ Thêm staff mới
export const createStaff = async (
  staff: Omit<StaffDTO, "id">
): Promise<StaffDTO> => {
  const res = await axios.post(API_BASE, staff);
  return res.data;
};

// ✅ Cập nhật staff
export const updateStaff = async (
  id: number,
  staff: StaffDTO
): Promise<StaffDTO> => {
  const res = await axios.put(`${API_BASE}/${id}`, staff);
  return res.data;
};

// ✅ Xóa staff
export const deleteStaff = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};
