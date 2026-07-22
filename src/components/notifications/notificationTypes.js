import {
  CalendarCheck,
  CalendarX,
  UserCheck,
  UserX,
  CreditCard,
  XCircle,
  Tag,
  Bell,
  ClipboardList,
  Star,
} from "lucide-react";

/**
 * Single source of truth for every notification "type" used across the
 * app. Add a new type here and every surface (bell, dropdown, page,
 * toast-on-arrival) picks it up automatically.
 */
export const NOTIFICATION_TYPES = {
  NEW_SERVICE_REQUEST: {
    label: "New Service Request",
    icon: ClipboardList,
    color: "text-blue-600 bg-blue-50",
  },
  BOOKING_CONFIRMED: {
    label: "Booking Confirmed",
    icon: CalendarCheck,
    color: "text-emerald-600 bg-emerald-50",
  },
  BOOKING_CANCELLED: {
    label: "Booking Cancelled",
    icon: CalendarX,
    color: "text-red-600 bg-red-50",
  },
  PROVIDER_ACCEPTED: {
    label: "Provider Accepted",
    icon: UserCheck,
    color: "text-blue-600 bg-blue-50",
  },
  PROVIDER_REJECTED: {
    label: "Provider Rejected",
    icon: UserX,
    color: "text-red-600 bg-red-50",
  },
  PAYMENT_SUCCESS: {
    label: "Payment Success",
    icon: CreditCard,
    color: "text-emerald-600 bg-emerald-50",
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    icon: XCircle,
    color: "text-red-600 bg-red-50",
  },
  REVIEW: {
    label: "New Review",
    icon: Star,
    color: "text-amber-600 bg-amber-50",
  },
  PROVIDER_AVAILABLE: {
    label: "Provider Available",
    icon: UserCheck,
    color: "text-emerald-600 bg-emerald-50",
  },
  OFFER: {
    label: "Offer",
    icon: Tag,
    color: "text-purple-600 bg-purple-50",
  },
  SYSTEM_ALERT: {
    label: "System Alert",
    icon: Bell,
    color: "text-amber-600 bg-amber-50",
  },
};

export const getNotificationMeta = (type) =>
  NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.SYSTEM_ALERT;

// Pulls a related id out of a notification regardless of exactly how
// the backend nested it — as a top-level field, inside a `data`
// object, or as a populated object with `_id`/`id`.
const extractId = (notification, ...keys) => {
  for (const key of keys) {
    const value = notification?.[key] ?? notification?.data?.[key];
    if (!value) continue;
    return typeof value === "object" ? value._id || value.id : value;
  }
  return null;
};

/**
 * Where clicking a notification should take you. Returns null for
 * types that aren't meant to navigate anywhere (e.g. a promotional
 * offer) — the click still marks it read either way.
 */
export const getNotificationLink = (notification) => {
  const bookingId = extractId(notification, "bookingId", "booking");
  const providerId = extractId(notification, "providerId", "provider");

  switch (notification?.type) {
    case "NEW_SERVICE_REQUEST":
      return "/provider/dashboard";
    case "BOOKING_CONFIRMED":
    case "PROVIDER_ACCEPTED":
    case "BOOKING_CANCELLED":
    case "PROVIDER_REJECTED":
      return bookingId ? `/trackbooking/${bookingId}` : "/dashboard";
    case "PAYMENT_SUCCESS":
    case "PAYMENT_FAILED":
      return bookingId ? `/payment/${bookingId}` : "/dashboard";
    case "REVIEW":
      return providerId ? `/booking/provider/${providerId}` : null;
    case "PROVIDER_AVAILABLE":
      return providerId ? `/booking/provider/${providerId}` : null;
    default:
      return null;
  }
};

export const timeAgo = (isoDate) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
};
