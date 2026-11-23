import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FiEdit, FiKey, FiUserPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { TanstackTable } from "../../components/custom-table/TanstackTable";
import { Avatar, Button, Card, CardBody, Chip, ConfirmModal, Modal, Switch, Tooltip } from "../../components/ui";
import type { IStaff } from "../../models/staff";
import { getErrorMessage } from "../../services/http-service";
import staffService from "../../services/staff-service";
import { StaffRoleLabel } from "../../shared/enums/user";
import { handleTableLoader } from "../../store/slices/generalSlice";
import type { IApplicationState } from "../../store/state/app-state";
import { dateTimeIST } from "../../utils/format";
import SetPasswordModal from "./SetPasswordModal";
import StaffForm from "./StaffForm";

const AllStaff = () => {
  const dispatch = useDispatch();
  const myId = useSelector((state: IApplicationState) => state.UserData.id);
  const [staff, setStaff] = useState<IStaff[]>([]);
  const [editing, setEditing] = useState<IStaff | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [passwordFor, setPasswordFor] = useState<IStaff | null>(null);
  const [toggleFor, setToggleFor] = useState<IStaff | null>(null);

  const getStaff = useCallback(async () => {
    dispatch(handleTableLoader(true));
    await staffService
      .getAllStaff()
      .then((response) => setStaff(response.data))
      .catch(() => undefined)
      .finally(() => dispatch(handleTableLoader(false)));
  }, [dispatch]);

  useEffect(() => {
    getStaff();
  }, [getStaff]);

  const confirmToggle = async () => {
    const target = toggleFor;
    setToggleFor(null);
    if (!target) return;
    await staffService
      .updateStaff(target.id, { active: !target.active })
      .then((response) => {
        toast.success(response.data.active ? `${response.data.name} can log in again` : `${response.data.name} deactivated and signed out`);
        getStaff();
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  };

  const columns: ColumnDef<IStaff>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar size="sm" name={row.original.name} color={row.original.active ? "primary" : "default"} />
            <div>
              <p className="font-medium">
                {row.original.name} {row.original.id === myId && <span className="text-xs text-default-700">(you)</span>}
              </p>
              <p className="text-xs text-default-700">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Chip size="sm" variant="flat" color={row.original.role === "admin" ? "primary" : "default"}>
            {StaffRoleLabel[row.original.role]}
          </Chip>
        ),
      },
      { accessorKey: "lastLoginAt", header: "Last login", cell: ({ row }) => <span className="whitespace-nowrap text-sm">{row.original.lastLoginAt ? dateTimeIST(row.original.lastLoginAt) : "Never"}</span> },
      {
        accessorKey: "active",
        header: "Active",
        meta: { align: "center" },
        cell: ({ row }) => {
          const self = row.original.id === myId;
          const control = (
            <div className="flex justify-center">
              <Switch size="sm" color="success" value={row.original.active} disabled={self} onChange={() => setToggleFor(row.original)} />
            </div>
          );
          return self ? <Tooltip content="You can't deactivate your own account">{control}</Tooltip> : control;
        },
      },
      {
        id: "actions",
        header: "Actions",
        meta: { align: "center" },
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <Button isIconOnly size="sm" radius="full" variant="light" color="primary" title="Edit" onClick={() => { setEditing(row.original); setFormOpen(true); }}>
              <FiEdit className="h-4 w-4" aria-hidden />
            </Button>
            <Button isIconOnly size="sm" radius="full" variant="light" color="warning" title="Set password" onClick={() => setPasswordFor(row.original)}>
              <FiKey className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        ),
      },
    ],
    [myId],
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff accounts</h1>
          <p className="text-sm text-default-700">Admins can do everything. Counter staff get the desk, bookings, customers, SMS log and QR.</p>
        </div>
        <Button startContent={<FiUserPlus className="h-4 w-4" />} onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add staff
        </Button>
      </div>

      <Card shadow="sm" fullWidth>
        <CardBody className="p-0">
          <TanstackTable data={staff} columns={columns} />
        </CardBody>
      </Card>

      <Modal openDialog={formOpen} handleDialogClose={() => setFormOpen(false)} title={editing ? `Edit ${editing.name}` : "Add staff account"} size="lg" backdrop="blur">
        {formOpen && (
          <StaffForm
            staff={editing}
            isSelf={editing?.id === myId}
            handleDialogClose={() => setFormOpen(false)}
            onStaffSaved={() => {
              setFormOpen(false);
              getStaff();
            }}
          />
        )}
      </Modal>

      {passwordFor && <SetPasswordModal staff={passwordFor} openDialog handleDialogClose={() => setPasswordFor(null)} />}

      <ConfirmModal
        title={toggleFor?.active ? "Deactivate account?" : "Reactivate account?"}
        message={
          toggleFor?.active
            ? `${toggleFor?.name} will be signed out immediately and won't be able to log in.`
            : `${toggleFor?.name ?? ""} will be able to log in again with their password.`
        }
        openDialog={!!toggleFor}
        handleDialogClose={() => setToggleFor(null)}
        handleSuccess={confirmToggle}
        confirmText={toggleFor?.active ? "Deactivate" : "Reactivate"}
        cancelText="Cancel"
        type={toggleFor?.active ? "danger" : "info"}
      />
    </section>
  );
};

export default AllStaff;
