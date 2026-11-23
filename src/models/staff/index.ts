export type StaffRole = "admin" | "staff";

export interface IStaff {
    id: string;
    name: string;
    email: string;
    role: StaffRole;
    active: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IStaffFormModel {
    name: string;
    email: string;
    role: StaffRole;
    password: string;
    sendInvite: boolean;
    active: boolean;
}

export interface ISetPasswordModel {
    newPassword: string;
    confirmPassword: string;
}
