import type { StaffRole } from "../../models/staff";
import { Routing } from "../../routes/routing";
import { Modules } from "../enums/modules";

export interface ISidebarData {
  id?: number;
  module: string;
  route: string;
  name: string;
  icon?: string;
  // Roles that see this item. Omitted = every signed-in staff member.
  roles?: StaffRole[];
  childs?: ISidebarData[];
}

export const sidebarRoutes: ISidebarData[] = [
  { module: Modules.Dashboard, route: Routing.Dashboard, name: "Desk home", icon: "dashboard" },
  { module: Modules.WalkIn, route: Routing.WalkInBooking, name: "Book walk-in", icon: "walkIn" },
  { module: Modules.Bookings, route: Routing.AllBookings, name: "All bookings", icon: "bookings" },
  { module: Modules.Customers, route: Routing.AllCustomers, name: "Customers", icon: "customers" },
  { module: Modules.Rates, route: Routing.RatesAndCharges, name: "Rates & charges", icon: "rates" },
  { module: Modules.Offers, route: Routing.AllOffers, name: "Offers", icon: "offers" },
  { module: Modules.Staff, route: Routing.AllStaff, name: "Staff accounts", icon: "staff", roles: ["admin"] },
  { module: Modules.Sms, route: Routing.SmsLog, name: "SMS log", icon: "sms" },
  { module: Modules.CounterQr, route: Routing.CounterQr, name: "Counter QR", icon: "qr" },
];

export const getSidebarRoutes = (role: StaffRole | ""): ISidebarData[] =>
  sidebarRoutes.filter((item) => !item.roles || (role !== "" && item.roles.includes(role)));
