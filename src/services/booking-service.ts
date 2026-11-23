/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type {
    IBooking,
    IBookingDetail,
    IBookingListParams,
    IPagedList,
    IPaymentOrder,
    IPrice,
    IPricePreviewRequest,
    IWalkInRequest,
    IWalkInResponse,
    OnlinePaymentKind,
    PaymentKind,
} from "../models/booking";
import { VENUE_ID } from "../shared/constants/venue";
import httpService from "./http-service";

const endPointBaseURL = `admin/bookings`;

// Drops empty filters so the backend applies its defaults.
const cleanParams = (params: object) =>
    Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null));

// "All bookings" list. Total comes from the X-Total-Count header.
const getAllBookings = async (params: IBookingListParams): Promise<IPagedList<IBooking>> => {
    const response = await httpService.get<IBooking[]>(endPointBaseURL, { params: cleanParams({ venueId: VENUE_ID, ...params }) });
    return { items: response.data, total: Number(response.headers["x-total-count"] ?? response.data.length) };
};

const getBookingDetails = async (id: string): Promise<AxiosResponse<IBookingDetail>> =>
    httpService.get<IBookingDetail>(`${endPointBaseURL}/${id}`);

const createWalkIn = async (requestBody: IWalkInRequest): Promise<AxiosResponse<IWalkInResponse>> =>
    httpService.post<IWalkInResponse>(endPointBaseURL, { venueId: VENUE_ID, ...requestBody }, { skipErrorToast: true });

const markPaid = async (id: string, requestBody: { paymentKind?: PaymentKind; paymentMethodLabel?: string }): Promise<AxiosResponse<IBooking>> =>
    httpService.post<IBooking>(`${endPointBaseURL}/${id}/mark-paid`, requestBody);

const markPaymentFailed = async (id: string, reason?: string): Promise<AxiosResponse<IBooking>> =>
    httpService.post<IBooking>(`${endPointBaseURL}/${id}/payment-failed`, { reason });

const createPaymentOrder = async (id: string, method: OnlinePaymentKind): Promise<AxiosResponse<IPaymentOrder>> =>
    httpService.post<IPaymentOrder>(`${endPointBaseURL}/${id}/payment-order`, { method });

const cancelBooking = async (id: string, requestBody: { reason?: string; refundAmount?: number }): Promise<AxiosResponse<IBooking>> =>
    httpService.post<IBooking>(`${endPointBaseURL}/${id}/cancel`, requestBody);

const rescheduleBooking = async (id: string, requestBody: { date: string; startHour: number; pitchId?: string }): Promise<AxiosResponse<IBooking>> =>
    httpService.post<IBooking>(`${endPointBaseURL}/${id}/reschedule`, requestBody);

// Public price preview; also validates an offer code. Caller handles offer errors inline.
const previewPrice = async (requestBody: IPricePreviewRequest): Promise<AxiosResponse<IPrice>> =>
    httpService.post<IPrice>(`bookings/price`, { venueId: VENUE_ID, ...requestBody }, { skipErrorToast: true });

export default {
    getAllBookings,
    getBookingDetails,
    createWalkIn,
    markPaid,
    markPaymentFailed,
    createPaymentOrder,
    cancelBooking,
    rescheduleBooking,
    previewPrice,
};
