const KEY_PREFIX = "provider_upi_id_";

export const getProviderUpiId = (providerId) => {
  try {
    return localStorage.getItem(KEY_PREFIX + providerId) || "";
  } catch {
    return "";
  }
};

export const setProviderUpiId = (providerId, upiId) => {
  try {
    localStorage.setItem(KEY_PREFIX + providerId, upiId);
  } catch {
    // ignore quota errors
  }
};