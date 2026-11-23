import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Button, Input, Modal } from "../../../components/ui";
import type { IBooking, ICancelBookingModel } from "../../../models/booking";
import bookingService from "../../../services/booking-service";
import { CancelReasons } from "../../../shared/enums/booking";
import { formatRupees } from "../../../utils/format";
import { CancelBookingValidationSchema } from "../../../validation/booking";
import FormAlert from "../../account/components/FormAlert";

interface CancelBookingModalProps {
  booking: IBooking;
  openDialog: boolean;
  handleDialogClose: () => void;
  onCancelled: (booking: IBooking) => void;
}

// Hours until an IST slot starts.
const hoursUntilStart = (b: IBooking) =>
  (new Date(`${b.date}T00:00:00+05:30`).getTime() + b.startHour * 3600_000 - Date.now()) / 3600_000;

const policyText = (b: IBooking) => {
  if (b.status === "pending") return "Nothing has been paid for this booking, so there is no refund.";
  const h = hoursUntilStart(b);
  const tier = h >= 24 ? "100%" : h >= 6 ? "50%" : "no";
  return `By policy this cancellation gets ${tier} refund (${h >= 24 ? "24+" : h >= 6 ? "6–24" : "under 6"} hours before start). Leave the amount empty to apply the policy.`;
};

const CancelBookingModal = ({ booking, openDialog, handleDialogClose, onCancelled }: CancelBookingModalProps) => {
  const paid = booking.status === "upcoming" ? booking.price.total : 0;

  const handleSubmit = async (values: ICancelBookingModel) => {
    await bookingService
      .cancelBooking(booking.id, {
        reason: values.reason.trim() || undefined,
        refundAmount: values.refundAmount === "" ? undefined : Number(values.refundAmount),
      })
      .then((response) => {
        const refund = response.data.refundAmount;
        toast.success(refund ? `Booking cancelled. ${formatRupees(refund)} refund recorded.` : "Booking cancelled.");
        onCancelled(response.data);
        handleDialogClose();
      })
      .catch(() => undefined);
  };

  return (
    <Modal openDialog={openDialog} handleDialogClose={handleDialogClose} title={`Cancel booking ${booking.id}?`} size="lg" backdrop="blur">
      <Formik initialValues={{ reason: CancelReasons[0], refundAmount: "" }} onSubmit={handleSubmit} validationSchema={CancelBookingValidationSchema(paid)}>
        {({ values, setFieldValue, isSubmitting }) => (
          <Form noValidate className="space-y-4">
            <FormAlert tone={booking.status === "upcoming" ? "warning" : "info"}>{policyText(booking)}</FormAlert>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Reason</p>
              <div className="flex flex-wrap gap-2">
                {CancelReasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    aria-pressed={values.reason === reason}
                    onClick={() => setFieldValue("reason", reason)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${values.reason === reason ? "border-primary bg-primary text-primary-foreground" : "border-default-300 hover:border-primary"}`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
            <Field name="reason" label="Reason shown on the booking" labelPlacement="outside" placeholder="Optional" component={Input} />
            {paid > 0 && (
              <Field
                name="refundAmount"
                type="number"
                label={`Refund amount (optional, max ${formatRupees(paid)})`}
                labelPlacement="outside"
                placeholder="Leave empty for the policy amount"
                startContent={<span className="text-sm text-default-700">₹</span>}
                component={Input}
              />
            )}
            <p className="text-xs text-default-700">
              {booking.paymentKind && booking.paymentKind !== "cash"
                ? "Online payments are refunded automatically through Razorpay."
                : "Cash refunds are recorded only. Hand the cash back at the counter."}
            </p>
            <div className="flex justify-end gap-2 border-t border-default-100 pt-4">
              <Button variant="light" onClick={handleDialogClose}>
                Keep booking
              </Button>
              <Button type="submit" color="danger" isLoading={isSubmitting}>
                Cancel booking
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CancelBookingModal;
