import { useState } from "react";
import { Field, Form, Formik } from "formik";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import type { IResetPasswordModel } from "../../models/account";
import { Routing } from "../../routes/routing";
import accountService from "../../services/account-service";
import { getErrorMessage } from "../../services/http-service";
import messages from "../../shared/constants/messages";
import { ResetPasswordValidationSchema } from "../../validation/account";
import AuthShell from "./components/AuthShell";
import FormAlert from "./components/FormAlert";

// Opened from the emailed link: /admin/reset-password?token=<64-hex>
const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: IResetPasswordModel) => {
    setError(null);
    await accountService
      .resetPassword(token, values.newPassword)
      .then((response) => setDoneMessage(response.data.message))
      .catch((err) => setError(getErrorMessage(err)));
  };

  if (!token) {
    return (
      <AuthShell title="Link not valid" subtitle="This reset link is incomplete. Request a new one.">
        <Link to={Routing.ForgotPassword} className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Resetting signs you out on every device and clears any login lock.">
      {doneMessage ? (
        <div className="flex flex-col gap-4">
          <FormAlert tone="success">{doneMessage}</FormAlert>
          <Link to={Routing.Login} className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
            Go to login
          </Link>
        </div>
      ) : (
        <Formik initialValues={{ newPassword: "", confirmPassword: "" }} onSubmit={handleSubmit} validationSchema={ResetPasswordValidationSchema} validateOnBlur={false}>
          {({ isSubmitting }) => (
            <Form noValidate className="flex flex-col gap-4">
              {error && (
                <FormAlert tone="danger">
                  {error}{" "}
                  <Link to={Routing.ForgotPassword} className="font-semibold underline">
                    Request a new link
                  </Link>
                </FormAlert>
              )}
              <Field name="newPassword" type="password" label="New password" labelPlacement="outside" placeholder={messages.PasswordRules} autoComplete="new-password" isPasswordToggle autoFocus component={Input} />
              <Field name="confirmPassword" type="password" label="Confirm new password" labelPlacement="outside" placeholder="Type it again" autoComplete="new-password" isPasswordToggle component={Input} />
              <Button fullWidth type="submit" isLoading={isSubmitting} className="justify-center font-semibold">
                Reset password
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
