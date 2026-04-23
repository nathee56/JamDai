import type { Note, ChatMessage, NoteCategory } from "@/types";

function buildSystemPrompt(notes: Note[]): string {
  const notesContext = notes
    .slice(0, 100)
    .map(
      (n, i) =>
        `[${i + 1}] (${n.category}) ${n.text.slice(0, 500)}${n.text.length > 500 ? "..." : ""}`
    )
    .join("\n");

  return `คุณคือ JamDai AI — ผู้ช่วยความจำส่วนตัวของผู้ใช้

กฎการตอบ (สำคัญมาก):
1. ตอบเป็นภาษาไทยที่เป็นธรรมชาติ อ่านง่าย ไม่เป็นทางการเกินไป
2. แบ่งวรรคตอนให้ชัดเจน — ถ้าตอบยาวให้ขึ้นบรรทัดใหม่ทุก 2-3 ประโยค
3. ถ้ามีหลายข้อให้ใช้ - หรือตัวเลข นำหน้า อ่านง่ายกว่าพิมพ์ติดกัน
4. ห้ามใช้ ** ** หรือ markdown format ในการตอบ — ใช้ภาษาพูดธรรมดา
5. ถ้าไม่พบข้อมูลในโน้ต ให้บอกตรงๆ ว่าไม่พบ ไม่ต้องแต่งเรื่อง
6. ตอบกระชับ ตรงประเด็น ไม่ต้องมีคำทักทายซ้ำทุกครั้ง
7. ถ้าผู้ใช้ถามเรื่องที่ไม่เกี่ยวกับโน้ต ให้ช่วยตอบได้ แต่บอกว่าไม่ได้มาจากโน้ต

context โน้ตของผู้ใช้:
${notesContext || "(ยังไม่มีข้อมูล)"}`;
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
    return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim() || "ไม่สามารถตอบได้ในขณะนี้";
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
        content: `คุณคือผู้ช่วยจัดการหมวดหมู่โน้ต เลือกเพียง 1 หมวดหมู่จากรายการดังนี้: ความรู้, การเงิน, ความทรงจำ, งาน, สุขภาพ, อื่นๆ
        
กฎ: 
- ตอบมาแค่ชื่อหมวดหมู่ที่เหมาะสมที่สุดเพียงคำเดียวเท่านั้น`
      },
      { role: "user", content: `ข้อความ: ${text}` }
    ];

    const result = await callAI(messages, 0.1, 100);
    const matched = categories.find(c => result.includes(c));
    return matched || "อื่นๆ";
  } catch {
    return "อื่นๆ";
  }
}

export async function detectReminders(text: string): Promise<{ date?: string; time?: string; suggestion: string } | null> {
  try {
    const messages = [
      {
        role: "system",
        content: `คุณคือ AI ตรวจจับวันเวลาในข้อความภาษาไทย
        
หน้าที่: ถ้าพบการอ้างถึงวันหรือเวลาในข้อความ ให้ดึงข้อมูลออกมาในรูปแบบ JSON
ถ้าไม่พบวันเวลาที่ชัดเจน ให้ตอบว่า "null"

ตัวอย่างคำตอบ:
{"date": "2024-04-24", "time": "10:00", "suggestion": "นัดหมอพรุ่งนี้ 10 โมง"}

กฎ:
- วันที่ต้องเป็นรูปแบบ YYYY-MM-DD
- เวลาต้องเป็นรูปแบบ HH:mm
- ตอบแค่ JSON หรือคำว่า null เท่านั้น ห้ามมีคำอธิบายอื่น`
      },
      { role: "user", content: `ข้อความ: ${text}\n(วันนี้คือวันที่: ${new Date().toISOString().split('T')[0]})` }
    ];

    const result = await callAI(messages, 0.1, 100);
    if (result.toLowerCase().includes("null")) return null;
    
    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function generateSuggestions(notes: Note[]): Promise<string[]> {
  if (notes.length === 0) {
    return ["วิธีจดโน้ตให้มีประสิทธิภาพ", "ช่วงนี้ฉันควรทำอะไรดี?", "สรุปโน้ตล่าสุดให้หน่อย"];
  }

  const context = notes.slice(0, 10).map(n => `- ${n.text}`).join("\n");
  
  try {
    const messages = [
      {
        role: "system",
        content: `คุณคือผู้ช่วยส่วนตัว หน้าที่ของคุณคือสร้าง "คำถามแนะนำ 3 ข้อ" ที่ผู้ใช้น่าจะอยากถาม AI โดยอ้างอิงจากโน้ตล่าสุดของพวกเขา
        
กฎ:
- สร้างคำถามที่น่าสนใจและเป็นประโยชน์ 3 ข้อ
- คำถามต้องสั้น กระชับ (ไม่เกิน 10-15 คำต่อข้อ)
- ตอบเฉพาะคำถาม 3 ข้อ แยกบรรทัดกัน ห้ามมีเลขข้อหรือคำอธิบายอื่น
- ถ้าโน้ตมีน้อย ให้แนะนำคำถามเกี่ยวกับการเริ่มต้นใช้งาน`
      },
      { role: "user", content: `โน้ตล่าสุดของผู้ใช้:\n${context}` }
    ];

    const result = await callAI(messages, 0.7, 150);
    return result.split("\n").filter(q => q.trim()).slice(0, 3);
  } catch {
    return ["สรุปโน้ตสัปดาห์นี้ให้หน่อย", "มีนัดสำคัญอะไรบ้างไหม?", "แนะนำการดูแลสุขภาพตามโน้ตของฉัน"];
  }
}

export async function summarizeNotes(notes: Note[]): Promise<string> {
  if (notes.length === 0) return "เริ่มต้นจดบันทึกเพื่อดูสรุปจาก AI ของคุณ";

  const recentNotes = notes.slice(0, 5).map(n => `- (${n.category}) ${n.text}`).join("\n");

  try {
    const messages = [
      {
        role: "system",
        content: `คุณคือ JamDai AI ผู้ช่วยสรุปโน้ต

กฎการตอบ:
- สรุปเป็นภาษาไทย 2-3 ประโยคสั้นๆ อ่านได้ใน 5 วินาที
- ห้ามใช้ ** ** หรือ markdown format — ใช้ภาษาพูดธรรมดา
- เน้นภาพรวมว่าช่วงนี้ผู้ใช้ทำอะไรหรือกังวลเรื่องอะไร
- ตอบกระชับ ตรงประเด็น`
      },
      { role: "user", content: `โน้ตล่าสุด:\n${recentNotes}` }
    ];

    return await callAI(messages, 0.5, 150);
  } catch {
    return "ช่วงนี้คุณมีการบันทึกเรื่อง " + notes[0].category + " เป็นส่วนใหญ่";
  }
}
