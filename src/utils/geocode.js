// Free reverse geocoding via OpenStreetMap's Nominatim service.
// No API key required. For production traffic beyond light/dev use,
// consider self-hosting Nominatim or switching to a paid geocoder
// (Google Geocoding, Mapbox, LocationIQ) — Nominatim's public
// instance rate-limits at ~1 request/second.

export const reverseGeocode = async (latitude, longitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const data = await response.json();
  const address = data.address || {};

  return {
    fullAddress: data.display_name || "",
    city:
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      "",
    state: address.state || "",
    pincode: address.postcode || "",
    country: address.country || "",
  };
};

export const getAccuratePosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
