import { useCallback, useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FiCalendar, FiCopy, FiXCircle } from "react-icons/fi";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import BookingStatusChip from "../../components/booking/BookingStatusChip";
import PaymentPanel from "../../components/booking/PaymentPanel";
import PriceSummary from "../../components/booking/PriceSummary";
import { Button, Card, CardBody, Chip, Skeleton } from "../../components/ui";
import type { IBookingDetail } from "../../models/booking";
import { Routing } from "../../routes/routing";
import bookingService from "../../services/booking-service";
import { BookingChannelLabel, PaymentKindLabel, PaymentRecordColor, SmsStatusColor } from "../../shared/enums/booking";
import { dateTimeIST, formatRupees, hoursText, longDate, phoneText } from "../../utils/format";
import CancelBookingModal from "./components/CancelBookingModal";
import RescheduleBookingModal from "./components/RescheduleBookingModal";

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <span className="text-default-700">{label}</span>
    <span className="text-right font-medium text-foreground">{children}</span>
  </div>
);

const BookingDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const id = (location.state as { id?: string } | null)?.id ?? params.get("id") ?? "";
  const [booking, setBooking] = useState<IBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const getBooking = useCallback(async () => {
    if (!id) return;
    await bookingService
      .getBookingDetails(id)
      .then((response) => setBooking(response.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getBooking();
  }, [getBooking]);

  if (!id) {
    return (
      <section className="py-20 text-center">
        <p className="text-default-700">No booking selected.</p>
        <Link to={Routing.AllBookings} className="font-semibold text-primary hover:underline">Go to all bookings</Link>
      </section>
    );
  }

  if (loading || !booking) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </section>
    );
  }

  const b = booking;
  const active = b.status === "upcoming" || b.status === "pending";

  return (
    <section className="space-y-5">
      <button type="button" onClick={() => navigate(Routing.AllBookings)} className="inline-flex items-center gap-2 text-sm font-medium text-default-700 hover:text-primary">
        <FaChevronLeft className="h-3 w-3" aria-hidden /> All bookings
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground">{b.id}</h1>
            <BookingStatusChip status={b.status} size="md" />
            <Chip size="sm" variant="flat" color={b.channel === "self" ? "primary" : "default"}>{BookingChannelLabel[b.channel]}</Chip>
          </div>
          <p className="mt-1 text-default-700">
            {longDate(b.date)} · <strong className="text-foreground">{b.slotLabel}</strong> · {hoursText(b.hours)} · {b.pitchName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="bordered" startContent={<FiCopy className="h-4 w-4" />} onClick={() => navigator.clipboard.writeText(b.id).then(() => toast.success("Booking ID copied"))}>
            Copy ID
          </Button>
          {b.status === "upcoming" && (
            <Button size="sm" variant="bordered" startContent={<FiCalendar className="h-4 w-4" />} onClick={() => setMoveOpen(true)}>
              Reschedule
            </Button>
          )}
          {active && (
            <Button size="sm" color="danger" variant="bordered" startContent={<FiXCircle className="h-4 w-4" />} onClick={() => setCancelOpen(true)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {b.status === "pending" && <PaymentPanel booking={b} onDone={() => getBooking()} />}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card shadow="sm" fullWidth>
          <CardBody className="p-5">
            <h2 className="mb-2 font-semibold text-foreground">Customer</h2>
            <Row label="Name">{b.customerName}</Row>
            <Row label="Mobile">
              <a className="text-primary hover:underline" href={`tel:+91${b.customerPhone}`}>{phoneText(b.customerPhone)}</a>
            </Row>
            {b.players && <Row label="Players">{b.players}</Row>}
            {b.notes && <Row label="Notes">{b.notes}</Row>}
            <Link to={Routing.CustomerDetails} state={{ phone: b.customerPhone }} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
              View customer history
            </Link>
          </CardBody>
        </Card>

        <Card shadow="sm" fullWidth>
          <CardBody className="p-5">
            <h2 className="mb-2 font-semibold text-foreground">Booking</h2>
            <Row label="Booked on">{dateTimeIST(b.createdAt)}</Row>
            <Row label="Taken by">{b.channel === "counter" ? (b.staff?.name ?? "Staff") : "Customer (online)"}</Row>
            <Row label="Payment">{b.paymentMethodLabel ?? (b.paymentKind ? PaymentKindLabel[b.paymentKind] : "—")}</Row>
            {b.confirmedAt && <Row label="Confirmed">{dateTimeIST(b.confirmedAt)}</Row>}
            {b.status === "pending" && b.expiresAt && <Row label="Releases at">{dateTimeIST(b.expiresAt)}</Row>}
            {b.cancelledAt && <Row label="Cancelled">{dateTimeIST(b.cancelledAt)}</Row>}
            {b.cancelReason && <Row label="Reason">{b.cancelReason}</Row>}
            {b.status === "cancelled" && <Row label="Refund">{b.refundAmount ? formatRupees(b.refundAmount) : "None"}</Row>}
          </CardBody>
        </Card>

        <Card shadow="sm" fullWidth>
          <CardBody className="p-5">
            <h2 className="mb-2 font-semibold text-foreground">Price</h2>
            <PriceSummary price={b.price} />
          </CardBody>
        </Card>
      </div>

      <Card shadow="sm" fullWidth>
        <CardBody className="p-5">
          <h2 className="mb-3 font-semibold text-foreground">Online payments</h2>
          {b.payments.length === 0 ? (
            <p className="text-sm text-default-700">{b.paymentKind === "cash" ? "Paid in cash at the counter." : "No payment orders yet."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-default-700">
                    <th className="py-2 pr-4">Order</th><th className="py-2 pr-4">Payment</th><th className="py-2 pr-4">Method</th><th className="py-2 pr-4 text-right">Amount</th><th className="py-2 pr-4">Status</th><th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {b.payments.map((p) => (
                    <tr key={p.id} className="border-t border-default-100">
                      <td className="py-2 pr-4 font-mono text-xs">{p.orderId}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{p.paymentId ?? "—"}</td>
                      <td className="py-2 pr-4">{PaymentKindLabel[p.method as keyof typeof PaymentKindLabel] ?? p.method}</td>
                      <td className="py-2 pr-4 text-right font-semibold">{formatRupees(p.amount)}</td>
                      <td className="py-2 pr-4"><Chip size="sm" variant="flat" color={PaymentRecordColor[p.status]}>{p.status}</Chip></td>
                      <td className="py-2 whitespace-nowrap">{dateTimeIST(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card shadow="sm" fullWidth>
        <CardBody className="p-5">
          <h2 className="mb-3 font-semibold text-foreground">SMS sent</h2>
          {b.sms.length === 0 ? (
            <p className="text-sm text-default-700">No SMS yet. Messages go out when the booking is confirmed.</p>
          ) : (
            <ul className="space-y-3">
              {b.sms.map((m) => (
                <li key={m.id} className="rounded-xl bg-default-50 p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-default-700">
                    <Chip size="sm" variant="flat" color={m.recipient === "admin" ? "secondary" : "primary"}>{m.recipient}</Chip>
                    <span>{phoneText(m.toPhone)}</span>
                    <Chip size="sm" variant="dot" color={SmsStatusColor[m.status]}>{m.status}</Chip>
                    <span className="ml-auto">{dateTimeIST(m.sentAt)}</span>
                  </div>
                  <p className="text-sm text-foreground">{m.body}</p>
                  {m.error && <p className="mt-1 text-xs text-danger">{m.error}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {cancelOpen && <CancelBookingModal booking={b} openDialog handleDialogClose={() => setCancelOpen(false)} onCancelled={() => getBooking()} />}
      {moveOpen && <RescheduleBookingModal booking={b} openDialog handleDialogClose={() => setMoveOpen(false)} onRescheduled={() => getBooking()} />}
    </section>
  );
};

export default BookingDetails;
