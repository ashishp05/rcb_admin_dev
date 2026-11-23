import type { IStaff } from "../staff";

export interface ILoginRequestModel {
    email: string;
    password: string;
}

// POST /admin/auth/login and /admin/auth/change-password
export interface ILoginResponseModel {
    token: string;
    tokenType: "Bearer";
    // Seconds.
    expiresIn: number | null;
    staffId: string;
    staff: IStaff;
}

export interface IChangePasswordModel {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IForgotPasswordEmailModel {
    email: string;
}

export interface IResetPasswordModel {
    newPassword: string;
    confirmPassword: string;
}

export interface IMessageResponseModel {
    message: string;
}
