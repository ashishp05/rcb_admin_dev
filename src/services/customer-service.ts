/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type { IPagedList } from "../models/booking";
import type { ICustomer, ICustomerDetail } from "../models/customer";
import httpService from "./http-service";

const endPointBaseURL = `admin/customers`;

const getAllCustomers = async (params: { search?: string; limit: number; skip: number }): Promise<IPagedList<ICustomer>> => {
    const response = await httpService.get<ICustomer[]>(endPointBaseURL, { params: { ...params, search: params.search || undefined } });
    return { items: response.data, total: Number(response.headers["x-total-count"] ?? response.data.length) };
};

const getCustomerDetails = async (phone: string): Promise<AxiosResponse<ICustomerDetail>> =>
    httpService.get<ICustomerDetail>(`${endPointBaseURL}/${phone}`);

export default { getAllCustomers, getCustomerDetails };
