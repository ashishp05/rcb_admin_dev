import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { ILoginResponseModel } from "../../models/account";
import type { IStaff } from "../../models/staff";
import type { IAuthState } from "../state/app-state";

const initialState: IAuthState = {
  id: "",
  name: "",
  email: "",
  role: "",
  active: false,
  accessToken: "",
};

const applyStaff = (state: IAuthState, staff: IStaff) => {
  state.id = staff.id;
  state.name = staff.name;
  state.email = staff.email;
  state.role = staff.role;
  state.active = staff.active;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login and change-password both return a session; change-password issues a new token.
    adminLogin: (state: IAuthState, action: PayloadAction<ILoginResponseModel>) => {
      applyStaff(state, action.payload.staff);
      state.accessToken = action.payload.token;
    },

    // GET /admin/auth/me refresh: picks up role or name changes made by an admin.
    updateStaff: (state: IAuthState, action: PayloadAction<IStaff>) => {
      applyStaff(state, action.payload);
    },

    adminLogout: () => initialState,
  },
});

export const { adminLogin, adminLogout, updateStaff } = authSlice.actions;

export default authSlice.reducer;
