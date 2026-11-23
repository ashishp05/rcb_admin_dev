import * as Yup from "yup";
import { RegularExpression } from "../../shared/constants/regular-expression";

const optionalNumber = (message: string) =>
  Yup.number()
    .transform((value, original) => (original === "" || original === null ? undefined : value))
    .typeError(message);

export const OfferValidationSchema = Yup.object({
  code: Yup.string().trim().required("Code is required").matches(RegularExpression.OfferCode, "3–32 characters: letters, digits, - and _"),
  title: Yup.string().trim().max(60, "Title cannot exceed 60 characters"),
  description: Yup.string().trim().max(200, "Description cannot exceed 200 characters"),
  kind: Yup.string().oneOf(["flat", "percent"]).required(),
  value: Yup.number()
    .typeError("Enter a number")
    .required("Value is required")
    .positive("Must be more than 0")
    .when("kind", { is: "percent", then: (schema) => schema.max(100, "Percent cannot exceed 100") }),
  maxDiscount: optionalNumber("Enter a number").positive("Must be more than 0"),
  minSubtotal: optionalNumber("Enter a number").min(0, "Cannot be negative"),
  minHours: optionalNumber("Enter a whole number").integer("Enter a whole number").min(1, "At least 1").max(24, "At most 24"),
  validFrom: Yup.date().nullable(),
  validTo: Yup.date()
    .nullable()
    .when("validFrom", ([from], schema) => (from ? schema.min(from, "Must be after the start date") : schema)),
});
