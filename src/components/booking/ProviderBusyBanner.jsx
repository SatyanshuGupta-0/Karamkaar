import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, BellRing, BellOff } from "lucide-react";
import Button from "../ui/Button";
import { useToast } from "../../context/ToastContext";
import { addToWaitlist, isWaitingFor, removeFromWaitlist } from "../../utils/providerWaitlist";

/**
 * Shown on the provider-detail page and the booking form whenever
 * the selected provider goes Busy (or Offline) while the customer is
 * still there — lets them jump straight back to browsing, or ask to
 * be notified the moment this specific provider frees up again
 * (see hooks/useProviderWaitlistWatcher.js).
 */
const ProviderBusyBanner = ({ offline = false, providerId, providerName }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [waiting, setWaiting] = useState(() => isWaitingFor(providerId));

  const toggleNotify = () => {
    if (waiting) {
      removeFromWaitlist(providerId);
      setWaiting(false);
    } else {
      addToWaitlist(providerId, providerName);
      setWaiting(true);
      toast.success("We'll notify you when this provider is available");
    }
  };

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm font-medium text-amber-800">
          {offline
            ? "This provider just went offline. Please choose another available provider."
            : "This provider is currently busy. Please choose another available provider."}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {providerId && (
          <Button
            size="sm"
            variant="outline"
            icon={waiting ? BellOff : BellRing}
            onClick={toggleNotify}
          >
            {waiting ? "Cancel notify" : "Notify me"}
          </Button>
        )}
        <Button size="sm" onClick={() => navigate("/booking")}>
          Browse Providers
        </Button>
      </div>
    </div>
  );
};

export default ProviderBusyBanner;
