import type { StaffRole } from "../../models/staff";

export const StaffRoles = {
  Admin: "admin",
  Staff: "staff",
} as const satisfies Record<string, StaffRole>;

export const StaffRoleLabel: Record<StaffRole, string> = {
  admin: "Admin",
  staff: "Counter staff",
};

export const StaffRoleOptions = [
  { value: StaffRoles.Staff, label: "Counter staff — desk, bookings, customers" },
  { value: StaffRoles.Admin, label: "Admin — everything, incl. rates, offers & staff" },
];
