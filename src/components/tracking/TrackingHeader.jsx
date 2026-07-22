import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Floating back button over the map. Used to show a status pill on
 * the top-right too, but that was cluttering the map — status is
 * still visible in the bottom sheet if needed.
 */
const TrackingHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3 sm:p-4">
      <button
        onClick={() => navigate(-1)}
        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-md hover:bg-slate-50"
        aria-label="Go back"
      >
        <ArrowLeft size={19} />
      </button>
    </div>
  );
};

export default TrackingHeader;