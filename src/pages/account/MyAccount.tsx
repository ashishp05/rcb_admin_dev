import { useState } from "react";
import { FiLogOut, FiSmartphone } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Avatar, Button, Card, CardBody, Chip, ConfirmModal, Tabs } from "../../components/ui";
import { Routing } from "../../routes/routing";
import accountService from "../../services/account-service";
import messages from "../../shared/constants/messages";
import { StaffRoleLabel } from "../../shared/enums/user";
import { adminLogout } from "../../store/slices/authSlice";
import type { IApplicationState } from "../../store/state/app-state";
import ChangePassword from "./ChangePassword";

const MyAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: IApplicationState) => state.UserData);
  const [tab, setTab] = useState<string>((location.state as { tab?: string } | null)?.tab ?? "profile");
  const [confirmAll, setConfirmAll] = useState(false);

  const logoutEverywhere = async () => {
    setConfirmAll(false);
    await accountService
      .logoutAll()
      .then(() => {
        dispatch(adminLogout());
        toast.success("Signed out on every device.");
        navigate(Routing.Login, { replace: true });
      })
      .catch(() => undefined);
  };

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">My account</h1>

      <Card shadow="sm" fullWidth>
        <CardBody className="flex flex-row items-center gap-4 p-5">
          <Avatar size="lg" name={user.name} color="primary" isBordered />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-sm text-default-700">{user.email}</p>
            {user.role && (
              <Chip size="sm" variant="flat" color={user.role === "admin" ? "primary" : "default"} className="mt-1">
                {StaffRoleLabel[user.role]}
              </Chip>
            )}
          </div>
        </CardBody>
      </Card>

      <Tabs
        variant="underlined"
        selectedKey={tab}
        onSelectionChange={setTab}
        items={[
          {
            id: "profile",
            label: "Profile",
            content: (
              <Card shadow="sm" fullWidth>
                <CardBody className="space-y-2 p-5 text-sm">
                  <p className="text-default-700">Your name, email and role are managed by an admin from <strong>Staff accounts</strong>.</p>
                  <p className="text-default-700">
                    {user.role === "admin"
                      ? "As an admin you can change rates, offers and staff accounts."
                      : "As counter staff you can take walk-ins, manage bookings and view customers. Rates and offers are read-only."}
                  </p>
                </CardBody>
              </Card>
            ),
          },
          {
            id: "password",
            label: "Change password",
            content: (
              <Card shadow="sm" fullWidth>
                <CardBody className="p-5">
                  <p className="mb-4 text-sm text-default-700">Changing your password signs out every other device. You stay signed in here.</p>
                  <ChangePassword />
                </CardBody>
              </Card>
            ),
          },
          {
            id: "sessions",
            label: "Signed-in devices",
            content: (
              <Card shadow="sm" fullWidth>
                <CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <FiSmartphone className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
                    <div>
                      <p className="font-semibold text-foreground">Sign out everywhere</p>
                      <p className="text-sm text-default-700">Lost a phone or used a shared counter PC? End every session for your account, including this one.</p>
                    </div>
                  </div>
                  <Button color="danger" variant="bordered" startContent={<FiLogOut className="h-4 w-4" />} onClick={() => setConfirmAll(true)}>
                    Sign out all devices
                  </Button>
                </CardBody>
              </Card>
            ),
          },
        ]}
      />

      <ConfirmModal
        title="Sign out all devices?"
        message={messages.LogoutAllConfirm}
        openDialog={confirmAll}
        handleDialogClose={() => setConfirmAll(false)}
        handleSuccess={logoutEverywhere}
        confirmText="Sign out all"
        cancelText="Cancel"
        type="warning"
      />
    </section>
  );
};

export default MyAccount;
