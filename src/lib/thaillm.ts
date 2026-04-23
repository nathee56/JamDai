import type { Note, ChatMessage, NoteCategory } from "@/types";

function buildSystemPrompt(notes: Note[]): string {
  const notesContext = notes
    .slice(0, 100) // Increase context to 100 notes
    .map(
      (n, i) =>
        `[${i + 1}] (${n.category}) ${n.text.slice(0, 500)}${n.text.length > 500 ? "..." : ""}`
    )
    .join("\n");

  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return `คุณคือ "JamDai AI" (จำได้) ผู้ช่วยจัดการชีวิตและคลังความรู้ส่วนตัว
คุณมีความสามารถในการคิด วิเคราะห์ และแนะนำเชิงรุก (Proactive)

วันนี้วัน${dateStr} เวลา ${timeStr}

กฎการตอบ:
1. ตอบด้วยท่าทางที่เป็นกันเอง เหมือนเพื่อนสนิทที่คอยช่วยเหลือ
2. วิเคราะห์: หากพบข้อมูลที่เกี่ยวข้อง ให้ดึงความเชื่อมโยงจากโน้ตเดิมมาเสริม (เช่น สุขภาพ, การเงิน, หรือพฤติกรรม)
3. แนะนำ: หากเห็นโอกาสในการช่วย เช่น มีนัดหมายที่ถึงกำหนด หรือมีสิ่งที่ต้องทำสำคัญ ให้เสนอตัวช่วยจัดการทันที
4. กระชับแต่ครบถ้วน: ตอบเฉพาะประเด็นที่สำคัญและตรงใจผู้ใช้
5. แสดงขั้นตอนการคิดใน <think> แท็กเสมอ และแสดงเฉพาะคำตอบสุดท้ายด้านนอก
6. หากไม่พบข้อมูลที่เกี่ยวข้อง ให้ตอบไปตามหัวข้อที่แนะนำล่าสุด

ข้อมูลในคลังความรู้ (โน้ต):
${notesContext || "(ยังไม่มีข้อมูลในคลัง)"}`;
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

  const recentNotes = notes.slice(0, 5).map(n => n.text).join("\n");

  try {
    const messages = [
      {
        role: "system",
        content: `คุณคือผู้ช่วยสรุปโน้ต หน้าที่ของคุณคือสรุปภาพรวมโน้ตล่าสุดของผู้ใช้ให้สั้น กระชับ และน่าสนใจ
        
กฎ:
- สรุปเป็นภาษาไทย 1-2 ประโยคเท่านั้น
- เน้นภาพรวมว่าช่วงนี้ผู้ใช้ทำอะไรหรือกังวลเรื่องอะไร
- ห้ามตอบว่า "ไม่มีโน้ต" เพราะระบบจะส่งโน้ตมาให้เสมอ`
      },
      { role: "user", content: `โน้ตล่าสุด:\n${recentNotes}` }
    ];

    return await callAI(messages, 0.5, 150);
  } catch {
    return "ช่วงนี้คุณมีการบันทึกเรื่อง " + notes[0].category + " เป็นส่วนใหญ่";
  }
}
