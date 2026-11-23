/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type { IMessageResponseModel } from "../models/account";
import type { IStaff, StaffRole } from "../models/staff";
import httpService from "./http-service";

const endPointBaseURL = `admin/staff`;

const getAllStaff = async (): Promise<AxiosResponse<IStaff[]>> => httpService.get<IStaff[]>(endPointBaseURL);

const createStaff = async (requestBody: { name: string; email: string; role: StaffRole; password: string; sendInvite: boolean }): Promise<AxiosResponse<IStaff>> =>
    httpService.post<IStaff>(endPointBaseURL, requestBody, { skipErrorToast: true });

const updateStaff = async (id: string, requestBody: Partial<Pick<IStaff, "name" | "role" | "active">>): Promise<AxiosResponse<IStaff>> =>
    httpService.patch<IStaff>(`${endPointBaseURL}/${id}`, requestBody, { skipErrorToast: true });

const setPassword = async (id: string, newPassword: string): Promise<AxiosResponse<IMessageResponseModel>> =>
    httpService.post<IMessageResponseModel>(`${endPointBaseURL}/${id}/password`, { newPassword }, { skipErrorToast: true });

export default { getAllStaff, createStaff, updateStaff, setPassword };
