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
  active: boolean;
<<<<<<< HEAD
  tag: string | null;
=======
  tag: ServiceTag;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
  averageRating: number | null;
  totalReviews: number | null;
  availableSlots: number;
  imageUrl?: string; // nếu có hình ảnh
};
<<<<<<< HEAD


=======
type ServiceTag = "NEW" | "POPULAR" | "DISCOUNT";
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
};
export async function getServiceById(id: number) {
  const res = await fetch(`http://localhost:8080/apis/v1/services/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch service with id ${id}`);
  }

  return res.json();
}



=======
};
>>>>>>> 4b112d9 (Add or update frontend & backend code)
