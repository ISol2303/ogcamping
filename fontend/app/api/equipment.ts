import axios from 'axios'

interface SubmitEquipmentRequest {
  name: string
  category: string
  area: string
  description: string
  quantity_in_stock: number
  image: File | null
  available: number
  price_per_day: number
  status: 'available' | 'out_of_stock'
}

interface User {
  _id: string
  role: string | string[]
}

export interface Equipment {
  _id: string
  name: string
  category: string
  area: string
  description: string
  quantity_in_stock: number
  available: number
  price_per_day: number
  status: string
  image_url?: string
}
export const submitEquipment = async (token: string, data: SubmitEquipmentRequest): Promise<void> => {
  try {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('category', data.category.toUpperCase()) // ✅ ép về enum
    formData.append('area', data.area.toUpperCase())         // ✅ ép về enum
    formData.append('description', data.description)
    formData.append('quantity_in_stock', data.quantity_in_stock.toString())
    formData.append('available', data.available.toString())
    formData.append('price_per_day', data.price_per_day.toString())
    formData.append('status', data.status.toUpperCase())     // ✅ ép về enum
    if (data.image) {
      formData.append('image', data.image)
    }

    await axios.post('http://localhost:8080/apis/v1/gears', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (error: any) {
    const status = error.response?.status || 500
    const data = error.response?.data || {}
    const message = data.error || error.message || 'Failed to submit equipment'
    console.error('Error submitting equipment:', { status, message, data })
    throw { status, data, message }
  }
}

export const fetchEquipment = async (): Promise<Equipment[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const response = await axios.get(`${API_URL}/apis/v1/gears`)

    return response.data.map((item: any) => ({
      _id: item._id ?? item.id ?? '',
      name: item.name ?? '',
      category: item.category ?? '',
      area: item.area ?? '',
      description: item.description ?? '',
      quantity_in_stock: Number(item.quantityInStock ?? item.quantity_in_stock ?? 0),
      available: Number(item.available ?? 0),
      price_per_day: Number(item.pricePerDay ?? item.price_per_day ?? 0), // ✅ ép số + mặc định 0
      status: (item.status ?? '').toString().toLowerCase(), // ✅ chuẩn hóa
      image_url: item.image ?? item.image_url ?? '',
    }))
  } catch (error: any) {
    const status = error.response?.status || 500
    const data = error.response?.data || {}
    const message = data.error || error.message || 'Failed to fetch equipment'
    console.error('Error fetching equipment:', { status, message, data })
    throw { status, data, message }
  }
}




export const fetchUser = async (token: string, id: number): Promise<User> => {
  try {
    const response = await axios.get(`http://localhost:8080/apis/v1/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error: any) {
    const status = error.response?.status || 500
    const data = error.response?.data || {}
    const message = data.error || error.message || 'Failed to fetch user'
    console.error('Error fetching user:', { status, message, data })
    throw { status, data, message }
  }
}
