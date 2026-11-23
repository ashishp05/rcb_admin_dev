/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type { IOffer, IOfferRequest } from "../models/offer";
import type { IAdminSettings, IDashboard, ISlotGrid, IVenue } from "../models/venue";
import { VENUE_ID } from "../shared/constants/venue";
import httpService from "./http-service";

const adminVenueURL = `admin/venues/${VENUE_ID}`;

const getVenue = async (): Promise<AxiosResponse<IVenue>> => httpService.get<IVenue>(`venues/${VENUE_ID}`);

const getSlots = async (date: string, pitchId?: string): Promise<AxiosResponse<ISlotGrid>> =>
    httpService.get<ISlotGrid>(`venues/${VENUE_ID}/slots`, { params: { date, pitchId } });

const getDashboard = async (date: string): Promise<AxiosResponse<IDashboard>> =>
    httpService.get<IDashboard>(`admin/dashboard`, { params: { date, venueId: VENUE_ID } });

const getQrLink = async (): Promise<AxiosResponse<{ url: string }>> => httpService.get<{ url: string }>(`admin/qr-link`);

const getSettings = async (): Promise<AxiosResponse<IAdminSettings>> => httpService.get<IAdminSettings>(`${adminVenueURL}/settings`);

const updateSettings = async (requestBody: Partial<Omit<IAdminSettings, "preview" | "updatedAt">>): Promise<AxiosResponse<IAdminSettings>> =>
    httpService.patch<IAdminSettings>(`${adminVenueURL}/settings`, requestBody, { skipErrorToast: true });

const getAllOffers = async (): Promise<AxiosResponse<IOffer[]>> => httpService.get<IOffer[]>(`${adminVenueURL}/offers`);

const createOffer = async (requestBody: IOfferRequest): Promise<AxiosResponse<IOffer>> =>
    httpService.post<IOffer>(`${adminVenueURL}/offers`, requestBody, { skipErrorToast: true });

const updateOffer = async (id: string, requestBody: IOfferRequest): Promise<AxiosResponse<IOffer>> =>
    httpService.patch<IOffer>(`${adminVenueURL}/offers/${id}`, requestBody, { skipErrorToast: true });

export default {
    getVenue,
    getSlots,
    getDashboard,
    getQrLink,
    getSettings,
    updateSettings,
    getAllOffers,
    createOffer,
    updateOffer,
};
