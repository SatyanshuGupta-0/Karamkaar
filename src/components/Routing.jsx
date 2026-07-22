// import { useEffect } from "react";
// import { useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet-routing-machine";

// const Routing = ({
//   userLocation,
//   providerLocation,
// }) => {
//   const map = useMap();

//   useEffect(() => {
//     if (!userLocation || !providerLocation)
//       return;

//     const routingControl = L.Routing.control({
//       waypoints: [
//         L.latLng(
//           providerLocation[0],
//           providerLocation[1]
//         ),
//         L.latLng(
//           userLocation[0],
//           userLocation[1]
//         ),
//       ],

//       routeWhileDragging: false,

//       addWaypoints: false,

//       draggableWaypoints: false,

//       fitSelectedRoutes: true,

//       show: false,

//       lineOptions: {
//         styles: [
//           {
//             color: "#2563eb",
//             weight: 6,
//           },
//         ],
//       },
//     }).addTo(map);

//     return () => {
//       map.removeControl(routingControl);
//     };
//   }, [
//     map,
//     userLocation,
//     providerLocation,
//   ]);

//   return null;
// };

// export default Routing;

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

/**
 * Draws the route line between the provider and the customer.
 *
 * Previously this destroyed and recreated the whole routing control
 * every time the parent re-rendered (which happens on every 8s
 * location poll) — that caused the map to flicker and re-fit/re-zoom
 * on every single update. Now the control is created once and, on
 * subsequent updates, we just move its waypoints — Leaflet animates
 * the line smoothly instead of tearing it down.
 */
const Routing = ({ userLocation, providerLocation }) => {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!userLocation || !providerLocation) return;

    if (!controlRef.current) {
      controlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(providerLocation[0], providerLocation[1]),
          L.latLng(userLocation[0], userLocation[1]),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        createMarker: () => null, // we render our own markers on top
        lineOptions: {
          styles: [{ color: "#2563eb", weight: 5, opacity: 0.9 }],
        },
      }).addTo(map);
    } else {
      // Move the existing route instead of rebuilding it — no
      // flicker, no forced re-fit/re-zoom on every poll.
      controlRef.current.setWaypoints([
        L.latLng(providerLocation[0], providerLocation[1]),
        L.latLng(userLocation[0], userLocation[1]),
      ]);
    }
  }, [map, userLocation, providerLocation]);

  useEffect(() => {
    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
};

export default Routing;