const WAITLIST_KEY = "provider_waitlist";

// This is inherently local-device state for now (frontend only) —
// the real version of this feature needs a backend waitlist so it
// works across devices/sessions and can push a notification even
// when the customer isn't currently on this browser. Until then,
// this polls from whichever browser tab added the provider.
const load = () => {
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (list) => {
  try {
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
};

export const getWaitlist = () => load();

export const isWaitingFor = (providerId) =>
  load().some((entry) => entry.providerId === providerId);

export const addToWaitlist = (providerId, providerName) => {
  const list = load();
  if (list.some((entry) => entry.providerId === providerId)) return;
  list.push({ providerId, providerName, addedAt: new Date().toISOString() });
  save(list);
};

export const removeFromWaitlist = (providerId) => {
  save(load().filter((entry) => entry.providerId !== providerId));
};
