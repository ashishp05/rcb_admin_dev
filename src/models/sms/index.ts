export interface ISmsMessage {
    id: string;
    toPhone: string;
    recipient: "customer" | "admin";
    body: string;
    bookingId: string | null;
    provider: string;
    providerId: string | null;
    status: "sent" | "failed" | "simulated";
    error: string | null;
    sentAt: string;
}
