import { type NextRequest, NextResponse } from "next/server"

// Mock database for combos
const combos = [
  {
    id: 1,
    name: "Combo Cắm Trại Sapa Premium",
    description: "Gói combo hoàn chỉnh cho chuyến cắm trại Sapa với dịch vụ cao cấp, thiết bị đầy đủ và suất ăn ngon",
    price: 2500000,
    originalPrice: 3200000,
    discount: 22,
    duration: "3 ngày 2 đêm",
    maxPeople: 6,
    rating: 4.8,
    reviewCount: 124,
    image: "/combo-sapa-premium.jpg",
    status: "active",
    services: [
      {
        id: 1,
        name: "Cắm trại Sapa",
        type: "service",
        price: 800000,
        included: true,
      },
      {
        id: 2,
        name: "Hướng dẫn viên chuyên nghiệp",
        type: "service",
        price: 500000,
        included: true,
      },
    ],
    equipment: [
      {
        id: 1,
        name: "Lều cắm trại 4 người",
        type: "equipment",
        price: 300000,
        quantity: 2,
        included: true,
      },
      {
        id: 2,
        name: "Túi ngủ cao cấp",
        type: "equipment",
        price: 200000,
        quantity: 6,
        included: true,
      },
      {
        id: 3,
        name: "Bếp gas mini",
        type: "equipment",
        price: 150000,
        quantity: 1,
        included: true,
      },
    ],
    food: [
      {
        id: 1,
        name: "Suất ăn sáng (Phở bò)",
        type: "food",
        price: 80000,
        quantity: 6,
        day: 1,
        included: true,
      },
      {
        id: 2,
        name: "Suất ăn trưa (Cơm rang)",
        type: "food",
        price: 120000,
        quantity: 6,
        day: 1,
        included: true,
      },
      {
        id: 3,
        name: "Suất ăn tối (BBQ)",
        type: "food",
        price: 200000,
        quantity: 6,
        day: 1,
        included: true,
      },
    ],
    highlights: [
      "Tiết kiệm 700,000đ so với đặt riêng lẻ",
      "Thiết bị camping cao cấp",
      "Hướng dẫn viên kinh nghiệm",
      "Suất ăn đa dạng và ngon miệng",
      "Hỗ trợ 24/7 trong suốt chuyến đi",
    ],
    included: [
      "Tất cả thiết bị cắm trại",
      "Hướng dẫn viên chuyên nghiệp",
      "3 bữa ăn mỗi ngày",
      "Bảo hiểm du lịch",
      "Xe đưa đón từ Hà Nội",
    ],
    notIncluded: ["Chi phí cá nhân", "Đồ uống có cồn", "Tip cho hướng dẫn viên"],
    tags: ["premium", "sapa", "mountain", "family"],
    location: "Sapa, Lào Cai",
    availability: {
      available: true,
      nextAvailable: "2024-02-15",
      bookedDates: ["2024-02-10", "2024-02-11", "2024-02-12"],
    },
    bookingCount: 89,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: 2,
    name: "Combo Cắm Trại Đà Lạt Tiết Kiệm",
    description: "Gói combo cơ bản cho chuyến cắm trại Đà Lạt với giá cả phải chăng, phù hợp cho nhóm bạn trẻ",
    price: 1200000,
    originalPrice: 1600000,
    discount: 25,
    duration: "2 ngày 1 đêm",
    maxPeople: 4,
    rating: 4.5,
    reviewCount: 67,
    image: "/combo-dalat-budget.jpg",
    status: "active",
    services: [
      {
        id: 3,
        name: "Cắm trại Đà Lạt",
        type: "service",
        price: 600000,
        included: true,
      },
    ],
    equipment: [
      {
        id: 4,
        name: "Lều cắm trại 2 người",
        type: "equipment",
        price: 200000,
        quantity: 2,
        included: true,
      },
      {
        id: 5,
        name: "Túi ngủ tiêu chuẩn",
        type: "equipment",
        price: 100000,
        quantity: 4,
        included: true,
      },
    ],
    food: [
      {
        id: 4,
        name: "Suất ăn tối (Lẩu)",
        type: "food",
        price: 150000,
        quantity: 4,
        day: 1,
        included: true,
      },
      {
        id: 5,
        name: "Suất ăn sáng (Bánh mì)",
        type: "food",
        price: 50000,
        quantity: 4,
        day: 2,
        included: true,
      },
    ],
    highlights: ["Tiết kiệm 400,000đ", "Phù hợp nhóm bạn trẻ", "Thiết bị cơ bản đầy đủ", "Địa điểm đẹp gần thành phố"],
    included: ["Thiết bị cắm trại cơ bản", "2 bữa ăn", "Hướng dẫn cơ bản"],
    notIncluded: ["Hướng dẫn viên chuyên nghiệp", "Xe đưa đón", "Bảo hiểm"],
    tags: ["budget", "dalat", "friends", "basic"],
    location: "Đà Lạt, Lâm Đồng",
    availability: {
      available: true,
      nextAvailable: "2024-02-12",
      bookedDates: ["2024-02-08", "2024-02-09"],
    },
    bookingCount: 45,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const status = searchParams.get("status")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const tag = searchParams.get("tag")

    let filteredCombos = [...combos]

    // Filter by search term
    if (search) {
      filteredCombos = filteredCombos.filter(
        (combo) =>
          combo.name.toLowerCase().includes(search.toLowerCase()) ||
          combo.description.toLowerCase().includes(search.toLowerCase()) ||
          combo.location.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Filter by location
    if (location) {
      filteredCombos = filteredCombos.filter((combo) => combo.location.toLowerCase().includes(location.toLowerCase()))
    }

    // Filter by status
    if (status) {
      filteredCombos = filteredCombos.filter((combo) => combo.status === status)
    }

    // Filter by price range
    if (minPrice) {
      filteredCombos = filteredCombos.filter((combo) => combo.price >= Number.parseInt(minPrice))
    }
    if (maxPrice) {
      filteredCombos = filteredCombos.filter((combo) => combo.price <= Number.parseInt(maxPrice))
    }

    // Filter by tag
    if (tag) {
      filteredCombos = filteredCombos.filter((combo) => combo.tags.includes(tag.toLowerCase()))
    }

    return NextResponse.json({
      success: true,
      data: filteredCombos,
      total: filteredCombos.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch combos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.description || !body.price) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Calculate total original price from included items
    const servicesTotal =
      body.services?.reduce((sum: number, service: any) => sum + (service.included ? service.price : 0), 0) || 0
    const equipmentTotal =
      body.equipment?.reduce(
        (sum: number, equipment: any) => sum + (equipment.included ? equipment.price * equipment.quantity : 0),
        0,
      ) || 0
    const foodTotal =
      body.food?.reduce((sum: number, food: any) => sum + (food.included ? food.price * food.quantity : 0), 0) || 0

    const calculatedOriginalPrice = servicesTotal + equipmentTotal + foodTotal
    const discount =
      calculatedOriginalPrice > 0
        ? Math.round(((calculatedOriginalPrice - body.price) / calculatedOriginalPrice) * 100)
        : 0

    const newCombo = {
      id: Math.max(...combos.map((c) => c.id)) + 1,
      name: body.name,
      description: body.description,
      price: body.price,
      originalPrice: body.originalPrice || calculatedOriginalPrice,
      discount: body.discount || discount,
      duration: body.duration || "1 ngày",
      maxPeople: body.maxPeople || 1,
      rating: 0,
      reviewCount: 0,
      image: body.image || "/placeholder-combo.jpg",
      status: body.status || "active",
      services: body.services || [],
      equipment: body.equipment || [],
      food: body.food || [],
      highlights: body.highlights || [],
      included: body.included || [],
      notIncluded: body.notIncluded || [],
      tags: body.tags || [],
      location: body.location || "",
      availability: {
        available: body.availability?.available ?? true,
        nextAvailable: body.availability?.nextAvailable || new Date().toISOString().split("T")[0],
        bookedDates: body.availability?.bookedDates || [],
      },
      bookingCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    combos.push(newCombo)

    return NextResponse.json({
      success: true,
      data: newCombo,
      message: "Combo created successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create combo" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ success: false, error: "Combo ID is required" }, { status: 400 })
    }

    const comboIndex = combos.findIndex((c) => c.id === body.id)
    if (comboIndex === -1) {
      return NextResponse.json({ success: false, error: "Combo not found" }, { status: 404 })
    }

    // Calculate updated totals if items changed
    const servicesTotal =
      body.services?.reduce((sum: number, service: any) => sum + (service.included ? service.price : 0), 0) || 0
    const equipmentTotal =
      body.equipment?.reduce(
        (sum: number, equipment: any) => sum + (equipment.included ? equipment.price * equipment.quantity : 0),
        0,
      ) || 0
    const foodTotal =
      body.food?.reduce((sum: number, food: any) => sum + (food.included ? food.price * food.quantity : 0), 0) || 0

    const calculatedOriginalPrice = servicesTotal + equipmentTotal + foodTotal
    const discount =
      calculatedOriginalPrice > 0
        ? Math.round(((calculatedOriginalPrice - body.price) / calculatedOriginalPrice) * 100)
        : 0

    const updatedCombo = {
      ...combos[comboIndex],
      ...body,
      originalPrice: body.originalPrice || calculatedOriginalPrice,
      discount: body.discount || discount,
      updatedAt: new Date().toISOString(),
    }

    combos[comboIndex] = updatedCombo

    return NextResponse.json({
      success: true,
      data: updatedCombo,
      message: "Combo updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update combo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Combo ID is required" }, { status: 400 })
    }

    const comboIndex = combos.findIndex((c) => c.id === Number.parseInt(id))
    if (comboIndex === -1) {
      return NextResponse.json({ success: false, error: "Combo not found" }, { status: 404 })
    }

    const deletedCombo = combos.splice(comboIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedCombo,
      message: "Combo deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete combo" }, { status: 500 })
  }
}
