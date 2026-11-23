import { useCallback, useEffect, useMemo, useState } from "react";
import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import { FaSearch } from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getBookingColumns } from "../../components/booking/bookingColumns";
import { TanstackTable } from "../../components/custom-table/TanstackTable";
import { Button, Card, CardBody, DateInput, Input, SelectDropdown, Tabs } from "../../components/ui";
import type { IBooking, IBookingFilters } from "../../models/booking";
import type { Pagination } from "../../models/base-type";
import { Routing } from "../../routes/routing";
import bookingService from "../../services/booking-service";
import { PAGINATION } from "../../shared/constants/pagination";
import { BookingChannelOptions, BookingStatusOptions, PaymentKindOptions } from "../../shared/enums/booking";
import { handleTableLoader } from "../../store/slices/generalSlice";

const initialFilter: IBookingFilters = { time: "all", date: "", channel: "", paymentKind: "", status: "", search: "" };

const timeTabs = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

const AllBookings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const preset = (location.state as Partial<IBookingFilters> | null) ?? {};
  const [filter, setFilter] = useState<IBookingFilters>({ ...initialFilter, ...preset });
  const [pagination, setPagination] = useState<Pagination>(PAGINATION);
  const [records, setRecords] = useState<IBooking[]>([]);
  const [total, setTotal] = useState(0);

  const getBookings = useCallback(
    async (current: IBookingFilters, page: number, limit: number) => {
      dispatch(handleTableLoader(true));
      await bookingService
        .getAllBookings({ ...current, search: current.search.trim(), limit, skip: (page - 1) * limit })
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
    getBookings(filter, pagination.page, pagination.limit);
    // Only on first load; later loads come from filter/page handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedSearch = useMemo(() => debounce((next: IBookingFilters, limit: number) => getBookings(next, 1, limit), 400), [getBookings]);
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const applyFilter = (patch: Partial<IBookingFilters>, debounced = false) => {
    const next = { ...filter, ...patch };
    setFilter(next);
    setPagination((p) => ({ ...p, page: 1 }));
    if (debounced) debouncedSearch(next, pagination.limit);
    else getBookings(next, 1, pagination.limit);
  };

  const handlePageChange = (next: { page: number; limit: number }) => {
    if (next.page === pagination.page && next.limit === pagination.limit) return;
    setPagination(next);
    getBookings(filter, next.page, next.limit);
  };

  const columns = useMemo(() => getBookingColumns(), []);
  const hasFilters = JSON.stringify({ ...filter, time: "all" }) !== JSON.stringify(initialFilter) || filter.time !== "all";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All bookings</h1>
          <p className="text-sm text-default-700">Online and counter bookings, with payment status.</p>
        </div>
        <Link to={Routing.WalkInBooking} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <FiPlusCircle className="h-4 w-4" aria-hidden /> Book walk-in
        </Link>
      </div>

      <Tabs
        variant="underlined"
        selectedKey={filter.time}
        onSelectionChange={(key) => applyFilter({ time: key as IBookingFilters["time"] })}
        className="[&_[role=tabpanel]]:hidden"
        items={timeTabs.map((t) => ({ id: t.id, label: t.label, content: null }))}
      />

      <Formik initialValues={filter} enableReinitialize onSubmit={() => undefined}>
        {({ setFieldValue }) => (
          <Form noValidate className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Field
              name="search"
              placeholder="Search ID, name or phone"
              component={Input}
              isClearable
              startContent={<FaSearch className="h-4 w-4" aria-hidden />}
              onChange={(e: { target?: { value: string } } | string) => {
                const value = typeof e === "string" ? e : (e?.target?.value ?? "");
                setFieldValue("search", value);
                applyFilter({ search: value }, true);
              }}
            />
            <Field name="date" placeholder="Filter by date" component={DateInput} isClearable onChange={(value: string) => applyFilter({ date: value || "" })} />
            <Field name="channel" placeholder="All channels" component={SelectDropdown} isClearable options={BookingChannelOptions} onChange={(value: string | null) => applyFilter({ channel: (value ?? "") as IBookingFilters["channel"] })} />
            <Field name="paymentKind" placeholder="All payment types" component={SelectDropdown} isClearable options={PaymentKindOptions} onChange={(value: string | null) => applyFilter({ paymentKind: (value ?? "") as IBookingFilters["paymentKind"] })} />
            <Field name="status" placeholder="All statuses" component={SelectDropdown} isClearable options={BookingStatusOptions} onChange={(value: string | null) => applyFilter({ status: (value ?? "") as IBookingFilters["status"] })} />
          </Form>
        )}
      </Formik>
      {hasFilters && (
        <div className="-mt-2">
          <Button size="xs" variant="light" onClick={() => applyFilter(initialFilter)}>
            Clear filters
          </Button>
        </div>
      )}

      <Card shadow="sm" fullWidth>
        <CardBody className="p-0">
          {records.length === 0 && total === 0 ? (
            <p className="py-12 text-center text-default-700">No bookings match these filters.</p>
          ) : (
            <TanstackTable
              data={records}
              columns={columns}
              enablePagination
              manualPagination
              pagination={pagination}
              onPaginationChange={handlePageChange}
              totalCount={total}
              onRowClick={(row) => navigate(Routing.BookingDetails, { state: { id: row.id } })}
            />
          )}
        </CardBody>
      </Card>
    </section>
  );
};

export default AllBookings;
