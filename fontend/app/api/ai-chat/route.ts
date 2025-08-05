import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
            Bạn là trợ lý tư vấn OG Camping, hãy trả lời ngắn gọn, thân thiện, tư vấn về gói cắm trại phù hợp cho khách hàng Việt Nam.
            Một số gói tiêu biểu:
            - Gói gia đình Đà Lạt: 3.2 triệu, lều lớn, BBQ, an toàn trẻ em
            - Gói Phú Quốc: 1.8 triệu, biển
            - Gói Sapa: 2.5 triệu, núi
          `,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    }),
  })

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.'
  
  // Log the raw response for debugging
  console.log('OpenAI raw response:', JSON.stringify(data, null, 2))

  return NextResponse.json({ reply })
}
