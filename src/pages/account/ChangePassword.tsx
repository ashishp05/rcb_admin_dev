import React from "react";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Button, Input } from "../../components/ui";
import type { IChangePasswordModel } from "../../models/account";
import accountService from "../../services/account-service";
import { getErrorMessage, getFieldErrors } from "../../services/http-service";
import messages from "../../shared/constants/messages";
import { adminLogin } from "../../store/slices/authSlice";
import { ChangePasswordValidationSchema } from "../../validation/account";
import FormAlert from "./components/FormAlert";

interface ChangePasswordFormProps {
  onDone?: () => void;
}

const initialValues: IChangePasswordModel = { currentPassword: "", newPassword: "", confirmPassword: "" };

const ChangePassword: React.FC<ChangePasswordFormProps> = ({ onDone }) => {
  const dispatch = useDispatch();
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (values: IChangePasswordModel, helpers: FormikHelpers<IChangePasswordModel>) => {
    setError(null);
    await accountService
      .changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      .then((response) => {
        // Every other device is signed out; this device continues with the new token.
        dispatch(adminLogin(response.data));
        toast.success("Password changed. Other devices have been signed out.");
        helpers.resetForm();
        onDone?.();
      })
      .catch((err) => {
        const fieldErrors = getFieldErrors(err);
        if (Object.keys(fieldErrors).length) helpers.setErrors(fieldErrors);
        else setError(getErrorMessage(err));
      });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={ChangePasswordValidationSchema} validateOnBlur={false}>
      {({ isSubmitting }) => (
        <Form noValidate className="flex max-w-md flex-col gap-4">
          {error && <FormAlert tone="danger">{error}</FormAlert>}
          <Field name="currentPassword" type="password" label="Current password" labelPlacement="outside" placeholder="Your current password" autoComplete="current-password" isPasswordToggle component={Input} />
          <Field name="newPassword" type="password" label="New password" labelPlacement="outside" placeholder={messages.PasswordRules} autoComplete="new-password" isPasswordToggle component={Input} />
          <Field name="confirmPassword" type="password" label="Confirm new password" labelPlacement="outside" placeholder="Type it again" autoComplete="new-password" isPasswordToggle component={Input} />
          <div>
            <Button type="submit" isLoading={isSubmitting}>
              Change password
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePassword;
