import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DateStrip, SlotGrid } from "../../../components/booking/SlotPicker";
import { Button, Modal, Spinner } from "../../../components/ui";
import type { IBooking } from "../../../models/booking";
import type { ISlotGrid, IVenue } from "../../../models/venue";
import bookingService from "../../../services/booking-service";
import venueService from "../../../services/venue-service";
import { dateRange, hourLabel, hoursText, longDate, slotRange, todayIST } from "../../../utils/format";

interface RescheduleBookingModalProps {
  booking: IBooking;
  openDialog: boolean;
  handleDialogClose: () => void;
  onRescheduled: (booking: IBooking) => void;
}

// Staff can move a booking any time before it starts (no 2-hour cutoff, unlike customers).
const RescheduleBookingModal = ({ booking, openDialog, handleDialogClose, onRescheduled }: RescheduleBookingModalProps) => {
  const today = todayIST();
  const [venue, setVenue] = useState<IVenue | null>(null);
  const [date, setDate] = useState(booking.date);
  const [pitchId, setPitchId] = useState(booking.pitchId);
  const [grid, setGrid] = useState<ISlotGrid | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (openDialog) venueService.getVenue().then((r) => setVenue(r.data)).catch(() => undefined);
  }, [openDialog]);

  useEffect(() => {
    if (!openDialog) return;
    venueService.getSlots(date, pitchId).then((r) => setGrid(r.data)).catch(() => undefined);
  }, [openDialog, date, pitchId]);

  const own = date === booking.date && pitchId === booking.pitchId ? Array.from({ length: booking.hours }, (_, i) => booking.startHour + i) : [];
  const selected = start === null ? [] : Array.from({ length: booking.hours }, (_, i) => start + i);
  const fits =
    start !== null &&
    selected.every((h) => {
      const slot = grid?.slots.find((s) => s.hour === h);
      return slot && (slot.status === "available" || (own.includes(h) && slot.status !== "past"));
    });
  const unchanged = date === booking.date && pitchId === booking.pitchId && start === booking.startHour;

  const save = async () => {
    if (start === null) return;
    setSaving(true);
    await bookingService
      .rescheduleBooking(booking.id, { date, startHour: start, pitchId: pitchId !== booking.pitchId ? pitchId : undefined })
      .then((response) => {
        toast.success(`Moved to ${longDate(response.data.date)}, ${response.data.slotLabel}.`);
        onRescheduled(response.data);
        handleDialogClose();
      })
      .catch(() => undefined)
      .finally(() => setSaving(false));
  };

  return (
    <Modal
      openDialog={openDialog}
      handleDialogClose={handleDialogClose}
      title="Reschedule booking"
      size="3xl"
      backdrop="blur"
      scrollBehavior="inside"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-default-700">
            Same duration ({hoursText(booking.hours)}) and price. Currently {longDate(booking.date)}, {booking.slotLabel}.
          </span>
          <div className="flex gap-2">
            <Button variant="light" onClick={handleDialogClose}>Close</Button>
            <Button color="primary" isLoading={saving} disabled={!fits || unchanged} onClick={save}>
              {start !== null ? `Move to ${slotRange(start, booking.hours)}` : "Pick a start time"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {venue && venue.pitches.length > 1 && (
          <div className="flex gap-1 rounded-xl bg-default-100 p-1">
            {venue.pitches.map((p) => (
              <button key={p.id} type="button" onClick={() => { setPitchId(p.id); setStart(null); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${p.id === pitchId ? "bg-content1 shadow-sm" : "text-default-700"}`}>
                {p.name}
              </button>
            ))}
          </div>
        )}
        {venue && <DateStrip dates={dateRange(today, venue.advanceDays + 1)} value={date} today={today} onChange={(d) => { setDate(d); setStart(null); }} />}
        <p className="text-sm text-default-700">Tap the new start time.</p>
        {grid && grid.date === date && grid.pitchId === pitchId ? <SlotGrid slots={grid.slots} selected={selected} ownHours={own} showPrice={false} onToggle={setStart} /> : <div className="flex justify-center py-8"><Spinner /></div>}
        {start !== null && !fits && (
          <p className="text-sm text-danger">Not enough free back-to-back hours from {hourLabel(start)}. Pick an earlier start or another day.</p>
        )}
      </div>
    </Modal>
  );
};

export default RescheduleBookingModal;
