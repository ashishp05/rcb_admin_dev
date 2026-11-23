import type { IBooking } from "../booking";

export interface ICustomer {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    // Confirmed bookings only (upcoming + completed).
    count: number;
    totalSpent: number;
    firstSeen: string;
    lastSeen: string;
    lastBookingAt: string | null;
}

export interface ICustomerDetail extends ICustomer {
    bookings: IBooking[];
}
