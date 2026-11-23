import type { ColumnDef } from "@tanstack/react-table";
import type { IBooking } from "../../models/booking";
import { BookingChannelLabel } from "../../shared/enums/booking";
import { formatRupees, phoneText, shortDate } from "../../utils/format";
import { Chip } from "../ui";
import BookingStatusChip from "./BookingStatusChip";

// Shared TanstackTable columns for booking lists (desk home, all bookings, customer detail).
export const getBookingColumns = (options: { showDate?: boolean; showCustomer?: boolean } = {}): ColumnDef<IBooking>[] => {
  const { showDate = true, showCustomer = true } = options;
  const columns: (ColumnDef<IBooking> | false)[] = [
    {
      accessorKey: "id",
      header: "Booking",
      cell: ({ row }) => <span className="font-mono text-sm font-semibold">{row.original.id}</span>,
    },
    showDate && {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <span className="whitespace-nowrap">{shortDate(row.original.date)}</span>,
    },
    {
      accessorKey: "slotLabel",
      header: "Time",
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.slotLabel}</span>,
    },
    showCustomer && {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="min-w-[140px]">
          <p className="font-medium">{row.original.customerName}</p>
          <p className="text-xs text-default-700">{phoneText(row.original.customerPhone)}</p>
        </div>
      ),
    },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }) => (
        <Chip size="sm" variant="flat" color={row.original.channel === "self" ? "primary" : "default"}>
          {BookingChannelLabel[row.original.channel]}
        </Chip>
      ),
    },
    {
      accessorKey: "paymentMethodLabel",
      header: "Payment",
      cell: ({ row }) => <span className="text-sm">{row.original.paymentMethodLabel ?? "—"}</span>,
    },
    {
      id: "total",
      header: "Amount",
      meta: { align: "right" },
      cell: ({ row }) => <span className="font-semibold">{formatRupees(row.original.price.total)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <BookingStatusChip status={row.original.status} />,
    },
  ];
  return columns.filter(Boolean) as ColumnDef<IBooking>[];
};
