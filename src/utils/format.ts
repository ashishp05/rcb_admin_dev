// Display helpers. Venue dates and hours are India time (IST), per the API contract.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const rupeeFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: 0 });

export const formatRupees = (amount: number): string => rupeeFormatter.format(amount);

// 19 -> "7 PM", 0 / 24 -> "12 AM"
export const hourLabel = (hour: number): string => {
  const h = hour % 24;
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${h < 12 ? "AM" : "PM"}`;
};

export const slotRange = (startHour: number, hours: number): string => `${hourLabel(startHour)} - ${hourLabel(startHour + hours)}`;

export const hoursText = (hours: number): string => (hours === 1 ? "1 hr" : `${hours} hrs`);

const dateOnly = (date: string) => new Date(`${date}T00:00:00Z`);
const utcFormat = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...options });

// "Mon, 23 Nov"
export const shortDate = (date: string): string => utcFormat({ weekday: "short", day: "numeric", month: "short" }).format(dateOnly(date));
// "Monday, 23 November 2026"
export const longDate = (date: string): string => utcFormat({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(dateOnly(date));
export const weekdayShort = (date: string): string => utcFormat({ weekday: "short" }).format(dateOnly(date));
export const dayOfMonth = (date: string): string => utcFormat({ day: "numeric" }).format(dateOnly(date));
export const monthShort = (date: string): string => utcFormat({ month: "short" }).format(dateOnly(date));

// ISO timestamp -> "23 Nov 2026, 7:15 pm" in IST
export const dateTimeIST = (iso: string | null | undefined): string =>
  iso
    ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso))
    : "—";

// 9876543210 -> "+91 98765 43210"
export const phoneText = (phone: string): string => (phone?.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone);

// Accepts +91 / 0 prefixes and spaces; returns 10 digits.
export const normalizeMobile = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

export const todayIST = (now = new Date()): string => new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

export const addDays = (date: string, days: number): string => new Date(dateOnly(date).getTime() + days * DAY_MS).toISOString().slice(0, 10);

export const dateRange = (from: string, count: number): string[] => Array.from({ length: count }, (_, i) => addDays(from, i));

// Date <-> "YYYY-MM-DD" for the DateInput picker (local calendar date, no timezone shift).
export const toDateString = (value: Date | null | undefined): string =>
  value ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}` : "";
export const fromDateString = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const clock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
