export type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;
  minDays: number;
  maxDays: number;
  minCapacity: number;
  maxCapacity: number;
  duration?: string;
  capacity?: string;
  active: boolean;
  tag: ServiceTag;
  averageRating: number | null;
  totalReviews: number | null;
  availableSlots: number;
  imageUrl?: string; // nếu có hình ảnh
  highlights?: string[]; // Điểm nổi bật của dịch vụ
  included?: string[]; // Dịch vụ bao gồm
  itinerary?: ItineraryItem[]; // Lịch trình chi tiết
};

export type ItineraryItem = {
  day: number;
  description: string;
};
type ServiceTag = "NEW" | "POPULAR" | "DISCOUNT";
export const getServices = async (): Promise<Service[]> => {
  try {
    const res = await fetch(`http://localhost:8080/apis/v1/services`);
    if (!res.ok) {
      throw new Error("Failed to fetch services");
    }
    console.log(res);
    return res.json();
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};