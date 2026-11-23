import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import { FaSearch } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TanstackTable } from "../../components/custom-table/TanstackTable";
import { Card, CardBody, Chip, Input, SelectDropdown } from "../../components/ui";
import type { Pagination } from "../../models/base-type";
import type { ISmsMessage } from "../../models/sms";
import { Routing } from "../../routes/routing";
import smsService from "../../services/sms-service";
import { PAGINATION } from "../../shared/constants/pagination";
import { SmsStatusColor } from "../../shared/enums/booking";
import { handleTableLoader } from "../../store/slices/generalSlice";
import { dateTimeIST, phoneText } from "../../utils/format";
import FormAlert from "../account/components/FormAlert";

interface ISmsFilter {
  bookingId: string;
  recipient: string;
  status: string;
}

const initialFilter: ISmsFilter = { bookingId: "", recipient: "", status: "" };

const recipientOptions = [
  { value: "customer", label: "To customer" },
  { value: "admin", label: "To admin" },
];
const statusOptions = [
  { value: "sent", label: "Sent" },
  { value: "simulated", label: "Simulated (dev)" },
  { value: "failed", label: "Failed" },
];

const SmsLog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ISmsFilter>(initialFilter);
  const [pagination, setPagination] = useState<Pagination>(PAGINATION);
  const [records, setRecords] = useState<ISmsMessage[]>([]);
  const [total, setTotal] = useState(0);

  const getSms = useCallback(
    async (current: ISmsFilter, page: number, limit: number) => {
      dispatch(handleTableLoader(true));
      await smsService
        .getSmsLog({ ...current, bookingId: current.bookingId.trim().toUpperCase(), limit, skip: (page - 1) * limit })
        .then((result) => {
          setRecords(result.items);
          setTotal(result.total);
        })
        .catch(() => undefined)
        .finally(() => dispatch(handleTableLoader(false)));
    },
    [dispatch],
  );

  useEffect(() => {
    getSms(initialFilter, PAGINATION.page, PAGINATION.limit);
  }, [getSms]);

  const debounced = useMemo(() => debounce((next: ISmsFilter, limit: number) => getSms(next, 1, limit), 400), [getSms]);
  useEffect(() => () => debounced.cancel(), [debounced]);

  const apply = (patch: Partial<ISmsFilter>, slow = false) => {
    const next = { ...filter, ...patch };
    setFilter(next);
    setPagination((p) => ({ ...p, page: 1 }));
    if (slow) debounced(next, pagination.limit);
    else getSms(next, 1, pagination.limit);
  };

  const columns: ColumnDef<ISmsMessage>[] = useMemo(
    () => [
      { accessorKey: "sentAt", header: "Sent", cell: ({ row }) => <span className="whitespace-nowrap text-sm">{dateTimeIST(row.original.sentAt)}</span> },
      {
        accessorKey: "recipient",
        header: "To",
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <Chip size="sm" variant="flat" color={row.original.recipient === "admin" ? "secondary" : "primary"}>{row.original.recipient}</Chip>
            <p className="mt-1 text-xs text-default-700">{phoneText(row.original.toPhone)}</p>
          </div>
        ),
      },
      {
        accessorKey: "body",
        header: "Message",
        cell: ({ row }) => (
          <div className="min-w-[280px] max-w-xl">
            <p className="text-sm">{row.original.body}</p>
            {row.original.error && <p className="mt-1 text-xs text-danger">{row.original.error}</p>}
          </div>
        ),
      },
      {
        accessorKey: "bookingId",
        header: "Booking",
        cell: ({ row }) =>
          row.original.bookingId ? (
            <button type="button" className="font-mono text-sm font-semibold text-primary hover:underline" onClick={(e) => { e.stopPropagation(); navigate(Routing.BookingDetails, { state: { id: row.original.bookingId } }); }}>
              {row.original.bookingId}
            </button>
          ) : (
            "—"
          ),
      },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <Chip size="sm" variant="dot" color={SmsStatusColor[row.original.status]}>{row.original.status}</Chip> },
      { accessorKey: "provider", header: "Provider", cell: ({ row }) => <span className="text-sm">{row.original.provider}</span> },
    ],
    [navigate],
  );

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SMS log</h1>
        <p className="text-sm text-default-700">Every confirmation SMS, newest first. Two go out per confirmed booking: one to the customer and one to the admin number.</p>
      </div>
      {records.some((m) => m.status === "simulated") && (
        <FormAlert tone="info">"Simulated" messages were printed to the server console because no SMS provider is configured (development).</FormAlert>
      )}
      <Formik initialValues={filter} enableReinitialize onSubmit={() => undefined}>
        {({ setFieldValue }) => (
          <Form noValidate className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field
              name="bookingId"
              placeholder="Booking ID"
              component={Input}
              isClearable
              startContent={<FaSearch className="h-4 w-4" aria-hidden />}
              onChange={(e: { target?: { value: string } }) => {
                const value = e?.target?.value ?? "";
                setFieldValue("bookingId", value);
                apply({ bookingId: value }, true);
              }}
            />
            <Field name="recipient" placeholder="All recipients" component={SelectDropdown} isClearable options={recipientOptions} onChange={(v: string | null) => apply({ recipient: v ?? "" })} />
            <Field name="status" placeholder="All statuses" component={SelectDropdown} isClearable options={statusOptions} onChange={(v: string | null) => apply({ status: v ?? "" })} />
          </Form>
        )}
      </Formik>
      <Card shadow="sm" fullWidth>
        <CardBody className="p-0">
          {records.length === 0 && total === 0 ? (
            <p className="py-12 text-center text-default-700">No SMS yet. Confirm a booking to see messages here.</p>
          ) : (
            <TanstackTable
              data={records}
              columns={columns}
              enablePagination
              manualPagination
              pagination={pagination}
              totalCount={total}
              onPaginationChange={(next) => {
                if (next.page === pagination.page && next.limit === pagination.limit) return;
                setPagination(next);
                getSms(filter, next.page, next.limit);
              }}
            />
          )}
        </CardBody>
      </Card>
    </section>
  );
};

export default SmsLog;
