import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiPercent, FiPlusCircle, FiTrendingUp } from "react-icons/fi";
import { MdOutlineQrCode2 } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getBookingColumns } from "../../components/booking/bookingColumns";
import { TanstackTable } from "../../components/custom-table/TanstackTable";
import { Button, Card, CardBody, Skeleton } from "../../components/ui";
import type { IDashboard } from "../../models/venue";
import { Routing } from "../../routes/routing";
import venueService from "../../services/venue-service";
import { BookingChannelLabel } from "../../shared/enums/booking";
import type { IApplicationState } from "../../store/state/app-state";
import { addDays, formatRupees, longDate, todayIST } from "../../utils/format";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof FiCalendar;
  tone: string;
}

const StatCard = ({ label, value, hint, icon: Icon, tone }: StatCardProps) => (
  <Card shadow="sm" fullWidth>
    <CardBody className="flex flex-row items-start gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-default-700">{label}</p>
        <p className="font-display text-3xl font-bold leading-tight text-foreground">{value}</p>
        {hint && <p className="truncate text-xs text-default-700">{hint}</p>}
      </div>
    </CardBody>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = useSelector((state: IApplicationState) => state.UserData.name);
  const today = todayIST();
  const [date, setDate] = useState(today);
  const [dashboard, setDashboard] = useState<IDashboard | null>(null);

  const getDashboard = useCallback(async (forDate: string) => {
    await venueService
      .getDashboard(forDate)
      .then((response) => setDashboard(response.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    getDashboard(date);
    // Keep the desk view fresh while it stays open.
    const id = window.setInterval(() => getDashboard(date), 30_000);
    return () => window.clearInterval(id);
  }, [date, getDashboard]);

  const columns = useMemo(() => getBookingColumns({ showDate: false }), []);
  // Shown while the selected date's numbers are loading (first load or after changing the date).
  const loading = !dashboard || dashboard.date !== date;
  const d = loading ? null : dashboard;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {userName.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-default-700">{longDate(date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button isIconOnly size="sm" variant="bordered" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>
            <FiChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="date"
            value={date}
            aria-label="Date"
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="h-10 rounded-xl border border-default-300 bg-content1 px-3 text-sm text-foreground"
          />
          <Button isIconOnly size="sm" variant="bordered" aria-label="Next day" onClick={() => setDate(addDays(date, 1))}>
            <FiChevronRight className="h-4 w-4" />
          </Button>
          {date !== today && (
            <Button size="sm" variant="light" onClick={() => setDate(today)}>
              Today
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)
        ) : d ? (
          <>
            <StatCard label="Confirmed bookings" value={d.bookings} hint={`${d.bookedHours} of ${d.openHours} hours booked`} icon={FiCalendar} tone="bg-primary-50 text-primary-700" />
            <StatCard label="Occupancy" value={`${d.occupancy}%`} hint="Booked hours ÷ open hours" icon={FiPercent} tone="bg-secondary-100 text-secondary-800" />
            <StatCard
              label="Revenue"
              value={formatRupees(d.revenue)}
              hint={d.byChannel.length ? d.byChannel.map((c) => `${BookingChannelLabel[c.channel]} ${formatRupees(c.revenue)}`).join(" · ") : "No sales yet"}
              icon={FiTrendingUp}
              tone="bg-success-50 text-success-700"
            />
            <StatCard label="Pending · cancelled" value={`${d.pendingToday} · ${d.cancelledToday}`} hint="On this date" icon={FiAlertCircle} tone="bg-warning-50 text-warning-700" />
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={Routing.WalkInBooking} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <FiPlusCircle className="h-4 w-4" aria-hidden /> Book walk-in
        </Link>
        <Link to={Routing.AllBookings} state={{ status: "pending" }} className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-default-300 px-4 text-sm font-semibold hover:border-primary">
          <FiClock className="h-4 w-4" aria-hidden /> Awaiting payment ({d?.pendingTotal ?? 0})
        </Link>
        <Link to={Routing.AllBookings} state={{ time: "upcoming" }} className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-default-300 px-4 text-sm font-semibold hover:border-primary">
          <FiCalendar className="h-4 w-4" aria-hidden /> All upcoming ({d?.upcomingTotal ?? 0})
        </Link>
        <Link to={Routing.CounterQr} className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-default-300 px-4 text-sm font-semibold hover:border-primary">
          <MdOutlineQrCode2 className="h-4 w-4" aria-hidden /> Counter QR
        </Link>
      </div>

      <Card shadow="sm" fullWidth>
        <CardBody className="p-0">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <h2 className="text-lg font-semibold text-foreground">{date === today ? "Today's bookings" : "Bookings on this day"}</h2>
            <span className="text-sm text-default-700">{d?.today.length ?? 0} active</span>
          </div>
          {!loading && d && d.today.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-default-700">No bookings on this day yet.</p>
              <Link to={Routing.WalkInBooking} className="text-sm font-semibold text-primary hover:underline">
                Book a walk-in
              </Link>
            </div>
          ) : (
            <TanstackTable
              data={d?.today ?? []}
              columns={columns}
              loading={loading}
              onRowClick={(row) => navigate(Routing.BookingDetails, { state: { id: row.id } })}
            />
          )}
        </CardBody>
      </Card>
    </section>
  );
};

export default Dashboard;
