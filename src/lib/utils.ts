import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { th } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "สวัสดีตอนเช้า";
  if (hour < 17) return "สวัสดีตอนบ่าย";
  if (hour < 20) return "สวัสดีตอนเย็น";
  return "สวัสดีตอนค่ำ";
}

export function formatThaiDate(date: Date): string {
  return format(date, "EEEE, d MMMM", { locale: th });
}

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true, locale: th });
  }
  if (isYesterday(date)) {
    return "เมื่อวาน";
  }
  return format(date, "d MMM", { locale: th });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
