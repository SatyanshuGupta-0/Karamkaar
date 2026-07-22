import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, put, updateProviderLocation } from "../utils/api";
import { distanceKm, getCurrentRole } from "../utils/auth";
import TrackingHeader from "../components/tracking/TrackingHeader";
import TrackingMap from "../components/tracking/TrackingMap";
import TrackingBottomSheet from "../components/tracking/TrackingBottomSheet";
import ProviderTimeoutModal from "../components/tracking/ProviderTimeoutModal";
import BookingCancelledModal from "../components/tracking/BookingCancelledModal";
import CancelBookingModal from "../components/booking/CancelBookingModal";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";

const POLL_INTERVAL_MS = 8000;
const LOCATION_SEND_MIN_INTERVAL_MS = 5000;
const RESPONSE_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

const TrackBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const isProvider = getCurrentRole() === "PROVIDER";

  const [userLocation, setUserLocation] = useState(null);
  const [myLiveLocation, setMyLiveLocation] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [responseDeadline, setResponseDeadline] = useState(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const hasNotifiedCancellation = useRef(false);

  const pollRef = useRef(null);

  // One-off fix, used only to center the map if the booking doesn't
  // have address coordinates yet.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation([position.coords.latitude, position.coords.longitude]);
    });
  }, []);

  // Continuous "where am I right now" pin for the customer. The
  // provider already gets this via their own green marker (which
  // tracks their broadcast position) — the customer never had any
  // marker showing their actual current location, only the fixed
  // address from when the booking was created.
  useEffect(() => {
    if (isProvider) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setMyLiveLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        // Permission denied — the "You" pin just won't show; nothing
        // else on the page depends on this.
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isProvider]);

  const fetchBooking = async () => {
    if (!bookingId) return;
    try {
      const response = await get(`/booking/${bookingId}`);
      setBooking(response?.booking || response?.data || null);
      setError(null);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Couldn't load this booking's live status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    pollRef.current = setInterval(fetchBooking, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // 2-minute provider response window — customer-only. Starts the
  // moment we know the booking is Pending, anchored to the booking's
  // own createdAt when available so a page refresh doesn't reset the
  // clock. Clears itself the instant the provider responds.
  useEffect(() => {
    if (isProvider || !booking) return;

    if (booking.status !== "Pending") {
      setResponseDeadline(null);
      setShowTimeoutModal(false);
      return;
    }

    setResponseDeadline((prev) => {
      if (prev) return prev; // already running, don't restart it
      const startedAt = booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now();
      return startedAt + RESPONSE_WINDOW_MS;
    });
  }, [isProvider, booking]);

  useEffect(() => {
    if (!responseDeadline) return;
    const check = () => {
      setNowTick(Date.now());
      if (Date.now() >= responseDeadline) setShowTimeoutModal(true);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [responseDeadline]);

  const handleWaitLonger = () => {
    setShowTimeoutModal(false);
    setResponseDeadline(Date.now() + RESPONSE_WINDOW_MS);
  };

  const handleCancelRequest = async () => {
    try {
      setCancelling(true);
      await put(`/booking/cancel/${bookingId}`, {
        reason: "No response from provider within the response window",
      });
      toast.info("Request cancelled — find another provider below");
      navigate("/booking");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't cancel this request");
      setCancelling(false);
    }
  };

  // Manual cancel, triggered from the "Cancel booking" button in the
  // tracking sheet (as opposed to the automatic timeout-driven one
  // above) — this is the flow that actually asks the customer *why*.
  const handleManualCancel = async (reason) => {
    try {
      await put(`/booking/cancel/${bookingId}`, { reason });
      toast.success("Booking cancelled");
      setShowCancelModal(false);
      navigate("/booking");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't cancel this request");
      throw err;
    }
  };

  // Item #11: if the provider cancels an already-accepted booking,
  // the customer shouldn't be left staring at a dead tracking page —
  // surface it clearly (toast + a persisted notification in the
  // bell) and offer a one-tap way back to browsing.
  useEffect(() => {
    if (isProvider || !booking || hasNotifiedCancellation.current) return;
    if (booking.status !== "Cancelled") return;

    hasNotifiedCancellation.current = true;
    toast.error("The provider cancelled this booking");
    addNotification({
      type: "BOOKING_CANCELLED",
      title: "Booking Cancelled",
      bookingId: booking._id,
      message: `Your booking for ${booking?.service?.serviceName || "this service"} was cancelled by the provider.`,
    });
  }, [isProvider, booking, toast, addNotification]);

  // Provider broadcasts their live GPS position while the job is
  // active — this is what makes the customer's map/distance move.
  useEffect(() => {
    if (!isProvider || !bookingId) return;
    if (!navigator.geolocation) return;
    if (!["Accepted", "In Progress"].includes(booking?.status)) return;

    let lastSentAt = 0;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastSentAt < LOCATION_SEND_MIN_INTERVAL_MS) return;
        lastSentAt = now;
        updateProviderLocation(
          bookingId,
          position.coords.latitude,
          position.coords.longitude
        ).catch(() => {});
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isProvider, bookingId, booking?.status]);

  const customerCoords =
    booking?.address?.location?.coordinates &&
    [booking.address.location.coordinates[1], booking.address.location.coordinates[0]];

  const providerCoords =
    booking?.provider?.currentLocation?.coordinates &&
    [
      booking.provider.currentLocation.coordinates[1],
      booking.provider.currentLocation.coordinates[0],
    ];

  const mapCenter = myLiveLocation || customerCoords || userLocation || [28.6139, 77.209];
  const distance =
    providerCoords && customerCoords
      ? `${distanceKm(customerCoords, providerCoords).toFixed(1)} KM`
      : "—";
  const status = booking?.status || "Pending";
  const providerName = booking?.provider?.name || "Provider not assigned yet";
  const providerOnline =
    booking?.provider?.providerDetails?.availabilityStatus === "ONLINE";

  const showOtp = !isProvider && status === "Accepted" && Boolean(booking?.otp);
  const pendingSecondsLeft =
    !isProvider && status === "Pending" && responseDeadline
      ? Math.max(0, Math.ceil((responseDeadline - nowTick) / 1000))
      : null;

  // This pin is the fixed address from when the booking was made —
  // not a live position — so it's labelled the same for everyone.
  // The customer's actual live position now has its own "You" pin
  // (myLiveLocation, below).
  const serviceAddressLabel = "Service Address";
  const providerMarkerLabel = isProvider ? "You" : providerName;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading booking status…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
          <p className="mb-2 font-semibold text-red-600">Couldn't load this booking</p>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-100">
      <TrackingHeader />

      <div className="h-full w-full">
        <TrackingMap
          mapCenter={mapCenter}
          customerCoords={customerCoords}
          providerCoords={providerCoords}
          myLiveLocation={!isProvider ? myLiveLocation : null}
          customerLabel={serviceAddressLabel}
          providerLabel={providerMarkerLabel}
          status={status}
        />
      </div>

      <TrackingBottomSheet
        status={status}
        distance={distance}
        serviceName={booking?.service?.serviceName}
        providerName={providerName}
        providerAvatar={booking?.provider?.avatar?.url}
        providerRating={booking?.provider?.providerDetails?.averageRating}
        providerOnline={providerOnline}
        showOtp={showOtp}
        otp={booking?.otp}
        address={booking?.address?.fullAddress}
        destCoords={customerCoords}
        originCoords={providerCoords}
        showGoogleMapsButton={isProvider}
        pendingSecondsLeft={pendingSecondsLeft}
        onCancelClick={
          !isProvider && ["Pending", "Accepted"].includes(status)
            ? () => setShowCancelModal(true)
            : null
        }
      />

      <CancelBookingModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleManualCancel}
        serviceName={booking?.service?.serviceName}
      />

      <ProviderTimeoutModal
        open={showTimeoutModal}
        onWait={handleWaitLonger}
        onCancel={handleCancelRequest}
        cancelling={cancelling}
      />

      <BookingCancelledModal
        open={!isProvider && booking?.status === "Cancelled"}
        onFindAnother={() => navigate("/booking")}
      />
    </div>
  );
};

export default TrackBooking;