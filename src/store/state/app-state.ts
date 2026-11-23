import type { StaffRole } from "../../models/staff";

export interface IApplicationState {
    UserData: IAuthState;
    GeneralData: IGeneralState;
}

// Signed-in staff member. Persisted (encrypted) in localStorage by store.ts.
export interface IAuthState {
    id: string;
    name: string;
    email: string;
    role: StaffRole | "";
    active: boolean;
    accessToken: string;
}

export interface IGeneralState {
    tableLoading: boolean;
    formLoading: boolean;
    progressLoading: boolean;
}
