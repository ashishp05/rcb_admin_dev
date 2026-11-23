import { useEffect, useState } from "react";

// Seconds until an ISO instant, re-rendering every second. null when there is no target.
export const useSecondsLeft = (target: string | null | undefined): number | null => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  return target ? Math.max(0, Math.round((new Date(target).getTime() - now) / 1000)) : null;
};
