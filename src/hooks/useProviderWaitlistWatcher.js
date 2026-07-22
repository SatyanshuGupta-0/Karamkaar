import { useEffect, useRef } from "react";
import { get } from "../utils/api";
import { getWaitlist, removeFromWaitlist } from "../utils/providerWaitlist";
import { useNotifications } from "../context/NotificationContext";
import { isAuthenticated } from "../utils/auth";

const POLL_INTERVAL_MS = 20000;

/**
 * Item #10: "if a provider becomes available again after being
 * busy, automatically generate a notification for users who were
 * previously waiting." Checks everyone on the local waitlist
 * (utils/providerWaitlist.js) every 20s; the moment one of them is
 * no longer Busy, fires a notification (which also triggers the OS
 * push notification, since NotificationContext.addNotification
 * already does that) and drops them off the list so they don't get
 * notified again next poll.
 */
export const useProviderWaitlistWatcher = () => {
  const { addNotification } = useNotifications();
  const pollRef = useRef(null);

  useEffect(() => {
    const check = async () => {
      const waitlist = getWaitlist();
      if (!isAuthenticated() || waitlist.length === 0) return;

      try {
        const res = await get(`/user/providers/nearby?maxDistance=50000`);
        const providers = res?.providers || [];

        waitlist.forEach((entry) => {
          const current = providers.find((p) => p._id === entry.providerId);
          const status = current?.providerDetails?.availabilityStatus;
          if (status && status !== "BUSY") {
            removeFromWaitlist(entry.providerId);
            addNotification({
              type: "PROVIDER_AVAILABLE",
              title: "Provider Available",
              providerId: entry.providerId,
              message: `${entry.providerName || "Your provider"} is available again — you can book them now.`,
            });
          }
        });
      } catch {
        // silent — try again next poll
      }
    };

    check();
    pollRef.current = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
