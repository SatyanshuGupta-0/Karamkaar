import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const QUICK_REASONS = [
  "Changed my mind",
  "Booked by mistake",
  "Provider is taking too long",
  "Found a better price elsewhere",
  "Emergency came up",
  "Other",
];

/**
 * Reason-picker cancellation modal, used by both the customer's
 * bookings list (Dashboard) and the live tracking page.
 *
 * onConfirm(reason: string) — the caller makes the actual
 * PUT /booking/cancel/:id call; this component only collects the
 * reason and manages its own submit-in-progress state.
 */
const CancelBookingModal = ({ open, onClose, onConfirm, serviceName }) => {
  const [selected, setSelected] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOther = selected === "Other";
  const finalReason = isOther ? customReason.trim() : selected;
  const canSubmit = isOther ? finalReason.length > 0 : Boolean(selected);

  const reset = () => {
    setSelected("");
    setCustomReason("");
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onConfirm(finalReason);
      reset();
    } catch {
      // Caller is responsible for surfacing the error (toast); just
      // stop spinning so the person can retry or edit their reason.
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Cancel booking" size="sm">
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          {serviceName
            ? `Cancelling your ${serviceName} request. `
            : "Cancelling this request. "}
          This can't be undone.
        </p>
      </div>

      <p className="mb-2.5 text-sm font-semibold text-slate-800">
        Why are you cancelling?
      </p>

      <div className="flex flex-wrap gap-2">
        {QUICK_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => setSelected(reason)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              selected === reason
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {reason}
          </button>
        ))}
      </div>

      {isOther && (
        <textarea
          autoFocus
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          rows={3}
          placeholder="Tell us a bit more…"
          className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="outline" fullWidth onClick={handleClose} disabled={submitting}>
          Keep booking
        </Button>
        <Button
          variant="danger"
          fullWidth
          disabled={!canSubmit}
          loading={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Cancelling…" : "Cancel booking"}
        </Button>
      </div>
    </Modal>
  );
};

export default CancelBookingModal;
