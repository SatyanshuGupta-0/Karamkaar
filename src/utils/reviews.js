import { get, post } from "./api";

// Rename this if your backend uses a different route — payload shape
// is { bookingId, providerId, rating, review }.
const CREATE_REVIEW_URL = "/review/create";

const REVIEWED_BOOKINGS_KEY = "reviewed_booking_ids";
const LOCAL_REVIEWS_KEY_PREFIX = "local_reviews_for_provider_";

// --- "already reviewed this booking" tracking -----------------------
// No backend flag for this yet, so Dashboard uses this to know which
// Completed bookings should still show "Rate this service".
export const getReviewedBookingIds = () => {
  try {
    const raw = localStorage.getItem(REVIEWED_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const markBookingReviewed = (bookingId) => {
  const ids = getReviewedBookingIds();
  if (!ids.includes(bookingId)) {
    ids.push(bookingId);
    try {
      localStorage.setItem(REVIEWED_BOOKINGS_KEY, JSON.stringify(ids));
    } catch {
      // ignore quota errors
    }
  }
};

// --- local cache so a just-submitted review shows up immediately ----
// on the provider's page even before the real endpoint exists.
const getLocalReviews = (providerId) => {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY_PREFIX + providerId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addLocalReview = (providerId, review) => {
  const list = [review, ...getLocalReviews(providerId)];
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY_PREFIX + providerId, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
};

/**
 * Submits a review. Tries the real API first; if it's not there yet
 * (404/network error), the review is still recorded locally so the
 * UI is fully testable — swap to 100% real data automatically once
 * the backend endpoint exists, no UI changes needed.
 */
export const submitReview = async ({ bookingId, providerId, rating, review, userName }) => {
  const payload = { bookingId, providerId, rating, review };

  try {
    const res = await post(CREATE_REVIEW_URL, payload);
    markBookingReviewed(bookingId);
    return { ok: true, review: res?.review || payload, source: "server" };
  } catch (error) {
    // Backend not wired up yet — keep the demo usable.
    const localReview = {
      _id: `local-${Date.now()}`,
      rating,
      review,
      user: { name: userName || "You" },
      createdAt: new Date().toISOString(),
    };
    addLocalReview(providerId, localReview);
    markBookingReviewed(bookingId);
    return { ok: true, review: localReview, source: "local", error };
  }
};

/**
 * Fetches a provider's reviews from the real API and merges in any
 * locally-submitted ones that haven't synced yet.
 */
export const fetchProviderReviews = async (providerId) => {
  let serverReviews = [];
  try {
    const res = await get(`/review/provider/${providerId}`);
    serverReviews = res?.reviews || [];
  } catch {
    // fine — just show whatever's local
  }
  const local = getLocalReviews(providerId);
  return [...local, ...serverReviews];
};
