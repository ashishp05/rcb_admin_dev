export type BookingStatus = "pending" | "upcoming" | "completed" | "cancelled";
export type BookingChannel = "self" | "counter";
export type PaymentKind = "upi_qr" | "credit_card" | "debit_card" | "cash";
export type OnlinePaymentKind = Exclude<PaymentKind, "cash">;

export interface IPriceLine {
    hour: number;
    amount: number;
    isPeak: boolean;
}

// All amounts in rupees.
export interface IPrice {
    lines: IPriceLine[];
    subtotal: number;
    discount: number;
    platformFee: number;
    taxes: number;
    total: number;
    hourlyRate: number;
    hours: number;
    gstRate: number;
    couponCode: string | null;
}

export interface IBooking {
    id: string;
    venueId: string;
    venueName: string;
    venueArea: string;
    pitchId: string;
    pitchName: string;
    date: string;
    startHour: number;
    endHour: number;
    hours: number;
    slotLabel: string;
    status: BookingStatus;
    channel: BookingChannel;
    paymentKind: PaymentKind | null;
    paymentMethod: string | null;
    paymentMethodLabel: string | null;
    createdBy: "guest" | "staff";
    price: IPrice;
    customerName: string;
    customerPhone: string;
    staffId: string | null;
    players: number | null;
    notes: string | null;
    refundAmount: number | null;
    cancelReason: string | null;
    expiresAt: string | null;
    confirmedAt: string | null;
    cancelledAt: string | null;
    createdAt: string;
}

export interface IPaymentOrder {
    bookingId: string;
    orderId: string;
    // Paise (Razorpay Checkout amount).
    amount: number;
    currency: string;
    keyId: string;
    qrString: string | null;
    method: OnlinePaymentKind;
    mock: boolean;
}

export interface IPaymentRecord {
    id: string;
    provider: string;
    orderId: string;
    paymentId: string | null;
    status: "created" | "captured" | "failed" | "refunded";
    // Rupees.
    amount: number;
    method: string;
    refundId: string | null;
    createdAt: string;
}

export interface IBookingDetail extends IBooking {
    staff: { id: string; name: string } | null;
    payments: IPaymentRecord[];
    sms: import("../sms").ISmsMessage[];
}

export interface IWalkInResponse extends IBooking {
    payment: IPaymentOrder | null;
}

export interface IWalkInRequest {
    venueId?: string;
    pitchId: string;
    date: string;
    hours: number[];
    customerName: string;
    customerPhone: string;
    paymentKind: PaymentKind;
    paymentMethodLabel?: string;
    players?: number;
    notes?: string;
    offerCode?: string;
}

export interface IWalkInFormModel {
    customerName: string;
    customerPhone: string;
    players: string;
    notes: string;
    offerCode: string;
    paymentKind: PaymentKind;
    paymentMethodLabel: string;
}

export interface IBookingFilters {
    time: "all" | "upcoming" | "past";
    date: string;
    channel: BookingChannel | "";
    paymentKind: PaymentKind | "";
    status: BookingStatus | "";
    search: string;
}

export interface IBookingListParams extends Partial<IBookingFilters> {
    venueId?: string;
    phone?: string;
    from?: string;
    to?: string;
    limit: number;
    skip: number;
}

export interface IPagedList<T> {
    items: T[];
    total: number;
}

export interface ICancelBookingModel {
    reason: string;
    refundAmount: string;
}

export interface IPricePreviewRequest {
    venueId?: string;
    hours: number;
    date?: string;
    startHour?: number;
    offerCode?: string;
}
