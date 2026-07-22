import { useCallback, useEffect, useRef, useState } from "react";
import { get } from "../utils/api";
import { useToast } from "../context/ToastContext";

const POLL_INTERVAL_MS = 10000;

/**
 * Keeps a provider's booking requests fresh without a manual page
 * refresh — this is what item #6 ("Provider Requests Auto Refresh")
 * is built on.
 *
 * Implemented as polling for now. To swap to WebSockets later,
 * replace the body of this hook with a socket.io subscription (e.g.
 * `socket.on("booking:new", (b) => setBookings(prev => [b, ...prev]))`
 * and `socket.on("booking:updated", ...)`) — every screen that uses
 * this hook (ProviderDashboard) keeps working unchanged, since the
 * returned shape (`bookings`, `setBookings`, `profile`, `setProfile`,
 * `loading`, `refresh`) stays the same either way.
 */
export const useProviderRequestsFeed = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const seenPendingIds = useRef(new Set());
  const hasSeeded = useRef(false);

  const fetchOnce = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          get("/booking/provider-bookings"),
          get("/user/provider/profile"),
        ]);
        const list = bookingsRes?.bookings || [];
        setBookings(list);
        setProfile(profileRes?.provider || null);

        // Surface genuinely new incoming requests even if the
        // provider isn't staring at the screen when they arrive.
        const pendingNow = list.filter((b) => b.status === "Pending");
        if (!hasSeeded.current) {
          pendingNow.forEach((b) => seenPendingIds.current.add(b._id));
          hasSeeded.current = true;
        } else {
          pendingNow
            .filter((b) => !seenPendingIds.current.has(b._id))
            .forEach((b) => {
              seenPendingIds.current.add(b._id);
              toast.info(`New request: ${b?.service?.serviceName || "Service"}`);
            });
        }
      } catch (error) {
        if (!isBackground) {
          console.error("Failed to load provider dashboard:", error);
        }
        // Background polls fail silently — the next poll retries,
        // and we don't want a toast firing every 10s if the network
        // hiccups.
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchOnce(false);
    const interval = setInterval(() => fetchOnce(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    bookings,
    setBookings,
    profile,
    setProfile,
    loading,
    refresh: () => fetchOnce(false),
  };
};
