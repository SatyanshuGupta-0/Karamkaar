// Central place for reading/writing auth state so every
// page agrees on what "logged in" and "current role" mean.

export const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem("accessToken");

export const isAuthenticated = () => Boolean(getToken());

export const getCurrentRole = () => localStorage.getItem("currentRole");

export const hasRole = (role) => {
  const user = getUser();
  return Boolean(user?.role?.includes(role));
};

export const setCurrentRole = (role) => {
  localStorage.setItem("currentRole", role);
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("currentRole");
  localStorage.removeItem("userEmail");
};

// Haversine distance in kilometers between two [lat, lng] points.
export const distanceKm = (from, to) => {
  if (!from || !to) return null;

  const [lat1, lon1] = from;
  const [lat2, lon2] = to;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
