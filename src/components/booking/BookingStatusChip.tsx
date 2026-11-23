import type { BookingStatus } from "../../models/booking";
import { BookingStatusColor, BookingStatusLabel } from "../../shared/enums/booking";
import { Chip } from "../ui";

const BookingStatusChip = ({ status, size = "sm" }: { status: BookingStatus; size?: "sm" | "md" | "lg" }) => (
  <Chip variant="dot" size={size} color={BookingStatusColor[status]}>
    {BookingStatusLabel[status]}
  </Chip>
);

export default BookingStatusChip;
