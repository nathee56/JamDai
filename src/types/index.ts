export type NoteCategory =
  | "ความรู้"
  | "การเงิน"
  | "ความทรงจำ"
  | "งาน"
  | "สุขภาพ"
  | "อื่นๆ";

export interface Note {
  id: string;
  userId: string;
  text: string;
  category: NoteCategory;
  imageUrl?: string;
  pinned?: boolean;
  isStarred?: boolean;
  colorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const NOTE_COLORS = [
  { id: "default", bg: "var(--color-surface)", text: "var(--color-text-hi)" },
  { id: "pink", bg: "#3D2030", text: "#F9A8D4" },
  { id: "purple", bg: "#2D1F3D", text: "#C4B5FD" },
  { id: "blue", bg: "#1A2F3D", text: "#93C5FD" },
  { id: "green", bg: "#1A2E1F", text: "#86EFAC" },
  { id: "navy", bg: "#1A1F3D", text: "#A5B4FC" },
  { id: "orange", bg: "#2E1F0A", text: "#FED7AA" },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export const CATEGORY_CONFIG: Record<
  NoteCategory,
  { label: string; borderClass: string; textClass: string; bgClass: string }
> = {
  ความรู้: {
    label: "ความรู้",
    borderClass: "border-blue-800",
    textClass: "text-blue-400",
    bgClass: "bg-blue-950/30",
  },
  การเงิน: {
    label: "การเงิน",
    borderClass: "border-emerald-800",
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-950/30",
  },
  ความทรงจำ: {
    label: "ความทรงจำ",
    borderClass: "border-violet-800",
    textClass: "text-violet-400",
    bgClass: "bg-violet-950/30",
  },
  งาน: {
    label: "งาน",
    borderClass: "border-amber-800",
    textClass: "text-amber-400",
    bgClass: "bg-amber-950/30",
  },
  สุขภาพ: {
    label: "สุขภาพ",
    borderClass: "border-rose-800",
    textClass: "text-rose-400",
    bgClass: "bg-rose-950/30",
  },
  อื่นๆ: {
    label: "อื่นๆ",
    borderClass: "border-zinc-700",
    textClass: "text-zinc-400",
    bgClass: "bg-zinc-900/30",
  },
};
