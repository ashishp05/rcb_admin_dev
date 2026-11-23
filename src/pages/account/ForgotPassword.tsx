import { useState } from "react";
import { Field, Form, Formik } from "formik";
import { FaChevronLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import type { IForgotPasswordEmailModel } from "../../models/account";
import { Routing } from "../../routes/routing";
import accountService from "../../services/account-service";
import { getErrorMessage } from "../../services/http-service";
import { ForgotPasswordValidationSchema } from "../../validation/account";
import AuthShell from "./components/AuthShell";
import FormAlert from "./components/FormAlert";

const ForgotPassword = () => {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: IForgotPasswordEmailModel) => {
    setError(null);
    await accountService
      .forgotPassword(values.email.trim())
      .then((response) => setSentMessage(response.data.message))
      .catch((err) => setError(getErrorMessage(err)));
  };

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to set a new password. The link works for 30 minutes.">
      {sentMessage ? (
        <div className="flex flex-col gap-4">
          <FormAlert tone="success">{sentMessage}</FormAlert>
          <p className="text-sm text-default-700">Check your inbox and spam folder. No email? Ask an admin to set a new password for you from Staff accounts.</p>
          <Link to={Routing.Login} className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-default-300 text-sm font-semibold text-foreground hover:bg-default-100">
            Back to login
          </Link>
        </div>
      ) : (
        <Formik initialValues={{ email: "" }} onSubmit={handleSubmit} validationSchema={ForgotPasswordValidationSchema} validateOnBlur={false}>
          {({ isSubmitting }) => (
            <Form noValidate className="flex flex-col gap-4">
              {error && <FormAlert tone="danger">{error}</FormAlert>}
              <Field name="email" type="email" label="Email" labelPlacement="outside" placeholder="you@riverside.example" autoComplete="username" autoFocus component={Input} />
              <Button fullWidth type="submit" isLoading={isSubmitting} className="justify-center font-semibold">
                Send reset link
              </Button>
              <Link to={Routing.Login} className="inline-flex items-center justify-center gap-2 text-sm font-medium text-default-700 hover:text-primary">
                <FaChevronLeft className="h-3 w-3" aria-hidden /> Back to login
              </Link>
            </Form>
          )}
        </Formik>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
