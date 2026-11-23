import { Field, Form, Formik, type FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { Button, DateInput, Input, SelectDropdown, Switch, Textarea } from "../../components/ui";
import type { IOffer, IOfferFormModel, IOfferRequest, OfferAccent } from "../../models/offer";
import { getErrorMessage, getFieldErrors } from "../../services/http-service";
import venueService from "../../services/venue-service";
import { OfferValidationSchema } from "../../validation/offer";

interface OfferFormProps {
  offer: IOffer | null;
  onOfferSaved: () => void;
  handleDialogClose: () => void;
}

const accentOptions: { value: OfferAccent; label: string; swatch: string }[] = [
  { value: "lime", label: "Lime", swatch: "#c8f23a" },
  { value: "ball", label: "Ball red", swatch: "#ff6b5c" },
  { value: "sky", label: "Sky", swatch: "#5ab8f0" },
  { value: "amber", label: "Amber", swatch: "#f2b33a" },
];

const kindOptions = [
  { value: "percent", label: "Percent off" },
  { value: "flat", label: "Flat ₹ off" },
];

const toForm = (offer: IOffer | null): IOfferFormModel => ({
  code: offer?.code ?? "",
  title: offer?.title ?? "",
  description: offer?.description ?? "",
  kind: offer?.kind ?? "percent",
  value: offer?.value ?? "",
  maxDiscount: offer?.maxDiscount ?? "",
  minSubtotal: offer?.minSubtotal || "",
  minHours: offer?.minHours ?? 1,
  weekdaysOnly: offer?.weekdaysOnly ?? false,
  accent: offer?.accent ?? "lime",
  active: offer?.active ?? true,
  validFrom: offer?.validFrom ? new Date(offer.validFrom) : null,
  validTo: offer?.validTo ? new Date(offer.validTo) : null,
});

// Picker values are "YYYY-MM-DD" (or the original Date when untouched). Offers run on India time:
// "valid from" starts at 00:00 IST and "valid until" lasts to 23:59 IST of the chosen day.
const toDate = (value: Date | string | null, edge: "start" | "end"): string | null => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  const day = value.slice(0, 10);
  return new Date(`${day}T${edge === "start" ? "00:00:00" : "23:59:59"}+05:30`).toISOString();
};

const OfferForm = ({ offer, onOfferSaved, handleDialogClose }: OfferFormProps) => {
  const isEdit = !!offer;

  const handleSubmit = async (values: IOfferFormModel, helpers: FormikHelpers<IOfferFormModel>) => {
    const body: IOfferRequest = {
      title: values.title.trim(),
      description: values.description.trim(),
      kind: values.kind,
      value: Number(values.value),
      maxDiscount: values.kind === "percent" && values.maxDiscount !== "" ? Number(values.maxDiscount) : null,
      minSubtotal: values.minSubtotal === "" ? 0 : Number(values.minSubtotal),
      minHours: values.minHours === "" ? 1 : Number(values.minHours),
      weekdaysOnly: values.weekdaysOnly,
      accent: values.accent,
      active: values.active,
      validFrom: toDate(values.validFrom, "start"),
      validTo: toDate(values.validTo, "end"),
    };
    const request = isEdit ? venueService.updateOffer(offer.id, body) : venueService.createOffer({ ...body, code: values.code.trim().toUpperCase() });
    await request
      .then((response) => {
        toast.success(isEdit ? `${response.data.code} updated` : `${response.data.code} created`);
        onOfferSaved();
      })
      .catch((err) => {
        const fieldErrors = getFieldErrors(err);
        if (Object.keys(fieldErrors).length) helpers.setErrors(fieldErrors);
        else toast.error(getErrorMessage(err));
      });
  };

  return (
    <Formik initialValues={toForm(offer)} onSubmit={handleSubmit} validationSchema={OfferValidationSchema} validateOnBlur={false}>
      {({ values, setFieldValue, isSubmitting }) => (
        <Form noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              name="code"
              label="Code"
              labelPlacement="outside"
              placeholder="NIGHT10"
              disabled={isEdit}
              isRequired
              inputClassName="font-mono uppercase"
              component={Input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue("code", e.target.value.toUpperCase())}
            />
            <Field name="title" label="Title" labelPlacement="outside" placeholder="e.g. Night owl" component={Input} />
          </div>
          {isEdit && <p className="-mt-2 text-xs text-default-700">Codes can't be changed. Create a new offer instead.</p>}
          <Field name="description" label="Description (shown to customers)" labelPlacement="outside" placeholder="10% off late games, up to ₹150." component={Textarea} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field name="kind" label="Type" component={SelectDropdown} options={kindOptions} />
            <Field
              name="value"
              type="number"
              label={values.kind === "percent" ? "Percent off" : "Amount off"}
              labelPlacement="outside"
              placeholder={values.kind === "percent" ? "e.g. 10" : "e.g. 100"}
              isRequired
              startContent={values.kind === "flat" ? <span className="text-sm text-default-700">₹</span> : undefined}
              endContent={values.kind === "percent" ? <span className="text-sm text-default-700">%</span> : undefined}
              component={Input}
            />
            {values.kind === "percent" && (
              <Field name="maxDiscount" type="number" label="Max discount (optional)" labelPlacement="outside" placeholder="No cap" startContent={<span className="text-sm text-default-700">₹</span>} component={Input} />
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field name="minHours" type="number" label="Minimum hours" labelPlacement="outside" placeholder="1" component={Input} />
            <Field name="minSubtotal" type="number" label="Minimum booking amount (optional)" labelPlacement="outside" placeholder="None" startContent={<span className="text-sm text-default-700">₹</span>} component={Input} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field name="validFrom" label="Valid from (optional)" placeholder="Any time" isClearable component={DateInput} />
            <Field name="validTo" label="Valid until (optional)" placeholder="No end date" isClearable component={DateInput} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Card colour</p>
            <div className="flex flex-wrap gap-2">
              {accentOptions.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  aria-pressed={values.accent === a.value}
                  onClick={() => setFieldValue("accent", a.value)}
                  className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm ${values.accent === a.value ? "border-primary" : "border-default-200"}`}
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: a.swatch }} /> {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            <Field name="weekdaysOnly" label="Weekdays only (Mon–Fri)" component={Switch} />
            <Field name="active" label="Active (visible to customers)" component={Switch} />
          </div>
          <div className="flex justify-end gap-2 border-t border-default-100 pt-4">
            <Button variant="light" onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{isEdit ? "Save offer" : "Create offer"}</Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default OfferForm;
