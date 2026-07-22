import React, { useRef, useState } from "react";
import {
  ChevronUp,
  MapPin,
  Car,
  Clock,
  Navigation,
  Star,
  Loader2,
  XCircle,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { buildGoogleMapsUrl } from "../../utils/maps";

const BASE_PEEK_HEIGHT = 132;
const MAPS_BUTTON_EXTRA_HEIGHT = 64;

const TrackingBottomSheet = ({
  status,
  distance,
  serviceName,
  providerName,
  providerAvatar,
  providerRating,
  providerOnline,
  showOtp,
  otp,
  address,
  destCoords, // customer's location — the destination for the provider
  originCoords, // last known provider location — fallback origin only
  showGoogleMapsButton,
  pendingSecondsLeft, // seconds left in the provider response window, or null
  onCancelClick, // shown when the booking can still be cancelled by the customer
}) => {
  const [expanded, setExpanded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const startY = useRef(0);

  const onPointerDown = (e) => {
    dragging.current = true;
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragY(clientY - startY.current);
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const threshold = 60;
    if (expanded && dragY > threshold) setExpanded(false);
    else if (!expanded && dragY < -threshold) setExpanded(true);
    setDragY(0);
  };

  // Get a fresh GPS fix right now instead of trusting whatever Google
  // Maps' own location detection decides on (which can be stale or
  // IP-based, especially on desktop) — that mismatch is what made the
  // pin look like it was "somewhere else" even when both people were
  // standing at the same spot. Falls back to the last synced
  // providerCoords, then to no origin at all, if GPS isn't available.
  const openInGoogleMaps = () => {
    const openWithOrigin = (originCoords) => {
      const url = buildGoogleMapsUrl({ originCoords, destCoords, destAddress: address });
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      setLocating(false);
    };

    if (!navigator.geolocation) {
      openWithOrigin(originCoords || null);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        openWithOrigin([position.coords.latitude, position.coords.longitude]);
      },
      () => openWithOrigin(originCoords || null),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  const hasMapsButton = showGoogleMapsButton && (destCoords || address);
  const hasCountdown = pendingSecondsLeft !== null && pendingSecondsLeft !== undefined;
  const peekHeight =
    BASE_PEEK_HEIGHT +
    (hasMapsButton ? MAPS_BUTTON_EXTRA_HEIGHT : 0) +
    (hasCountdown ? MAPS_BUTTON_EXTRA_HEIGHT : 0);

  const translateY = expanded
    ? Math.max(0, dragY)
    : `calc(100% - ${peekHeight}px + ${Math.min(0, dragY)}px)`;

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[500] flex flex-col rounded-t-3xl bg-white shadow-[0_-4px_24px_rgba(15,23,42,0.12)]"
      style={{
        height: "82vh",
        transform: `translateY(${typeof translateY === "number" ? `${translateY}px` : translateY})`,
        transition: dragging.current ? "none" : "transform 300ms ease-out",
      }}
    >
      <button
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={endDrag}
        onClick={() => !dragging.current && setExpanded((e) => !e)}
        className="flex w-full shrink-0 touch-none flex-col items-center gap-2 pb-1 pt-2.5"
      >
        <span className="h-1.5 w-10 rounded-full bg-slate-200" />
        <ChevronUp
          size={16}
          className={`text-slate-300 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">Service</p>
          <p className="truncate text-base font-bold text-slate-900">
            {serviceName || "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Distance</p>
          <p className="text-base font-bold text-slate-900">{distance}</p>
        </div>
      </div>

      {pendingSecondsLeft !== null && pendingSecondsLeft !== undefined && (
        <div className="shrink-0 px-5 pb-3">
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
            <span className="text-sm font-medium text-amber-800">
              Waiting for provider to accept…
            </span>
            <span className="text-sm font-bold tabular-nums text-amber-900">
              {String(Math.floor(pendingSecondsLeft / 60)).padStart(1, "0")}:
              {String(pendingSecondsLeft % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      {showGoogleMapsButton && (destCoords || address) && (
        <div className="shrink-0 px-5 pb-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openInGoogleMaps();
            }}
            disabled={locating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-70"
          >
            {locating ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Navigation size={17} />
            )}
            {locating ? "Getting your location…" : "Open in Google Maps"}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {showOtp && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Share this OTP on arrival
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                They'll need it to start the service.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-2xl font-bold tracking-widest text-amber-900">
              {otp}
            </div>
          </div>
        )}

        {providerName && providerName !== "Provider not assigned yet" && (
          <div className="mb-4 flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
            <img
              src={providerAvatar || "https://i.pravatar.cc/200"}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{providerName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant={providerOnline ? "green" : "slate"}>
                  {providerOnline ? "Online" : "Offline"}
                </Badge>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Star size={12} className="text-amber-400" />
                  {providerRating ?? "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
            <MapPin className="mt-0.5 shrink-0 text-blue-600" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Service Address</h3>
              <p className="mt-0.5 text-sm text-slate-500">{address || "Not available"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
            <Car className="mt-0.5 shrink-0 text-emerald-600" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Provider Status</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {distance !== "—"
                  ? "Location updates automatically every few seconds"
                  : "Not on the way yet"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
            <Clock className="mt-0.5 shrink-0 text-orange-600" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Distance</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {distance !== "—" ? `Approximately ${distance} away` : "Not available yet"}
              </p>
            </div>
          </div>
        </div>

        {onCancelClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancelClick();
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <XCircle size={16} />
            Cancel booking
          </button>
        )}
      </div>
    </div>
  );
};

export default TrackingBottomSheet;