import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FiCopy, FiExternalLink, FiPrinter } from "react-icons/fi";
import { toast } from "react-toastify";
import { Button, Card, CardBody, Skeleton } from "../../components/ui";
import venueService from "../../services/venue-service";

const CounterQr = () => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    venueService.getQrLink().then((response) => setUrl(response.data.url)).catch(() => undefined);
  }, []);

  return (
    <section className="space-y-5">
      <style>{`@media print { body * { visibility: hidden; } #counter-qr-print, #counter-qr-print * { visibility: visible; } #counter-qr-print { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; } }`}</style>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Counter QR</h1>
        <p className="text-sm text-default-700">Print this and keep it at the desk. Customers scan it to book and pay online themselves, so the queue moves faster.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[auto_1fr]">
        <Card shadow="sm" fullWidth>
          <CardBody className="p-6">
            <div id="counter-qr-print" className="flex w-[300px] flex-col items-center gap-4 rounded-2xl bg-primary-900 p-6 text-center text-white">
              <div className="flex items-center gap-2">
                <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-lg" />
                <p className="font-display text-xl font-extrabold">
                  The <span className="text-secondary">Riverside</span> Cricket Box
                </p>
              </div>
              {url ? (
                <div className="rounded-2xl bg-white p-4">
                  <QRCodeSVG value={url} size={220} level="M" />
                </div>
              ) : (
                <Skeleton className="h-[252px] w-[252px] rounded-2xl" />
              )}
              <div>
                <p className="font-display text-2xl font-extrabold uppercase">Scan to book</p>
                <p className="text-sm text-white/70">Live slots · Pay by UPI or card · Instant SMS</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card shadow="sm" fullWidth>
          <CardBody className="space-y-4 p-5">
            <h2 className="text-lg font-semibold text-foreground">Link</h2>
            <p className="break-all rounded-xl bg-default-50 px-4 py-3 font-mono text-sm">{url ?? "Loading…"}</p>
            <div className="flex flex-wrap gap-2">
              <Button startContent={<FiPrinter className="h-4 w-4" />} disabled={!url} onClick={() => window.print()}>
                Print
              </Button>
              <Button variant="bordered" startContent={<FiCopy className="h-4 w-4" />} disabled={!url} onClick={() => url && navigator.clipboard.writeText(url).then(() => toast.success("Link copied"))}>
                Copy link
              </Button>
              {url && (
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-primary hover:bg-primary-50">
                  <FiExternalLink className="h-4 w-4" aria-hidden /> Open booking site
                </a>
              )}
            </div>
            <p className="text-xs text-default-700">Bookings made through this QR appear as "Online" in All bookings.</p>
          </CardBody>
        </Card>
      </div>
    </section>
  );
};

export default CounterQr;
