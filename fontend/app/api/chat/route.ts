// route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BASE_URL = "http://localhost:8080/apis/v1/services";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json(); // nhận luôn history từ FE

    // gọi BE để có danh sách service
    const res = await fetch(BASE_URL, { cache: "no-store" });
    const allServices = await res.json();

    // map history từ FE sang format AI hiểu
    const aiHistory = history.map((m: any) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.content,
    }));

    // gọi AI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Bạn là AI tư vấn dịch vụ cắm trại OG Camping, trả lời bằng tiếng Việt.
      - Đây là danh sách gói dịch vụ hiện có: ${JSON.stringify(allServices, null, 2)}

      QUY TẮC TRẢ LỜI:
      1. Nếu người dùng hỏi về dịch vụ (giá, vị trí, số ngày, tag, gia đình, bạn bè...), bạn LUÔN trả về **một JSON hợp lệ duy nhất** theo format:

      {
        "type": "service_request",
        "criteria": { "location": "...", "maxPrice": ..., "days": ..., "tag": "..." },
        "services": [
          { "id": ..., "name": "...", "price": ..., "location": "...", "days": ..., "tag": "..." }
        ],
        "reply": "Một câu trả lời thân thiện, giải thích tại sao gói này phù hợp cho khách."
      }

      2. Nếu chỉ chào hỏi → trả text tự nhiên, KHÔNG JSON.
      3. KHÔNG dùng từ khóa 'json', KHÔNG bao bọc câu trả lời bằng backtick.
      `,
        },
        ...aiHistory,
        { role: "user", content: message }, // thêm câu mới
      ],
    });

    const aiResponse = completion.choices[0].message?.content;
    let reply = "Xin lỗi, tôi chưa có câu trả lời.";
    let services: any[] = [];

    if (aiResponse) {
      try {
        const parsed = JSON.parse(aiResponse);

        if (parsed.type === "service_request") {
          // filter dịch vụ
          services = allServices.filter((s: any) => {
            const matchPrice =
              !parsed.criteria?.maxPrice || s.price <= parsed.criteria.maxPrice;
            const matchLocation =
              !parsed.criteria?.location ||
              (s.location &&
                s.location
                  .toLowerCase()
                  .includes(parsed.criteria.location.toLowerCase()));
            const matchDays =
              !parsed.criteria?.days || s.days === parsed.criteria.days;
            const matchTag =
              !parsed.criteria?.tag ||
              (s.tag &&
                s.tag.toLowerCase() === parsed.criteria.tag.toLowerCase());
            return matchPrice && matchLocation && matchDays && matchTag;
          });

          reply =
            parsed.reply ||
            (services.length > 0
              ? `Mình tìm được ${services.length} gói phù hợp với yêu cầu của bạn 👇`
              : "Hiện chưa có gói nào theo tiêu chí này.");
        } else {
          reply = parsed.content || "Xin lỗi, tôi chưa có câu trả lời.";
        }
      } catch {
        // parse lỗi → text thường
        reply = aiResponse;
      }
    }

    return NextResponse.json({ reply, services });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { reply: "Có lỗi xảy ra khi gọi AI." },
      { status: 500 }
    );
  }
}
