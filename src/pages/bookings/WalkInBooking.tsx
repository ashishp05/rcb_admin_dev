import { useCallback, useEffect, useMemo, useState } from "react";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import { debounce } from "lodash";
import { FiCreditCard, FiDollarSign } from "react-icons/fi";
import { MdOutlineQrCode2 } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PaymentPanel from "../../components/booking/PaymentPanel";
import PriceSummary from "../../components/booking/PriceSummary";
import { DateStrip, SlotGrid, SlotLegend } from "../../components/booking/SlotPicker";
import { Button, Card, CardBody, Input, Spinner, Textarea } from "../../components/ui";
import type { IPrice, IWalkInFormModel, IWalkInResponse, PaymentKind } from "../../models/booking";
import type { ISlotGrid, IVenue } from "../../models/venue";
import { Routing } from "../../routes/routing";
import bookingService from "../../services/booking-service";
import { getErrorMessage, getErrorStatus, getFieldErrors } from "../../services/http-service";
import venueService from "../../services/venue-service";
import { HttpStatusCode } from "../../shared/enums/http-status-code";
import { PaymentKindLabel } from "../../shared/enums/booking";
import { dateRange, hoursText, longDate, normalizeMobile, slotRange, todayIST } from "../../utils/format";
import { toggleHour } from "../../utils/slotSelection";
import { WalkInValidationSchema } from "../../validation/booking";
import FormAlert from "../account/components/FormAlert";

const initialValues: IWalkInFormModel = {
  customerName: "",
  customerPhone: "",
  players: "",
  notes: "",
  offerCode: "",
  paymentKind: "cash",
  paymentMethodLabel: "",
};

const paymentOptions: { id: PaymentKind; text: string; icon: typeof FiDollarSign }[] = [
  { id: "cash", text: "Confirmed immediately", icon: FiDollarSign },
  { id: "upi_qr", text: "Customer scans and pays", icon: MdOutlineQrCode2 },
  { id: "credit_card", text: "Swipe at the counter", icon: FiCreditCard },
  { id: "debit_card", text: "Swipe at the counter", icon: FiCreditCard },
];

