// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SERVICE_URL = "http://localhost:8080/apis/v1/services";
const COMBO_URL = "http://localhost:8080/apis/v1/combos";

function parsePrice(value: any): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number" && !isNaN(value)) return Math.round(value);
  let s = String(value).toLowerCase().trim();
  s = s.replace(/\s+/g, "");
  s = s.replace(/(vnd|đ|dong|vnđ)/g, "");

  if (/tr|triệ[u|u?]/.test(s)) {
    const num = parseFloat(s.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return undefined;
    return Math.round(num * 1_000_000);
  }

  if (/k|ngh/i.test(s)) {
    const num = parseFloat(s.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return undefined;
    return Math.round(num * 1_000);
  }

  const cleaned = s.replace(/[.,]/g, "");
  const digits = cleaned.replace(/[^0-9]/g, "");
  if (digits.length > 0) {
    return parseInt(digits, 10);
  }

  return undefined;
}

/** cố gắng trích JSON từ text (fallback nếu model trả text kèm JSON) */
function extractJson(text: string): any | null {
  try {
    // thử parse toàn bộ text
    return JSON.parse(text);
  } catch (e) {
    // fallback: tìm cặp {} lớn nhất (đơn giản) — không hoàn hảo nhưng hữu dụng
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const sub = text.substring(first, last + 1);
      try {
        return JSON.parse(sub);
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

/** loại bỏ field/flag/claim liên quan đến hành động đặt/giữ từ parsed AI */
function sanitizeParsed(parsed: any): any {
  if (!parsed || typeof parsed !== "object") return parsed;

  // xóa các khoá hành động nguy hiểm
  const forbiddenKeys = ["book", "booking", "reserve", "reserved", "confirmed", "status", "hold", "held"];
  for (const k of forbiddenKeys) {
    if (k in parsed) delete parsed[k];
  }

  // nếu có services/combo items bên trong nhưng có cờ "booked" hay "reserved", loại bỏ cờ đó
  const stripBookedFlags = (arr: any[]) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((it) => {
      if (it && typeof it === "object") {
        for (const fk of ["booked", "reserved", "isBooked", "isReserved", "confirmed"]) {
          if (fk in it) delete it[fk];
        }
      }
    });
  };
  if (Array.isArray(parsed.services)) stripBookedFlags(parsed.services);
  if (Array.isArray(parsed.combos)) stripBookedFlags(parsed.combos);

  // sanitize reply: không để câu khẳng định đã thực hiện hành động
  if (typeof parsed.reply === "string") {
    const dangerousPattern = /(đã đặt|đặt thành công|xác nhận đặt|đã giữ|đã được đặt|đã xác nhận|booking confirmed|reserved successfully)/gi;
    if (dangerousPattern.test(parsed.reply)) {
      // Nếu model vô tình khẳng định, sửa lại thành một câu an toàn
      // nếu có tên dịch vụ trong parsed.services[0] thì dùng tên đó, còn không thì dùng từ "gói dịch vụ"
      const selName =
        Array.isArray(parsed.services) && parsed.services.length > 0 && parsed.services[0].name
          ? parsed.services[0].name
          : parsed.criteria?.tag || "gói dịch vụ";
      parsed.reply = `Bạn đã chọn ${selName}. Tôi chỉ gợi ý — vui lòng bấm vào đường dẫn để hoàn tất đặt dịch vụ.`;
    }
  }

  return parsed;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [] } = body;

    // lấy dữ liệu BE
    const resServices = await fetch(SERVICE_URL, { cache: "no-store" });
    const allServices = resServices.ok ? await resServices.json() : [];

    const resCombos = await fetch(COMBO_URL, { cache: "no-store" });
    const allCombos = resCombos.ok ? await resCombos.json() : [];

    // system prompt: nhấn mạnh KHÔNG được đặt/giữ chỗ, chỉ trả JSON mô tả
    const systemContent = `Bạn là AI tư vấn OG Camping. TUYỆT ĐỐI KHÔNG ĐƯỢC ĐẶT HOẶC GIỮ CHỖ cho khách và KHÔNG gọi API nào.
    **BẮT BUỘC**: Chỉ trả 1 **object JSON** duy nhất, KHÔNG kèm text giải thích hay ký tự khác.
    Schema (bắt buộc):
    {
      "type": "service_request" | "combo_request",
      "criteria": { "location"?: "...", "minPrice"?: number, "maxPrice"?: number, "days"?: number, "tag"?: "..." },
      "services": [ { "id": number, "name": "...", "price"?: number, "location"?: "...", "days"?: number } ],
      "combos": [],
      "reply": "..." 
    }
    **Nếu trong reply bạn tham chiếu tới [id N], bạn PHẢI đưa đối tượng tương ứng trong mảng "services" (không được chỉ dùng [id N] trong text).**
    Nếu không chắc, trả: {"type":"service_request","criteria":{},"services":[],"combos":[],"reply":""}
    Ví dụ trả về hợp lệ:
    {"type":"service_request","criteria":{"days":2},"services":[{"id":2,"name":"Camping gia đình cuối tuần","price":1200000}],"combos":[],"reply":"Mình gợi ý 2 gói phù hợp."}`;

    const completion = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemContent },
        {
          role: "system",
          content: `Danh sách gói dịch vụ hiện có: ${JSON.stringify(allServices)}
              Danh sách combo hiện có: ${JSON.stringify(allCombos)}`,
        },
        ...messages.map((m: any) => ({ role: m.type === "user" ? "user" : "assistant", content: m.content })),
      ],
    });

    const aiText = completion.choices?.[0]?.message?.content ?? "";
    console.log("AI RAW TEXT:", aiText);

    // fallback: nếu model trả text có dạng "[id 2]" mà không trả JSON,
    // try extract ids and build services array to return so FE can render cards.
    const idRegex = /\[id\s*([0-9]+)\]/gi;
    const ids = Array.from(aiText.matchAll(idRegex)).map(m => Number(m[1]));

    if (ids.length > 0) {
      // find services by id from allServices
      const matchedServices = (allServices || []).filter((s: any) => ids.includes(Number(s.id)));
      if (matchedServices.length > 0) {
        // prepare reply text: remove the [id N] tokens (or keep, your choice)
        const replyText = aiText.replace(idRegex, "").trim();
        // shape services to the same shape you use later
        const servicesPayload = matchedServices.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          location: s.location,
          days: s.days,
          tag: s.tag,
          averageRating: s.averageRating ?? s.rating ?? 0,
          availability: s.availability ?? [],
          imageUrl: s.imageUrl ?? s.image,
        }));

        return NextResponse.json({ reply: replyText || "Mình gợi ý vài gói phù hợp:", services: servicesPayload, combos: [] });
      }
    }

    // cố gắng parse JSON từ text model trả về
    let parsed: any = extractJson(aiText);

    if (!parsed) {
      // Nếu model không trả JSON hoặc parse fail → trả JSON an toàn rỗng theo schema
      const safeReply = "Xin lỗi, tôi chưa hiểu rõ yêu cầu. Vui lòng cung cấp thêm thông tin (ví dụ: địa điểm, ngân sách, số ngày).";
      return NextResponse.json({ reply: safeReply, services: [], combos: [] });
    }

    // sanitize parsed để loại bỏ mọi hành vi đặt/giữ
    parsed = sanitizeParsed(parsed);

    const criteria = parsed.criteria ?? {};
    const minPrice = parsePrice(criteria.minPrice);
    const maxPrice = parsePrice(criteria.maxPrice);

    let services: any[] = [];
    let combos: any[] = [];
    let reply = parsed.reply ?? "";

    if (parsed.type === "service_request") {
      services = (allServices || []).filter((s: any) => {
        const price = Number(s.price ?? 0);
        const matchPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
        const matchLocation = !criteria.location || (s.location && s.location.toLowerCase().includes(String(criteria.location).toLowerCase()));
        const matchDays = !criteria.days || Number(s.days) === Number(criteria.days);
        const matchTag = !criteria.tag || (s.tag && s.tag.toLowerCase() === String(criteria.tag).toLowerCase());
        return matchPrice && matchLocation && matchDays && matchTag;
      });

      services = services.map((s: any) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        location: s.location,
        days: s.days,
        tag: s.tag,
        averageRating: s.averageRating ?? s.rating ?? 0,
        // giữ nguyên availability nếu BE trả về (FE cần để tính "Còn chỗ")
        availability: s.availability ?? [],
        imageUrl: s.imageUrl ?? s.image,
      }));

      // nếu model không trả reply, tạo default reply an toàn
      if (!reply) {
        reply = services.length > 0 ? `Mình tìm được ${services.length} gói dịch vụ phù hợp.` : "Không có gói dịch vụ nào khớp tiêu chí. Bạn muốn mở rộng tiêu chí?";
      }
    } else if (parsed.type === "combo_request") {
      combos = (allCombos || []).filter((c: any) => {
        const price = Number(c.price ?? 0);
        const matchPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
        const matchLocation = !criteria.location || (c.location && c.location.toLowerCase().includes(String(criteria.location).toLowerCase()));
        const matchDays = !criteria.days || Number(c.days) === Number(criteria.days);
        const matchTag = !criteria.tag || (c.tag && c.tag.toLowerCase() === String(criteria.tag).toLowerCase());
        return matchPrice && matchLocation && matchDays && matchTag;
      });

      combos = combos.map((c: any) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        location: c.location,
        days: c.days,
        tag: c.tag,
        averageRating: c.averageRating ?? c.rating ?? 0,
        availability: c.availability ?? [],
        imageUrl: c.imageUrl ?? c.image,
      }));

      if (!reply) {
        reply = combos.length > 0 ? `Mình tìm được ${combos.length} combo phù hợp.` : "Không có combo nào khớp tiêu chí. Bạn muốn mở rộng tiêu chí?";
      }
    } else {
      // không phải service/combo: trả fallback an toàn (text)
      reply = parsed.reply ?? String(aiText).slice(0, 1000);
    }

    // đảm bảo reply không chứa từ ngữ khẳng định đã đặt (double-check)
    const forbiddenReplyRegex = /(đã đặt|đặt thành công|xác nhận đặt|đã giữ|đã được đặt|đã xác nhận|booking confirmed|reserved successfully)/gi;
    if (forbiddenReplyRegex.test(reply)) {
      reply = reply.replace(forbiddenReplyRegex, "").trim();
      // nếu sau khi xoá bị trống, thay bằng câu an toàn
      if (!reply) {
        reply = "Bạn đã chọn gói. Tôi chỉ gợi ý — vui lòng bấm vào đường dẫn để hoàn tất đặt dịch vụ.";
      } else {
        // thêm câu nhắc an toàn
        reply = `${reply}. Tôi chỉ gợi ý — vui lòng bấm vào đường dẫn để hoàn tất đặt dịch vụ.`;
      }
    }

    // Trả về cho FE: reply (text hiển thị) + arrays để FE render card/link
    return NextResponse.json({ reply, services, combos });
  } catch (error) {
    console.error("Error /api/chat:", error);
    return NextResponse.json({ reply: "Có lỗi xảy ra khi gọi AI." }, { status: 500 });
  }
}
