export type OfferKind = "flat" | "percent";
export type OfferAccent = "lime" | "ball" | "sky" | "amber";

export interface IOffer {
    id: string;
    code: string;
    title: string;
    description: string;
    label: string;
    kind: OfferKind;
    value: number;
    maxDiscount: number | null;
    minSubtotal: number;
    minHours: number;
    weekdaysOnly: boolean;
    accent: OfferAccent;
    active: boolean;
    validFrom: string | null;
    validTo: string | null;
}

export interface IOfferFormModel {
    code: string;
    title: string;
    description: string;
    kind: OfferKind;
    value: number | string;
    maxDiscount: number | string;
    minSubtotal: number | string;
    minHours: number | string;
    weekdaysOnly: boolean;
    accent: OfferAccent;
    active: boolean;
    validFrom: Date | string | null;
    validTo: Date | string | null;
}

export type IOfferRequest = Partial<Omit<IOffer, "id" | "label">>;
