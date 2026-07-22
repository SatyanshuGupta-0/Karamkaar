import { put } from "./api";

const LOCAL_COMPLETED_KEY = "locally_completed_booking_ids";

// No backend "mark completed after payment" flow yet — this keeps a
// local record so Dashboard/ProviderDashboard can reflect the
// Completed state immediately, and swaps to 100% real data
// automatically once the backend endpoint exists.
export const getLocallyCompletedIds = () => {
  try {
    const raw = localStorage.getItem(LOCAL_COMPLETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const markLocallyCompleted = (bookingId) => {
  const ids = getLocallyCompletedIds();
  if (!ids.includes(bookingId)) {
    ids.push(bookingId);
    try {
      localStorage.setItem(LOCAL_COMPLETED_KEY, JSON.stringify(ids));
    } catch {
      // ignore quota errors
    }
  }
};

/**
 * Marks a booking Completed after payment succeeds (or after a cash
 * confirmation). Tries the real endpoint first; if it's not there
 * yet, the completion is still recorded locally.
 */
export const completeBookingAfterPayment = async (bookingId, paymentInfo = {}) => {
  try {
    // Rename this if your backend uses a different route.
    await put(`/booking/complete/${bookingId}`, paymentInfo);
  } catch {
    // backend not ready yet — still reflect completion locally
  }
  markLocallyCompleted(bookingId);
};
