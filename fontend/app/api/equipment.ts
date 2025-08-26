import axios from 'axios';

interface SubmitEquipmentRequest {
  name: string;
  category: string;
  area: string;
  description: string;
  quantity_in_stock: number;
  image: File | null;
  available: number;
  price_per_day: number;
  status: 'available' | 'out_of_stock';
}

interface User {
  _id: string;
  role: string | string[];
}

export const submitEquipment = async (token: string, data: SubmitEquipmentRequest): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('area', data.area);
    formData.append('description', data.description);
    formData.append('quantity_in_stock', data.quantity_in_stock.toString());
    formData.append('available', data.available.toString());
    formData.append('price_per_day', data.price_per_day.toString());
    formData.append('status', data.status);
    if (data.image) {
      formData.append('image', data.image);
    }

    await axios.post('http://localhost:8080/apis/v1/gears', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to submit equipment';

    console.error('Error submitting equipment:', { status, message, data });

    throw { status, data, message };
  }
};

export const fetchUser = async (token: string, id: number): Promise<User> => {
  try {
    const response = await axios.get(`http://localhost:8080/apis/v1/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    const message = data.error || error.message || 'Failed to fetch user';

    console.error('Error fetching user:', { status, message, data });

    throw { status, data, message };
  }
};