import { useEffect, useState } from "react";
import { get } from "../utils/api";

const POLL_INTERVAL_MS = 15000;

/**
 * Polls a specific provider's live availability so a customer who's
 * viewing their profile or mid-way through booking finds out
 * immediately if that provider goes Busy — instead of only
 * discovering it after submitting and getting a confusing failure.
 */
export const useProviderAvailability = (providerId) => {
  const [availabilityStatus, setAvailabilityStatus] = useState(null);

  useEffect(() => {
    if (!providerId) return;
    let cancelled = false;

    const check = async () => {
      try {
        // Reuses the nearby-search list (there's no dedicated
        // "get provider by id" route) filtered down to this one.
        const res = await get(`/user/providers/nearby?maxDistance=50000`);
        const found = (res?.providers || []).find((p) => p._id === providerId);
        if (!cancelled) {
          setAvailabilityStatus(found?.providerDetails?.availabilityStatus || null);
        }
      } catch {
        // silent — keep showing whatever we last knew rather than
        // flashing an error for a background availability check
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [providerId]);

  return {
    availabilityStatus,
    isBusy: availabilityStatus === "BUSY",
    isOffline: availabilityStatus === "OFFLINE",
  };
};
