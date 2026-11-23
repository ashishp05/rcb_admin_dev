import * as Yup from "yup";

const whole = (min: number, max: number) =>
  Yup.number().typeError("Enter a whole number").required("Required").integer("Enter a whole number").min(min, `At least ${min}`).max(max, `At most ${max}`);

export const RatesValidationSchema = Yup.object({
  hourlyRate: Yup.number().typeError("Enter an amount").required("Required").min(0, "Cannot be negative").max(1000000),
  additionalCharge: Yup.number().typeError("Enter an amount").required("Required").min(0, "Cannot be negative").max(1000000),
  gstRate: Yup.number().typeError("Enter a percent").required("Required").min(0, "Cannot be negative").max(28, "GST cannot exceed 28%"),
  openHour: whole(0, 23),
  closeHour: whole(1, 24).moreThan(Yup.ref("openHour"), "Closing must be after opening"),
  minHours: whole(1, 24),
  maxHours: whole(1, 24).min(Yup.ref("minHours"), "Must be at least the minimum"),
  advanceDays: whole(0, 365),
});
