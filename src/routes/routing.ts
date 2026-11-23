const PATH_PREFIX = import.meta.env.VITE_PATH_PREFIX;

export const Routing = {
  Login: `${PATH_PREFIX}/login`,
  ForgotPassword: `${PATH_PREFIX}/forgot-password`,
  // Matches the backend email link: {ADMIN_PANEL_URL}/reset-password?token=...
  ResetPassword: `${PATH_PREFIX}/reset-password`,

  Dashboard: `${PATH_PREFIX}/dashboard`,
  WalkInBooking: `${PATH_PREFIX}/walk-in`,
  AllBookings: `${PATH_PREFIX}/bookings`,
  BookingDetails: `${PATH_PREFIX}/bookings/booking-details`,
  AllCustomers: `${PATH_PREFIX}/customers`,
  CustomerDetails: `${PATH_PREFIX}/customers/customer-details`,
  RatesAndCharges: `${PATH_PREFIX}/rates`,
  AllOffers: `${PATH_PREFIX}/offers`,
  AllStaff: `${PATH_PREFIX}/staff`,
  SmsLog: `${PATH_PREFIX}/sms`,
  CounterQr: `${PATH_PREFIX}/counter-qr`,
  MyAccount: `${PATH_PREFIX}/account`,
  UIKit: `${PATH_PREFIX}/ui-kit`,

  NotFound: `${PATH_PREFIX}/not-found`,
  ErrorPage: `${PATH_PREFIX}/error`,
};
