/* eslint-disable import/no-anonymous-default-export */
import type { IPagedList } from "../models/booking";
import type { ISmsMessage } from "../models/sms";
import httpService from "./http-service";

const getSmsLog = async (params: { bookingId?: string; recipient?: string; status?: string; limit: number; skip: number }): Promise<IPagedList<ISmsMessage>> => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined));
    const response = await httpService.get<ISmsMessage[]>(`admin/sms`, { params: clean });
    return { items: response.data, total: Number(response.headers["x-total-count"] ?? response.data.length) };
};

export default { getSmsLog };
