import { useEffect, useState } from "react";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import { FiLock } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Card, CardBody, Input, Skeleton } from "../../components/ui";
import type { IAdminSettings, IRatesFormModel } from "../../models/venue";
import { getFieldErrors } from "../../services/http-service";
import venueService from "../../services/venue-service";
import { StaffRoles } from "../../shared/enums/user";
import type { IApplicationState } from "../../store/state/app-state";
import { dateTimeIST, formatRupees, hourLabel } from "../../utils/format";
import { RatesValidationSchema } from "../../validation/venue";
import FormAlert from "../account/components/FormAlert";

const toForm = (s: IAdminSettings): IRatesFormModel => ({
  hourlyRate: s.hourlyRate,
  additionalCharge: s.additionalCharge,
  gstRate: s.gstRate,
  openHour: s.openHour,
  closeHour: s.closeHour,
  minHours: s.minHours,
  maxHours: s.maxHours,
  advanceDays: s.advanceDays,
});

const RatesAndCharges = () => {
  const isAdmin = useSelector((state: IApplicationState) => state.UserData.role === StaffRoles.Admin);
  const [settings, setSettings] = useState<IAdminSettings | null>(null);

  useEffect(() => {
    venueService.getSettings().then((response) => setSettings(response.data)).catch(() => undefined);
  }, []);

  const handleSubmit = async (values: IRatesFormModel, helpers: FormikHelpers<IRatesFormModel>) => {
    const body = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v)]));
    await venueService
      .updateSettings(body)
      .then((response) => {
        setSettings(response.data);
        helpers.resetForm({ values: toForm(response.data) });
        toast.success(`Rates saved. The booking site now shows ${formatRupees(response.data.hourlyRate)}/hr.`);
      })
      .catch((err) => {
        const fieldErrors = getFieldErrors(err);
        if (Object.keys(fieldErrors).length) helpers.setErrors(fieldErrors);
        else toast.error((err?.response?.data?.message as string) ?? "Could not save rates");
      });
  };

  if (!settings) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </section>
    );
  }

  const p = settings.preview;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rates & charges</h1>
        <p className="text-sm text-default-700">Changes apply to new bookings on the customer site and at the counter straight away. Last updated {dateTimeIST(settings.updatedAt)}.</p>
      </div>

      {!isAdmin && (
        <FormAlert tone="info">
          <span className="inline-flex items-center gap-2"><FiLock className="h-4 w-4" aria-hidden /> View only. Ask an admin to change rates.</span>
        </FormAlert>
      )}

      <Formik initialValues={toForm(settings)} onSubmit={handleSubmit} validationSchema={RatesValidationSchema} enableReinitialize>
        {({ isSubmitting, dirty, resetForm }) => (
          <Form noValidate className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <Card shadow="sm" fullWidth>
                <CardBody className="space-y-4 p-5">
                  <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Field name="hourlyRate" type="number" placeholder="e.g. 900" label="Hourly rate" labelPlacement="outside" startContent={<span className="text-sm text-default-700">₹</span>} disabled={!isAdmin} component={Input} />
                    <Field name="additionalCharge" type="number" placeholder="0" label="Additional charge (per booking)" labelPlacement="outside" startContent={<span className="text-sm text-default-700">₹</span>} disabled={!isAdmin} component={Input} />
                    <Field name="gstRate" type="number" placeholder="0" label="GST % (0 = off)" labelPlacement="outside" endContent={<span className="text-sm text-default-700">%</span>} disabled={!isAdmin} component={Input} />
                  </div>
                  <p className="text-xs text-default-700">Same flat rate at every hour. GST applies to the hourly charge after discounts plus the additional charge.</p>
                </CardBody>
              </Card>

              <Card shadow="sm" fullWidth>
                <CardBody className="space-y-4 p-5">
                  <h2 className="text-lg font-semibold text-foreground">Booking rules</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field name="openHour" type="number" placeholder="0" label="Opens at (hour 0–23)" labelPlacement="outside" disabled={!isAdmin} component={Input} />
                    <Field name="closeHour" type="number" placeholder="24" label="Closes at (hour 1–24)" labelPlacement="outside" disabled={!isAdmin} component={Input} />
                    <Field name="advanceDays" type="number" placeholder="14" label="Book up to (days ahead)" labelPlacement="outside" disabled={!isAdmin} component={Input} />
                    <Field name="minHours" type="number" placeholder="1" label="Minimum hours per booking" labelPlacement="outside" disabled={!isAdmin} component={Input} />
                    <Field name="maxHours" type="number" placeholder="24" label="Maximum hours per booking" labelPlacement="outside" disabled={!isAdmin} component={Input} />
                  </div>
                  <p className="text-xs text-default-700">
                    Currently open {settings.openHour === 0 && settings.closeHour === 24 ? "24 hours" : `${hourLabel(settings.openHour)} – ${hourLabel(settings.closeHour)}`}. Use 0 and 24 for round-the-clock.
                  </p>
                </CardBody>
              </Card>

              {isAdmin && (
                <div className="flex gap-2">
                  <Button type="submit" isLoading={isSubmitting} disabled={!dirty}>Save rates</Button>
                  <Button variant="light" disabled={!dirty || isSubmitting} onClick={() => resetForm()}>Discard changes</Button>
                </div>
              )}
            </div>

            <Card shadow="sm" fullWidth className="bg-primary-900 text-white xl:sticky xl:top-[90px]">
              <CardBody className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Customer preview</p>
                <h2 className="text-lg font-semibold">1 hour booking example</h2>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-white/70">Hourly booking charge</span><span>{formatRupees(p.hourlyBookingCharge)}</span></div>
                  <div className="flex justify-between"><span className="text-white/70">Additional charges</span><span>{formatRupees(p.additionalCharge)}</span></div>
                  <div className="flex justify-between"><span className="text-white/70">Taxes</span><span>{formatRupees(p.taxes)}</span></div>
                </div>
                <div className="flex justify-between border-t border-dashed border-white/25 pt-3 text-lg font-bold">
                  <span>Total payable</span><span className="text-secondary">{formatRupees(p.totalPayable)}</span>
                </div>
                <p className="text-xs text-white/60">Updates after you save.</p>
              </CardBody>
            </Card>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default RatesAndCharges;
