import * as Yup from "yup";
import messages from "../../shared/constants/messages";
import { RegularExpression } from "../../shared/constants/regular-expression";

export const emailField = Yup.string().trim().required("Email is required").matches(RegularExpression.Email, messages.InvalidEmail);

export const staffPasswordField = Yup.string().required("Password is required").matches(RegularExpression.StaffPassword, messages.PasswordRules);

const confirmField = (ref: string) =>
  Yup.string().required("Please confirm the password").oneOf([Yup.ref(ref)], messages.PasswordMismatch);

export const LoginValidationSchema = Yup.object({
  email: emailField,
  password: Yup.string().required("Password is required"),
});

export const ForgotPasswordValidationSchema = Yup.object({ email: emailField });

export const ResetPasswordValidationSchema = Yup.object({
  newPassword: staffPasswordField,
  confirmPassword: confirmField("newPassword"),
});

export const ChangePasswordValidationSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: staffPasswordField.notOneOf([Yup.ref("currentPassword")], "New password must be different from the current password"),
  confirmPassword: confirmField("newPassword"),
});
