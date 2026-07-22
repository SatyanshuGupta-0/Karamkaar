// Builds a Google Maps turn-by-turn directions link. Coordinates are
// always [lat, lng] here (matches how the rest of the app stores
// them) and take priority over a text address — geocoding a text
// address can snap to a slightly different point than the literal
// coordinates, which is what actually matters for accuracy.
export const buildGoogleMapsUrl = ({ originCoords, destCoords, destAddress }) => {
  const destination = destCoords
    ? `${destCoords[0]},${destCoords[1]}`
    : destAddress || null;

  if (!destination) return null;

  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  });

  // Leaving "origin" out lets Google Maps fall back to the device's
  // own detected location — which on a desktop browser or with weak
  // GPS can be IP-based and wildly inaccurate. Always pass an
  // explicit origin when we have one (ideally a fresh GPS fix taken
  // right when the button is pressed) instead of relying on Maps'
  // own detection.
  if (originCoords) {
    params.set("origin", `${originCoords[0]},${originCoords[1]}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};