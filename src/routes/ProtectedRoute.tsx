import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import type { StaffRole } from "../models/staff";
import messages from "../shared/constants/messages";
import type { IApplicationState } from "../store/state/app-state";
import { Routing } from "./routing";

interface ProtectedRouteProps {
  element: ReactNode;
  // Restrict to these roles; others see an access notice (the API would answer 403 anyway).
  roles?: StaffRole[];
}

const ProtectedRoute = ({ element, roles }: ProtectedRouteProps) => {
  const location = useLocation();
  const user = useSelector((state: IApplicationState) => state.UserData);
  const isAuthenticated = Boolean(user?.accessToken && user?.id);

  if (!isAuthenticated) {
    return <Navigate to={Routing.Login} replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && (user.role === "" || !roles.includes(user.role))) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-50 text-warning-700">
          <FiLock className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="text-xl font-semibold text-foreground">Admins only</h1>
        <p className="max-w-sm text-sm text-default-700">{messages.AdminOnly}</p>
      </section>
    );
  }

  return <>{element}</>;
};

export default ProtectedRoute;
