import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import Routing from "../Routing";
import AnimatedProviderMarker from "./AnimatedProviderMarker";

// Neutral teardrop-style pin for the fixed booking address — this is
// a reference point, not a live person, so it's deliberately styled
// differently from the live "You"/provider dots below.
const addressIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#64748b;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 16],
});

// Pulsing blue dot for "where I am right now" — same visual language
// as a typical live-location marker (soft expanding ring + solid
// center dot).
const myLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;inset:-9px;border-radius:50%;background:rgba(37,99,235,0.25);animation:trackingPulse 1.8s ease-out infinite;"></div>
      <div style="width:22px;height:22px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const TrackingMap = ({
  mapCenter,
  customerCoords,
  providerCoords,
  myLiveLocation,
  customerLabel,
  providerLabel,
  status,
}) => {
  const hasAnythingToShow = providerCoords || customerCoords || myLiveLocation;

  if (!hasAnythingToShow) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 px-6 text-center">
        <p className="max-w-xs text-sm text-slate-500">
          {status === "Pending"
            ? "Waiting for a provider to accept this booking. The map will update automatically once one does."
            : "Waiting for location data…"}
        </p>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={14}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {customerCoords && (
        <Marker position={customerCoords} icon={addressIcon}>
          <Tooltip
            permanent
            direction="top"
            offset={[0, -14]}
            className="tracking-marker-label tracking-marker-label--address"
          >
            {customerLabel || "Service Address"}
          </Tooltip>
        </Marker>
      )}

      {myLiveLocation && (
        <Marker position={myLiveLocation} icon={myLocationIcon}>
          <Tooltip
            permanent
            direction="top"
            offset={[0, -12]}
            className="tracking-marker-label tracking-marker-label--customer"
          >
            You
          </Tooltip>
        </Marker>
      )}

      {providerCoords && (
        <AnimatedProviderMarker position={providerCoords} label={providerLabel} />
      )}

      {customerCoords && providerCoords && (
        <Routing userLocation={customerCoords} providerLocation={providerCoords} />
      )}
    </MapContainer>
  );
};

export default TrackingMap;