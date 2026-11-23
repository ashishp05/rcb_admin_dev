export type SlotStatus = "available" | "booked" | "held" | "past";

export interface IPitch {
    id: string;
    name: string;
    size: string;
    format: string;
}

export interface IVenueSettings {
    hourlyRate: number;
    additionalCharge: number;
    gstRate: number;
    updatedAt: string;
}

export interface IVenue {
    id: string;
    name: string;
    area: string;
    city: string;
    address: string;
    description: string;
    phone: string;
    settings: IVenueSettings;
    pitches: IPitch[];
    openHour: number;
    closeHour: number;
    minHours: number;
    maxHours: number;
    advanceDays: number;
}

export interface ISlot {
    hour: number;
    label: string;
    status: SlotStatus;
    price: number;
    isPeak: boolean;
}

export interface ISlotGrid {
    date: string;
    pitchId: string;
    slots: ISlot[];
}

export interface IAdminSettings extends IVenueSettings {
    preview: {
        hours: number;
        hourlyBookingCharge: number;
        additionalCharge: number;
        taxes: number;
        totalPayable: number;
    };
    openHour: number;
    closeHour: number;
    minHours: number;
    maxHours: number;
    advanceDays: number;
}

export interface IRatesFormModel {
    hourlyRate: number | string;
    additionalCharge: number | string;
    gstRate: number | string;
    openHour: number | string;
    closeHour: number | string;
    minHours: number | string;
    maxHours: number | string;
    advanceDays: number | string;
}

export interface IDashboard {
    venueId: string;
    date: string;
    bookings: number;
    bookedHours: number;
    openHours: number;
    occupancy: number;
    revenue: number;
    pendingToday: number;
    cancelledToday: number;
    byChannel: { channel: "self" | "counter"; bookings: number; revenue: number }[];
    pendingTotal: number;
    upcomingTotal: number;
    today: import("../booking").IBooking[];
}
