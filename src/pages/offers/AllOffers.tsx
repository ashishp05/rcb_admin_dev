import { useCallback, useEffect, useState } from "react";
import { FiEdit, FiLock, FiPlus } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Card, CardBody, Chip, Modal, Skeleton, Switch } from "../../components/ui";
import type { IOffer } from "../../models/offer";
import venueService from "../../services/venue-service";
import { StaffRoles } from "../../shared/enums/user";
import type { IApplicationState } from "../../store/state/app-state";
import { dateTimeIST } from "../../utils/format";
import FormAlert from "../account/components/FormAlert";
import OfferForm from "./OfferForm";

const accentBorder: Record<string, string> = {
  lime: "border-l-[#c8f23a]",
  ball: "border-l-[#ff6b5c]",
  sky: "border-l-[#5ab8f0]",
  amber: "border-l-[#f2b33a]",
};

const isExpired = (o: IOffer) => !!o.validTo && new Date(o.validTo) < new Date();
const isScheduled = (o: IOffer) => !!o.validFrom && new Date(o.validFrom) > new Date();

const rules = (o: IOffer) =>
  [
    o.minHours > 1 && `Min ${o.minHours} hrs`,
    o.weekdaysOnly && "Mon–Fri only",
    o.minSubtotal > 0 && `Min ₹${o.minSubtotal}`,
    o.kind === "percent" && o.maxDiscount && `Up to ₹${o.maxDiscount}`,
  ].filter(Boolean) as string[];

const AllOffers = () => {
  const isAdmin = useSelector((state: IApplicationState) => state.UserData.role === StaffRoles.Admin);
  const [offers, setOffers] = useState<IOffer[] | null>(null);
  const [editing, setEditing] = useState<IOffer | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const getOffers = useCallback(async () => {
    await venueService.getAllOffers().then((response) => setOffers(response.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    getOffers();
  }, [getOffers]);

  const toggleActive = async (offer: IOffer, active: boolean) => {
    setOffers((list) => list?.map((o) => (o.id === offer.id ? { ...o, active } : o)) ?? null);
    await venueService
      .updateOffer(offer.id, { active })
      .then(() => toast.success(`${offer.code} turned ${active ? "on" : "off"}`))
      .catch(() => {
        toast.error(`Could not update ${offer.code}`);
        getOffers();
      });
  };

  const openForm = (offer: IOffer | null) => {
    setEditing(offer);
    setOpenDialog(true);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offers</h1>
          <p className="text-sm text-default-700">Active offers appear under "Offers for you" on the booking site and can be used at the counter.</p>
        </div>
        {isAdmin && (
          <Button startContent={<FiPlus className="h-4 w-4" />} onClick={() => openForm(null)}>
            New offer
          </Button>
        )}
      </div>

      {!isAdmin && (
        <FormAlert tone="info">
          <span className="inline-flex items-center gap-2"><FiLock className="h-4 w-4" aria-hidden /> View only. Ask an admin to add or change offers.</span>
        </FormAlert>
      )}

      {!offers ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : offers.length === 0 ? (
        <Card shadow="sm" fullWidth><CardBody className="py-12 text-center text-default-700">No offers yet.</CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((o) => (
            <Card key={o.id} shadow="sm" fullWidth className={`border-l-4 ${accentBorder[o.accent] ?? accentBorder.lime} ${o.active ? "" : "opacity-70"}`}>
              <CardBody className="flex h-full flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-3xl font-extrabold leading-none text-foreground">{o.label}</span>
                  {isAdmin ? (
                    <Switch size="sm" color="success" value={o.active} onChange={(checked) => toggleActive(o, checked)} />
                  ) : (
                    <Chip size="sm" variant="dot" color={o.active ? "success" : "default"}>{o.active ? "Active" : "Off"}</Chip>
                  )}
                </div>
                <p className="font-semibold text-foreground">{o.title || o.code}</p>
                {o.description && <p className="text-sm text-default-700">{o.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {rules(o).map((r) => <Chip key={r} size="sm" variant="flat">{r}</Chip>)}
                  {isExpired(o) && <Chip size="sm" variant="flat" color="danger">Expired</Chip>}
                  {isScheduled(o) && <Chip size="sm" variant="flat" color="warning">Starts {dateTimeIST(o.validFrom)}</Chip>}
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="rounded-lg border-2 border-dashed border-default-300 px-3 py-1 font-mono text-sm font-bold tracking-wider">{o.code}</span>
                  {isAdmin && (
                    <Button size="sm" variant="light" startContent={<FiEdit className="h-4 w-4" />} onClick={() => openForm(o)}>
                      Edit
                    </Button>
                  )}
                </div>
                {o.validTo && !isExpired(o) && <p className="text-xs text-default-700">Valid until {dateTimeIST(o.validTo)}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal openDialog={openDialog} handleDialogClose={() => setOpenDialog(false)} title={editing ? `Edit ${editing.code}` : "New offer"} size="2xl" backdrop="blur" scrollBehavior="inside">
        {openDialog && (
          <OfferForm
            offer={editing}
            handleDialogClose={() => setOpenDialog(false)}
            onOfferSaved={() => {
              setOpenDialog(false);
              getOffers();
            }}
          />
        )}
      </Modal>
    </section>
  );
};

export default AllOffers;
