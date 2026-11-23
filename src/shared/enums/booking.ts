import type { BookingChannel, BookingStatus, PaymentKind } from "../../models/booking";

type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

export const BookingStatusLabel: Record<BookingStatus, string> = {
  pending: "Payment pending",
  upcoming: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BookingStatusColor: Record<BookingStatus, ChipColor> = {
  pending: "warning",
  upcoming: "success",
  completed: "primary",
  cancelled: "danger",
};

export const BookingChannelLabel: Record<BookingChannel, string> = {
  self: "Online",
  counter: "Counter",
};

export const PaymentKindLabel: Record<PaymentKind, string> = {
  cash: "Cash",
  upi_qr: "UPI QR",
  credit_card: "Credit card",
  debit_card: "Debit card",
};

export const PaymentRecordColor: Record<string, ChipColor> = {
  created: "default",
  captured: "success",
  failed: "danger",
  refunded: "warning",
};

export const SmsStatusColor: Record<string, ChipColor> = {
  sent: "success",
  simulated: "primary",
  failed: "danger",
};

export const BookingStatusOptions = (Object.keys(BookingStatusLabel) as BookingStatus[]).map((value) => ({ value, label: BookingStatusLabel[value] }));
export const BookingChannelOptions = (Object.keys(BookingChannelLabel) as BookingChannel[]).map((value) => ({ value, label: BookingChannelLabel[value] }));
export const PaymentKindOptions = (Object.keys(PaymentKindLabel) as PaymentKind[]).map((value) => ({ value, label: PaymentKindLabel[value] }));

// Suggested reasons shown when cancelling (match the customer app's list).
export const CancelReasons = ["Team members not available", "Weather", "Booked by mistake", "Found another time", "Other"];
