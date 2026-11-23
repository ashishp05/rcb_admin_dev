import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import SuspenseFallback from "../components/loader/SuspenseFallback";
import type { StaffRole } from "../models/staff";
import ProtectedRoute from "./ProtectedRoute";
import { Routing } from "./routing";

const Loadable = (Component: React.ComponentType) => () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Component />
    </Suspense>
  );
};

const PublicLayout = lazy(() => import("../layout/PublicLayout"));
const MainLayout = lazy(() => import("../layout/MainLayout"));

const Login = Loadable(lazy(() => import("../pages/account/Login")));
const ForgotPassword = Loadable(lazy(() => import("../pages/account/ForgotPassword")));
const ResetPassword = Loadable(lazy(() => import("../pages/account/ResetPassword")));
const MyAccount = Loadable(lazy(() => import("../pages/account/MyAccount")));

const Dashboard = Loadable(lazy(() => import("../pages/dashboard/Dashboard")));
const WalkInBooking = Loadable(lazy(() => import("../pages/bookings/WalkInBooking")));
const AllBookings = Loadable(lazy(() => import("../pages/bookings/AllBookings")));
const BookingDetails = Loadable(lazy(() => import("../pages/bookings/BookingDetails")));
const AllCustomers = Loadable(lazy(() => import("../pages/customers/AllCustomers")));
const CustomerDetails = Loadable(lazy(() => import("../pages/customers/CustomerDetails")));
const RatesAndCharges = Loadable(lazy(() => import("../pages/rates/RatesAndCharges")));
const AllOffers = Loadable(lazy(() => import("../pages/offers/AllOffers")));
const AllStaff = Loadable(lazy(() => import("../pages/staff/AllStaff")));
const SmsLog = Loadable(lazy(() => import("../pages/sms/SmsLog")));
const CounterQr = Loadable(lazy(() => import("../pages/counter-qr/CounterQr")));
const UIKit = Loadable(lazy(() => import("../pages/uikit/UIKit")));

const ErrorPage = Loadable(lazy(() => import("../pages/account/ErrorPage")));
const Error404Page = Loadable(lazy(() => import("../pages/account/Error404Page")));

const privateRoute = (Element: React.ComponentType, roles?: StaffRole[]) => (
  <MainLayout>
    <ProtectedRoute element={<Element />} roles={roles} />
  </MainLayout>
);

const publicRoute = (Element: React.ComponentType) => (
  <PublicLayout>
    <Element />
  </PublicLayout>
);

const routes = createBrowserRouter(
  [
    { path: "/", element: <Navigate to={Routing.Dashboard} replace /> },
    { path: import.meta.env.VITE_PATH_PREFIX, element: <Navigate to={Routing.Dashboard} replace /> },

    { path: Routing.Login, element: publicRoute(Login) },
    { path: Routing.ForgotPassword, element: publicRoute(ForgotPassword) },
    { path: Routing.ResetPassword, element: publicRoute(ResetPassword) },

    { path: Routing.Dashboard, element: privateRoute(Dashboard) },
    { path: Routing.WalkInBooking, element: privateRoute(WalkInBooking) },
    { path: Routing.AllBookings, element: privateRoute(AllBookings) },
    { path: Routing.BookingDetails, element: privateRoute(BookingDetails) },
    { path: Routing.AllCustomers, element: privateRoute(AllCustomers) },
    { path: Routing.CustomerDetails, element: privateRoute(CustomerDetails) },
    // Staff can view rates and offers; editing controls are admin-only inside the pages.
    { path: Routing.RatesAndCharges, element: privateRoute(RatesAndCharges) },
    { path: Routing.AllOffers, element: privateRoute(AllOffers) },
    { path: Routing.AllStaff, element: privateRoute(AllStaff, ["admin"]) },
    { path: Routing.SmsLog, element: privateRoute(SmsLog) },
    { path: Routing.CounterQr, element: privateRoute(CounterQr) },
    { path: Routing.MyAccount, element: privateRoute(MyAccount) },
    // Design reference for the shared UI components (not in the menu).
    { path: Routing.UIKit, element: privateRoute(UIKit, ["admin"]) },

    { path: Routing.ErrorPage, element: publicRoute(ErrorPage) },
    { path: "*", element: publicRoute(Error404Page) },
  ],
  { basename: import.meta.env.BASE_URL },
);

const AppRouting = () => {
  return <RouterProvider router={routes} />;
};

export default AppRouting;
