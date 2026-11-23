import type { ISlot } from "../../models/venue";
import { dayOfMonth, formatRupees, hourLabel, monthShort, weekdayShort } from "../../utils/format";

interface DateStripProps {
  dates: string[];
  value: string;
  today: string;
  onChange: (date: string) => void;
}

export const DateStrip = ({ dates, value, today, onChange }: DateStripProps) => (
  <div className="flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:thin]" role="group" aria-label="Choose a date">
    {dates.map((date) => {
      const selected = date === value;
      return (
        <button
          key={date}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(date)}
          className={`flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 transition-colors ${selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-default-300 bg-content1 text-foreground hover:border-primary"
            }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${selected ? "text-white/80" : "text-default-700"}`}>
            {date === today ? "Today" : weekdayShort(date)}
          </span>
          <span className="font-display text-2xl font-bold leading-none">{dayOfMonth(date)}</span>
          <span className={`text-[11px] ${selected ? "text-white/75" : "text-default-600"}`}>{monthShort(date)}</span>
        </button>
      );
    })}
  </div>
);

const statusText: Record<ISlot["status"], string> = {
  available: "Available",
  booked: "Booked",
  held: "Being booked",
  past: "Passed",
};

const parts = [
  { title: "Night · 12 AM – 6 AM", from: 0, to: 6 },
  { title: "Morning · 6 AM – 12 PM", from: 6, to: 12 },
  { title: "Afternoon · 12 PM – 5 PM", from: 12, to: 17 },
  { title: "Evening · 5 PM – 12 AM", from: 17, to: 24 },
];

interface SlotGridProps {
  slots: ISlot[];
  selected: number[];
  onToggle: (hour: number) => void;
  // A booking's own hours (reschedule): shown as free for that booking.
  ownHours?: number[];
  showPrice?: boolean;
}

export const SlotGrid = ({ slots, selected, onToggle, ownHours = [], showPrice = true }: SlotGridProps) => {
  const sections = parts
    .map((part) => ({ ...part, slots: slots.filter((s) => s.hour >= part.from && s.hour < part.to) }))
    .filter((part) => part.slots.some((s) => s.status !== "past"));

  if (sections.length === 0) {
    return <p className="py-8 text-center text-sm text-default-700">All slots on this day have passed.</p>;
  }

  return (
    <div className="space-y-4">
      {sections.map((part) => (
        <div key={part.title}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-default-700">{part.title}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
            {part.slots.map((slot) => {
              const own = ownHours.includes(slot.hour) && slot.status !== "past";
              const free = slot.status === "available" || own;
              const isSelected = selected.includes(slot.hour);
              return (
                <button
                  key={slot.hour}
                  type="button"
                  disabled={!free}
                  aria-pressed={isSelected}
                  aria-label={`${slot.label}, ${own ? "current slot" : statusText[slot.status]}`}
                  onClick={() => onToggle(slot.hour)}
                  className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors ${isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : free
                      ? "border-default-300 bg-content1 hover:border-primary"
                      : "cursor-not-allowed border-dashed border-default-300 bg-default-50 opacity-60"
                    }`}
                >
                  <span className="text-sm font-bold">{hourLabel(slot.hour)}</span>
                  <span
                    className={`text-xs ${isSelected
                      ? "text-white/80"
                      : slot.status === "booked" && !own
                        ? "text-danger"
                        : slot.status === "held" && !own
                          ? "text-warning-700"
                          : "text-default-700"
                      }`}
                  >
                    {own ? "Current slot" : free ? (showPrice ? formatRupees(slot.price) : "Available") : statusText[slot.status]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SlotLegend = () => (
  <div className="flex flex-wrap gap-4 text-xs text-default-700" aria-hidden>
    <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-default-300 bg-content1" /> Available</span>
    <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-primary" /> Selected</span>
    <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-dashed border-default-400" /> Booked / being booked</span>
  </div>
);
