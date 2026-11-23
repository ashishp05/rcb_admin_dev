import * as Yup from "yup";
import messages from "../../shared/constants/messages";
import { RegularExpression } from "../../shared/constants/regular-expression";
import { normalizeMobile } from "../../utils/format";

export const WalkInValidationSchema = Yup.object({
  customerName: Yup.string().trim().required("Enter the customer name").min(2, "Name must be at least 2 characters").max(80),
  customerPhone: Yup.string()
    .required("Enter the mobile number")
    .test("mobile", messages.InvalidMobile, (value) => RegularExpression.IndianMobile.test(normalizeMobile(value ?? ""))),
  players: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Enter a number")
    .integer("Enter a whole number")
    .min(1, "At least 1")
    .max(30, "At most 30"),
  notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
  paymentKind: Yup.string().oneOf(["cash", "upi_qr", "credit_card", "debit_card"]).required(),
  paymentMethodLabel: Yup.string().max(60),
});

export const CancelBookingValidationSchema = (maxRefund: number) =>
  Yup.object({
    reason: Yup.string().max(300),
    refundAmount: Yup.number()
      .transform((value, original) => (original === "" ? undefined : value))
      .typeError("Enter an amount")
      .min(0, "Cannot be negative")
      .max(maxRefund, `Cannot exceed the amount paid (₹${maxRefund})`),
  });
