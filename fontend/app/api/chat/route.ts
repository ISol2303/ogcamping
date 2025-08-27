import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Bạn là AI tư vấn dịch vụ cắm trại OG Camping, trả lời bằng tiếng Việt." },
        { role: "user", content: message },
      ],
    });

    return NextResponse.json({
      reply: completion.choices[0].message?.content || "Xin lỗi, tôi chưa có câu trả lời.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "Có lỗi xảy ra khi gọi AI." }, { status: 500 });
  }
}
