import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FiCreditCard, FiDollarSign, FiXCircle } from "react-icons/fi";
import { MdOutlineQrCode2 } from "react-icons/md";
import { toast } from "react-toastify";
import type { IBooking, IPaymentOrder, PaymentKind } from "../../models/booking";
import bookingService from "../../services/booking-service";
import messages from "../../shared/constants/messages";
import { PaymentKindLabel } from "../../shared/enums/booking";
import { clock, formatRupees } from "../../utils/format";
import { useSecondsLeft } from "../../utils/useSecondsLeft";
import FormAlert from "../../pages/account/components/FormAlert";
import { Button, Card, CardBody, Input, Modal } from "../ui";

interface PaymentPanelProps {
  booking: IBooking;
  initialOrder?: IPaymentOrder | null;
  onDone: (booking: IBooking) => void;
}

const kinds: { id: PaymentKind; icon: typeof FiDollarSign }[] = [
  { id: "upi_qr", icon: MdOutlineQrCode2 },
  { id: "cash", icon: FiDollarSign },
  { id: "credit_card", icon: FiCreditCard },
  { id: "debit_card", icon: FiCreditCard },
];

// Finishes a pending counter booking: UPI QR, cash, card swipe, or a failure that frees the slot.
const PaymentPanel = ({ booking, initialOrder, onDone }: PaymentPanelProps) => {
  const [kind, setKind] = useState<PaymentKind>(booking.paymentKind ?? "upi_qr");
  const [order, setOrder] = useState<IPaymentOrder | null>(initialOrder ?? null);
  const [cardLabel, setCardLabel] = useState("");
  const [busy, setBusy] = useState<"order" | "paid" | "failed" | null>(null);
  const [failOpen, setFailOpen] = useState(false);
  const [failReason, setFailReason] = useState("Card declined");
  const secondsLeft = useSecondsLeft(booking.expiresAt);
  const isCard = kind === "credit_card" || kind === "debit_card";

  const showQr = async () => {
    setBusy("order");
    await bookingService
      .createPaymentOrder(booking.id, "upi_qr")
      .then((response) => setOrder(response.data))
      .catch(() => undefined)
      .finally(() => setBusy(null));
  };

  const confirmPaid = async () => {
    setBusy("paid");
    const label = kind === "cash" ? "Cash" : kind === "upi_qr" ? "UPI QR" : cardLabel.trim() || undefined;
    await bookingService
      .markPaid(booking.id, { paymentKind: kind, paymentMethodLabel: label })
      .then((response) => {
        toast.success(`Booking ${response.data.id} confirmed. SMS sent to the customer.`);
        onDone(response.data);
      })
      .catch(() => undefined)
      .finally(() => setBusy(null));
  };

  const markFailed = async () => {
    setBusy("failed");
    await bookingService
      .markPaymentFailed(booking.id, failReason.trim() || undefined)
      .then((response) => {
        setFailOpen(false);
        toast.info("Payment marked failed. The slot is free again.");
        onDone(response.data);
      })
      .catch(() => undefined)
      .finally(() => setBusy(null));
  };

  const expired = secondsLeft === 0;

  return (
    <Card shadow="sm" fullWidth className="border-2 border-warning-200 dark:border-warning-800">
      <CardBody className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Collect payment · {formatRupees(booking.price.total)}</h2>
            <p className="text-sm text-default-700">The slot is held until you confirm the payment or mark it failed.</p>
          </div>
          {secondsLeft !== null && (
            <span className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${secondsLeft < 180 ? "bg-danger-50 text-danger-700" : "bg-warning-50 text-warning-800"}`}>
              {expired ? "Hold expired" : `Releases in ${clock(secondsLeft)}`}
            </span>
          )}
        </div>

        {expired && <FormAlert tone="warning">The 15-minute payment window has passed, so the slot may be released any moment. Confirm now if the customer has paid.</FormAlert>}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Payment method">
          {kinds.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={kind === id}
              onClick={() => setKind(id)}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${kind === id ? "border-primary bg-primary-50 text-primary-800 dark:text-primary-800" : "border-default-200 hover:border-primary"}`}
            >
              <Icon className="h-4 w-4" aria-hidden /> {PaymentKindLabel[id]}
            </button>
          ))}
        </div>

        {kind === "upi_qr" && (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-default-50 p-4 text-center">
            {order?.qrString ? (
              <>
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <QRCodeSVG value={order.qrString} size={200} />
                </div>
                <p className="text-sm text-default-700">Customer scans with any UPI app. Confirm once the money shows in your account.</p>
              </>
            ) : order ? (
              <FormAlert tone="warning">
                {order.mock
                  ? "Test mode: Razorpay keys are not set on the server, so this is a simulated UPI payment."
                  : "No UPI ID (UPI_VPA) is configured on the server, so no QR can be shown."}{" "}
                Collect {formatRupees(booking.price.total)}, then use the buttons below.
              </FormAlert>
            ) : (
              <Button variant="bordered" isLoading={busy === "order"} startContent={<MdOutlineQrCode2 className="h-5 w-5" />} onClick={showQr}>
                Show UPI QR
              </Button>
            )}
          </div>
        )}

        {kind === "cash" && <FormAlert>Collect {formatRupees(booking.price.total)} in cash before confirming.</FormAlert>}

        {isCard && (
          <Input label="Card / bank (optional)" labelPlacement="outside" placeholder="e.g. Card - HDFC" value={cardLabel} maxLength={60} onChange={(e) => setCardLabel(e.target.value)} />
        )}

        <div className="flex flex-wrap gap-2">
          <Button color="primary" isLoading={busy === "paid"} disabled={!!busy && busy !== "paid"} onClick={confirmPaid}>
            {kind === "cash"
              ? "Collect cash & confirm"
              : isCard
                ? `Confirm ${kind === "credit_card" ? "credit" : "debit"} card payment`
                : order?.mock
                  ? "Simulate success"
                  : "Payment received — confirm"}
          </Button>
          <Button color="danger" variant="bordered" startContent={<FiXCircle className="h-4 w-4" />} disabled={!!busy} onClick={() => { setFailReason(isCard ? "Card declined" : "Payment failed"); setFailOpen(true); }}>
            {isCard ? "Card declined" : order?.mock ? "Simulate failure" : "Payment failed"}
          </Button>
        </div>
      </CardBody>

      <Modal
        openDialog={failOpen}
        handleDialogClose={() => setFailOpen(false)}
        title="Mark payment as failed?"
        size="md"
        backdrop="blur"
        primaryActionText={busy === "failed" ? "Saving…" : "Mark failed"}
        primaryButtonColor="danger"
        onPrimaryAction={markFailed}
        secondaryActionText="Back"
        onSecondaryAction={() => setFailOpen(false)}
      >
        <div className="space-y-3">
          <p className="text-sm text-default-700">{messages.PaymentFailedConfirm}</p>
          <Input label="Reason (optional)" labelPlacement="outside" placeholder="e.g. Card declined" value={failReason} maxLength={300} onChange={(e) => setFailReason(e.target.value)} />
        </div>
      </Modal>
    </Card>
  );
};

export default PaymentPanel;
