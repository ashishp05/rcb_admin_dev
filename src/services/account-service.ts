/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type { ILoginRequestModel, ILoginResponseModel, IMessageResponseModel } from "../models/account";
import type { IStaff } from "../models/staff";
import httpService from "./http-service";

const endPointBaseURL = `admin/auth`;

// The login form shows errors inline, so no toast here.
const login = async (requestBody: ILoginRequestModel): Promise<AxiosResponse<ILoginResponseModel>> =>
    httpService.post<ILoginResponseModel>(`${endPointBaseURL}/login`, requestBody, { skipErrorToast: true });

const getProfile = async (): Promise<AxiosResponse<IStaff>> =>
    httpService.get<IStaff>(`${endPointBaseURL}/me`);

// Returns a new session: replace the stored token with the new one.
const changePassword = async (requestBody: { currentPassword: string; newPassword: string }): Promise<AxiosResponse<ILoginResponseModel>> =>
    httpService.post<ILoginResponseModel>(`${endPointBaseURL}/change-password`, requestBody, { skipErrorToast: true });

const logout = async (): Promise<AxiosResponse<IMessageResponseModel>> =>
    httpService.post<IMessageResponseModel>(`${endPointBaseURL}/logout`, {}, { skipErrorToast: true });

const logoutAll = async (): Promise<AxiosResponse<IMessageResponseModel>> =>
    httpService.post<IMessageResponseModel>(`${endPointBaseURL}/logout-all`, {});

const forgotPassword = async (email: string): Promise<AxiosResponse<IMessageResponseModel>> =>
    httpService.post<IMessageResponseModel>(`${endPointBaseURL}/forgot-password`, { email }, { skipErrorToast: true });

const resetPassword = async (token: string, newPassword: string): Promise<AxiosResponse<IMessageResponseModel>> =>
    httpService.post<IMessageResponseModel>(`${endPointBaseURL}/reset-password`, { token, newPassword }, { skipErrorToast: true });

export default {
    login,
    getProfile,
    changePassword,
    logout,
    logoutAll,
    forgotPassword,
    resetPassword,
};
