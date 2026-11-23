import * as Yup from "yup";
import { emailField, ResetPasswordValidationSchema, staffPasswordField } from "../account";

const nameField = Yup.string().trim().required("Name is required").min(2, "Name must be at least 2 characters").max(80, "Name cannot exceed 80 characters");

export const CreateStaffValidationSchema = Yup.object({
  name: nameField,
  email: emailField,
  role: Yup.string().oneOf(["admin", "staff"]).required(),
  password: staffPasswordField,
});

export const EditStaffValidationSchema = Yup.object({
  name: nameField,
  role: Yup.string().oneOf(["admin", "staff"]).required(),
});

export const SetPasswordValidationSchema = ResetPasswordValidationSchema;
