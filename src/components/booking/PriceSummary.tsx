import type { IPrice } from "../../models/booking";
import { formatRupees, hoursText } from "../../utils/format";

// Renders the server's Price object; the panel never calculates prices itself.
const PriceSummary = ({ price }: { price: IPrice }) => {
  const row = "flex justify-between gap-3 py-1 text-sm";
  return (
    <div>
      <div className={row}>
        <span className="text-default-700">
          {hoursText(price.hours)} × {formatRupees(price.hourlyRate)}
        </span>
        <span>{formatRupees(price.subtotal)}</span>
      </div>
      {price.discount > 0 && (
        <div className={row}>
          <span className="text-default-700">Offer {price.couponCode && <span className="font-mono">({price.couponCode})</span>}</span>
          <span className="text-success-700">− {formatRupees(price.discount)}</span>
        </div>
      )}
      {price.platformFee > 0 && (
        <div className={row}>
          <span className="text-default-700">Additional charges</span>
          <span>{formatRupees(price.platformFee)}</span>
        </div>
      )}
      {price.taxes > 0 && (
        <div className={row}>
          <span className="text-default-700">GST ({price.gstRate}%)</span>
          <span>{formatRupees(price.taxes)}</span>
        </div>
      )}
      <div className="mt-2 flex justify-between gap-3 border-t border-dashed border-default-300 pt-2 text-base font-bold">
        <span>Total</span>
        <span>{formatRupees(price.total)}</span>
      </div>
    </div>
  );
};

export default PriceSummary;
