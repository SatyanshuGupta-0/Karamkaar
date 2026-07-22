import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const providerIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:50%;background:#16a34a;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const ANIMATION_MS = 1000;
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Provider location marker that glides between polled positions
 * instead of teleporting, gently pans the map to follow if the
 * provider moves outside the visible area, and always shows a
 * label above it (no click required) so it's obvious which pin is
 * the provider.
 */
const AnimatedProviderMarker = ({ position, label }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const animRef = useRef(null);
  const fromRef = useRef(position);

  useEffect(() => {
    if (!position) return;

    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon: providerIcon })
        .addTo(map)
        .bindTooltip(label || "Provider", {
          permanent: true,
          direction: "top",
          offset: [0, -12],
          className: "tracking-marker-label tracking-marker-label--provider",
        });
      fromRef.current = position;
      return;
    }

    const from = fromRef.current || position;
    const to = position;
    const start = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const step = (now) => {
      const t = Math.min(1, (now - start) / ANIMATION_MS);
      const lat = lerp(from[0], to[0], t);
      const lng = lerp(from[1], to[1], t);
      markerRef.current?.setLatLng([lat, lng]);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
        if (!map.getBounds().pad(-0.1).contains(to)) {
          map.panTo(to, { animate: true, duration: 0.8 });
        }
      }
    };

    animRef.current = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.[0], position?.[1]]);

  useEffect(() => {
    if (markerRef.current) markerRef.current.setTooltipContent(label || "Provider");
  }, [label]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
};

export default AnimatedProviderMarker;