const WalkInBooking = () => {
  const navigate = useNavigate();
  const today = todayIST();
  const [venue, setVenue] = useState<IVenue | null>(null);
  const [date, setDate] = useState(today);
  const [pitchId, setPitchId] = useState("");
  const [grid, setGrid] = useState<ISlotGrid | null>(null);
  const [hours, setHours] = useState<number[]>([]);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [offerCode, setOfferCode] = useState("");
  const [price, setPrice] = useState<IPrice | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [created, setCreated] = useState<IWalkInResponse | null>(null);

  const activePitch = pitchId || venue?.pitches[0]?.id || "";
  const sorted = useMemo(() => [...hours].sort((a, b) => a - b), [hours]);

  useEffect(() => {
    venueService.getVenue().then((response) => setVenue(response.data)).catch(() => undefined);
  }, []);

  const getSlots = useCallback(async () => {
    if (!activePitch) return;
    await venueService
      .getSlots(date, activePitch)
      .then((response) => {
        setGrid(response.data);
        const free = new Set(response.data.slots.filter((s) => s.status === "available").map((s) => s.hour));
        setHours((current) => (current.every((h) => free.has(h)) ? current : []));
      })
      .catch(() => undefined);
  }, [date, activePitch]);

  useEffect(() => {
    getSlots();
    const id = window.setInterval(() => getSlots(), 20_000);
    return () => window.clearInterval(id);
  }, [getSlots]);

  // Live price from the server (also validates the offer code for this date and duration).
  const getPrice = useMemo(() => {
    // Only the newest response is applied, so a slow reply can't overwrite a newer price.
    let latest = 0;
    return debounce(async (forDate: string, forHours: number[], code: string) => {
        const requestId = ++latest;
        if (forHours.length === 0) {
          setPrice(null);
          setPriceError(null);
          return;
        }
        await bookingService
          .previewPrice({ hours: forHours.length, date: forDate, startHour: forHours[0], offerCode: code || undefined })
          .then((response) => {
            if (requestId !== latest) return;
            setPrice(response.data);
            setPriceError(null);
          })
          .catch((err) => {
            if (requestId !== latest) return;
            setPrice(null);
            setPriceError(getErrorMessage(err));
          });
      }, 300);
  }, []);

  useEffect(() => {
    getPrice(date, sorted, offerCode.trim().toUpperCase());
  }, [date, sorted, offerCode, getPrice]);

  useEffect(() => () => getPrice.cancel(), [getPrice]);

  const onToggle = (hour: number) => {
    const next = toggleHour(hours, hour);
    if (venue && next.hours.length > venue.maxHours) {
      toast.error(`You can book up to ${venue.maxHours} hours at a time.`);
      return;
    }
    if (next.reset) toast.info("Slots must be back-to-back, so a new selection was started.");
    setHours(next.hours);
    setHoursError(null);
  };

  const handleSubmit = async (values: IWalkInFormModel, helpers: FormikHelpers<IWalkInFormModel>) => {
    if (sorted.length === 0) {
      setHoursError("Select at least one hour.");
      return;
    }
    if (venue && sorted.length < venue.minHours) {
      setHoursError(`Minimum booking is ${hoursText(venue.minHours)}.`);
      return;
    }
    await bookingService
      .createWalkIn({
        pitchId: activePitch,
        date,
        hours: sorted,
        customerName: values.customerName.trim(),
        customerPhone: normalizeMobile(values.customerPhone),
        paymentKind: values.paymentKind,
        paymentMethodLabel: values.paymentMethodLabel.trim() || undefined,
        players: values.players ? Number(values.players) : undefined,
        notes: values.notes.trim() || undefined,
        offerCode: offerCode.trim().toUpperCase() || undefined,
      })
      .then((response) => {
        if (response.data.status === "upcoming") {
          toast.success(`Booking ${response.data.id} confirmed. SMS sent to the customer.`);
          navigate(Routing.BookingDetails, { state: { id: response.data.id } });
        } else {
          setCreated(response.data);
        }
      })
      .catch((err) => {
        if (getErrorStatus(err) === HttpStatusCode.ConflictError) {
          toast.error("That slot was just taken. Pick another time.");
          setHours([]);
          getSlots();
          return;
        }
        const fieldErrors = getFieldErrors(err);
        if (fieldErrors.hours) setHoursError(fieldErrors.hours);
        if (Object.keys(fieldErrors).length) helpers.setErrors(fieldErrors);
        toast.error(getErrorMessage(err));
      });
  };

  if (created) {
    return (
      <section className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Booking {created.id}</h1>
          <p className="text-sm text-default-700">
            {created.customerName} · {longDate(created.date)} · {created.slotLabel}
          </p>
        </div>
        <div className="max-w-2xl">
          <PaymentPanel booking={created} initialOrder={created.payment} onDone={(b) => navigate(Routing.BookingDetails, { state: { id: b.id } })} />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Book walk-in</h1>
        <p className="text-sm text-default-700">Take a counter booking for a customer at the desk.</p>
      </div>

      <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={WalkInValidationSchema} validateOnBlur={false}>
        {({ values, setFieldValue, isSubmitting }) => (
          <Form noValidate className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <Card shadow="sm" fullWidth>
                <CardBody className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-foreground">1. Date & slots</h2>
                    {venue && venue.pitches.length > 1 && (
                      <div className="flex gap-1 rounded-xl bg-default-100 p-1">
                        {venue.pitches.map((p) => (
                          <button key={p.id} type="button" onClick={() => { setPitchId(p.id); setHours([]); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${p.id === activePitch ? "bg-content1 shadow-sm" : "text-default-700"}`}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {venue && <DateStrip dates={dateRange(today, venue.advanceDays + 1)} value={date} today={today} onChange={(d) => { setDate(d); setHours([]); }} />}
                  <SlotLegend />
                  {!grid || grid.date !== date || grid.pitchId !== activePitch ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                  ) : (
                    <SlotGrid slots={grid.slots} selected={hours} onToggle={onToggle} />
                  )}
                  {hoursError && <p className="text-sm text-danger">{hoursError}</p>}
                </CardBody>
              </Card>

              <Card shadow="sm" fullWidth>
                <CardBody className="space-y-4 p-5">
                  <h2 className="text-lg font-semibold text-foreground">2. Customer details</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field name="customerName" label="Customer name" labelPlacement="outside" placeholder="Full name" isRequired component={Input} />
                    <Field name="customerPhone" type="tel" inputMode="numeric" label="Mobile number" labelPlacement="outside" placeholder="98765 43210" isRequired startContent={<span className="text-sm text-default-700">+91</span>} component={Input} />
                    <Field name="players" type="number" label="Players (optional)" labelPlacement="outside" placeholder="e.g. 10" component={Input} />
                    <Input
                      label="Offer code (optional)"
                      labelPlacement="outside"
                      placeholder="e.g. RIVER50"
                      value={offerCode}
                      onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                      error={offerCode && priceError ? priceError : undefined}
                      touched
                      inputClassName="font-mono"
                    />
                  </div>
                  <Field name="notes" label="Notes (optional)" labelPlacement="outside" placeholder="Anything the team should know" component={Textarea} />
                  <p className="text-xs text-default-700">The confirmation SMS goes to this mobile number.</p>
                </CardBody>
              </Card>

              <Card shadow="sm" fullWidth>
                <CardBody className="space-y-4 p-5">
                  <h2 className="text-lg font-semibold text-foreground">3. Payment</h2>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4" role="radiogroup" aria-label="Payment method">
                    {paymentOptions.map(({ id, text, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={values.paymentKind === id}
                        onClick={() => setFieldValue("paymentKind", id)}
                        className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${values.paymentKind === id ? "border-primary bg-primary-50" : "border-default-200 hover:border-primary"}`}
                      >
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                        <span>
                          <span className="block text-sm font-semibold text-foreground">{PaymentKindLabel[id]}</span>
                          <span className="block text-xs text-default-700">{text}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {(values.paymentKind === "credit_card" || values.paymentKind === "debit_card") && (
                    <Field name="paymentMethodLabel" label="Card / bank label (optional)" labelPlacement="outside" placeholder="e.g. Card - HDFC" component={Input} />
                  )}
                </CardBody>
              </Card>
            </div>

            <Card shadow="sm" fullWidth className="xl:sticky xl:top-[90px]">
              <CardBody className="space-y-4 p-5">
                <h2 className="text-lg font-semibold text-foreground">Summary</h2>
                {sorted.length === 0 ? (
                  <p className="text-sm text-default-700">Pick one or more back-to-back hours to see the price.</p>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-foreground">{longDate(date)}</p>
                      <p className="text-sm text-default-700">
                        {slotRange(sorted[0], sorted.length)} · {hoursText(sorted.length)}
                      </p>
                    </div>
                    {price ? <PriceSummary price={price} /> : priceError ? <FormAlert tone="warning">Offer not applied: {priceError}</FormAlert> : <Spinner size="sm" />}
                  </>
                )}
                <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} disabled={sorted.length === 0 || (!!offerCode && !!priceError)} className="justify-center font-semibold">
                  {values.paymentKind === "cash" ? "Confirm cash booking" : "Create & collect payment"}
                </Button>
              </CardBody>
            </Card>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default WalkInBooking;
