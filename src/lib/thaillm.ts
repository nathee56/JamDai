import type { Note, ChatMessage, NoteCategory } from "@/types";

function buildSystemPrompt(notes: Note[]): string {
  const notesContext = notes
    .slice(0, 50)
    .map(
      (n, i) =>
        `[${i + 1}] (${n.category}) ${n.text.slice(0, 200)}${n.text.length > 200 ? "..." : ""}`
    )
    .join("\n");

  return `คุณคือ JamDai AI ผู้ช่วยความจำส่วนตัว คุณช่วยตอบคำถามเกี่ยวกับโน้ตที่ผู้ใช้บันทึกไว้

กฎ:
- ตอบเป็นภาษาไทยเสมอ
- ถ้าไม่มีข้อมูลในโน้ต ให้บอกว่าไม่พบ
- ตอบกระชับ ตรงประเด็น
- ห้ามแสดงขั้นตอนการคิดหรือแท็ก <think> โดยเด็ดขาด ให้แสดงเฉพาะคำตอบสุดท้ายเท่านั้น
- ใช้ข้อมูลจากโน้ตด้านล่างในการตอบ

โน้ตของผู้ใช้:
${notesContext || "(ยังไม่มีโน้ต)"}`;
}

async function callAI(
  messages: { role: string; content: string }[],
  temperature = 0.3,
  max_tokens = 2048
): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, temperature, max_tokens }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Strip <think>...</think> tags if they exist
    return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim() || "ขออภัย ไม่สามารถตอบได้ในตอนนี้";
  } catch (error) {
    console.error("AI call failed:", error);
    throw error;
  }
}

export async function sendMessage(
  message: string,
  history: ChatMessage[],
  notes: Note[]
): Promise<string> {
  try {
    const messages = [
      { role: "system", content: buildSystemPrompt(notes) },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    return await callAI(messages, 0.7, 1024);
  } catch {
    return "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง";
  }
}

export async function categorizeNote(text: string): Promise<NoteCategory> {
  const categories: NoteCategory[] = ["ความรู้", "การเงิน", "ความทรงจำ", "งาน", "สุขภาพ", "อื่นๆ"];

  try {
    const messages = [
      {
        role: "system",
        content: `คุณมีหน้าที่วิเคราะห์และจัดหมวดหมู่ข้อความสั้นๆ โดยเลือกเพียง 1 หมวดหมู่จากตัวเลือกดังนี้: ความรู้, การเงิน, ความทรงจำ, งาน, สุขภาพ, อื่นๆ
        
กฎ: 
- ตอบมาแค่ชื่อหมวดหมู่ที่เหมาะสมที่สุดเพียงคำเดียวเท่านั้น ห้ามมีข้อความอื่นเด็ดขาด
- ถ้าไม่ตรงกับอะไรเลย ให้ตอบว่า "อื่นๆ"`,
      },
      { role: "user", content: text },
    ];

    const result = await callAI(messages, 0.1, 10);
    const cleaned = result.trim();

    // Direct match
    if (categories.includes(cleaned as NoteCategory)) {
      return cleaned as NoteCategory;
    }

    // Partial match
    for (const cat of categories) {
      if (cleaned.includes(cat)) return cat;
    }

    return "อื่นๆ";
  } catch {
    // Fallback: simple keyword matching
    const lowerMsg = text.toLowerCase();
    if (lowerMsg.includes("เงิน") || lowerMsg.includes("จ่าย") || lowerMsg.includes("ซื้อ") || lowerMsg.includes("บาท")) return "การเงิน";
    if (lowerMsg.includes("งาน") || lowerMsg.includes("ประชุม") || lowerMsg.includes("โปรเจกต์")) return "งาน";
    if (lowerMsg.includes("ออกกำลัง") || lowerMsg.includes("สุขภาพ") || lowerMsg.includes("ป่วย") || lowerMsg.includes("หมอ")) return "สุขภาพ";
    if (lowerMsg.includes("รู้") || lowerMsg.includes("เรียน") || lowerMsg.includes("อ่าน")) return "ความรู้";
    if (lowerMsg.includes("จำ") || lowerMsg.includes("เที่ยว") || lowerMsg.includes("วันนั้น")) return "ความทรงจำ";
    return "อื่นๆ";
  }
}
