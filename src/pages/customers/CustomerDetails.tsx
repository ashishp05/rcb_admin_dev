import { useEffect, useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FiPhone, FiPlusCircle } from "react-icons/fi";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getBookingColumns } from "../../components/booking/bookingColumns";
import { TanstackTable } from "../../components/custom-table/TanstackTable";
import { Avatar, Card, CardBody, Skeleton } from "../../components/ui";
import type { ICustomerDetail } from "../../models/customer";
import { Routing } from "../../routes/routing";
import customerService from "../../services/customer-service";
import { dateTimeIST, formatRupees, phoneText } from "../../utils/format";

const CustomerDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const phone = (location.state as { phone?: string } | null)?.phone ?? params.get("phone") ?? "";
  const [customer, setCustomer] = useState<ICustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const columns = useMemo(() => getBookingColumns({ showCustomer: false }), []);

  useEffect(() => {
    if (!phone) return;
    customerService
      .getCustomerDetails(phone)
      .then((response) => setCustomer(response.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [phone]);

  if (!phone) {
    return (
      <section className="py-20 text-center">
        <p className="text-default-700">No customer selected.</p>
        <Link to={Routing.AllCustomers} className="font-semibold text-primary hover:underline">Go to customers</Link>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <button type="button" onClick={() => navigate(Routing.AllCustomers)} className="inline-flex items-center gap-2 text-sm font-medium text-default-700 hover:text-primary">
        <FaChevronLeft className="h-3 w-3" aria-hidden /> Customers
      </button>
      {loading || !customer ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : (
        <>
          <Card shadow="sm" fullWidth>
            <CardBody className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar size="lg" name={customer.name || customer.phone} color="primary" isBordered />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{customer.name || "Unnamed customer"}</h1>
                  <p className="text-sm text-default-700">
                    {phoneText(customer.phone)}
                    {customer.email && ` · ${customer.email}`}
                  </p>
                  <p className="text-xs text-default-700">First seen {dateTimeIST(customer.firstSeen)} · Last seen {dateTimeIST(customer.lastSeen)}</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-xs uppercase tracking-wider text-default-700">Bookings</p>
                  <p className="font-display text-3xl font-bold">{customer.count}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-default-700">Total spent</p>
                  <p className="font-display text-3xl font-bold">{formatRupees(customer.totalSpent)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:+91${customer.phone}`} className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-default-300 px-4 text-sm font-semibold hover:border-primary">
              <FiPhone className="h-4 w-4" aria-hidden /> Call
            </a>
            <Link to={Routing.WalkInBooking} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              <FiPlusCircle className="h-4 w-4" aria-hidden /> New walk-in
            </Link>
          </div>
          <Card shadow="sm" fullWidth>
            <CardBody className="p-0">
              <h2 className="px-5 pb-2 pt-4 text-lg font-semibold text-foreground">Booking history</h2>
              {customer.bookings.length === 0 ? (
                <p className="py-10 text-center text-default-700">No bookings yet.</p>
              ) : (
                <TanstackTable data={customer.bookings} columns={columns} onRowClick={(row) => navigate(Routing.BookingDetails, { state: { id: row.id } })} />
              )}
            </CardBody>
          </Card>
        </>
      )}
    </section>
  );
};

export default CustomerDetails;
