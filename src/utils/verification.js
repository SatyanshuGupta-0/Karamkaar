const KEY = "verified_contacts";

// No backend "isEmailVerified"/"isMobileVerified" flag yet, so this
// keeps a local record of which exact values the user has completed
// OTP verification for. Keying by the actual value (not just a
// boolean) means editing the field back to something unverified
// naturally un-verifies it, no extra bookkeeping needed.
const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { email: [], mobile: [] };
  } catch {
    return { email: [], mobile: [] };
  }
};

const save = (data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
};

export const isContactVerified = (channel, value) => {
  if (!value) return false;
  const data = load();
  return (data[channel] || []).includes(value);
};

export const markContactVerified = (channel, value) => {
  if (!value) return;
  const data = load();
  if (!data[channel]) data[channel] = [];
  if (!data[channel].includes(value)) data[channel].push(value);
  save(data);
};
