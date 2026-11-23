import { useState } from "react";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Input } from "../../components/ui";
import type { ILoginRequestModel } from "../../models/account";
import { Routing } from "../../routes/routing";
import accountService from "../../services/account-service";
import { getErrorMessage, getErrorStatus, takeSessionExpiredFlag } from "../../services/http-service";
import messages from "../../shared/constants/messages";
import { HttpStatusCode } from "../../shared/enums/http-status-code";
import { adminLogin } from "../../store/slices/authSlice";
import type { IApplicationState } from "../../store/state/app-state";
import { LoginValidationSchema } from "../../validation/account";
import AuthShell from "./components/AuthShell";
import FormAlert from "./components/FormAlert";

const initialValues: ILoginRequestModel = { email: "", password: "" };

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const accessToken = useSelector((state: IApplicationState) => state.UserData.accessToken);
  const [sessionExpired] = useState(takeSessionExpiredFlag);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const from = (location.state as { from?: string } | null)?.from;
  const target = from && from.startsWith(import.meta.env.VITE_PATH_PREFIX) && from !== Routing.Login ? from : Routing.Dashboard;

  if (accessToken) return <Navigate to={target} replace />;

  const handleSubmit = async (values: ILoginRequestModel, helpers: FormikHelpers<ILoginRequestModel>) => {
    setError(null);
    await accountService
      .login({ email: values.email.trim(), password: values.password })
      .then((response) => {
        dispatch(adminLogin(response.data));
        toast.success(`Welcome back, ${response.data.staff.name.split(" ")[0]}`);
        navigate(target, { replace: true });
      })
      .catch((err) => {
        setError({ message: getErrorMessage(err), status: getErrorStatus(err) });
        // Clear the password without flagging the now-empty field as an error.
        helpers.setFieldValue("password", "", false);
        helpers.setFieldTouched("password", false, false);
      });
  };

  const locked = error?.status === HttpStatusCode.TooManyRequests;

  return (
    <AuthShell title="Counter desk login" subtitle="Sign in with your staff email and password.">
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={LoginValidationSchema} validateOnBlur={false}>
        {({ isSubmitting }) => (
          <Form noValidate className="flex flex-col gap-4">
            {sessionExpired && !error && <FormAlert tone="warning">{messages.SessionExpired}</FormAlert>}
            {error && (
              <FormAlert tone={locked ? "warning" : "danger"}>
                {error.message}
                {locked && <span className="mt-1 block text-xs opacity-90">Sign-in is paused for a few minutes to protect the account. You can reset your password meanwhile.</span>}
              </FormAlert>
            )}
            <Field
              name="email"
              type="email"
              label="Email"
              labelPlacement="outside"
              placeholder="you@riverside.example"
              autoComplete="username"
              autoFocus
              component={Input}
            />
            <Field
              name="password"
              type="password"
              label="Password"
              labelPlacement="outside"
              placeholder="Enter your password"
              autoComplete="current-password"
              isPasswordToggle
              component={Input}
            />
            <div className="-mt-1 text-right">
              <Link to={Routing.ForgotPassword} className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button fullWidth type="submit" isLoading={isSubmitting} className="justify-center text-base font-semibold">
              Sign in
            </Button>
            <p className="text-center text-xs text-default-700">5 wrong attempts lock the account for 15 minutes.</p>
          </Form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default Login;
