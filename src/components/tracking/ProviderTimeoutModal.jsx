import React from "react";
import { Clock } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

/**
 * Shown once the 2-minute provider-response window runs out while a
 * booking is still Pending. "Wait" gives the provider more time and
 * won't nag again for another 2 minutes; "Cancel Request" lets the
 * customer go find someone else instead of being stuck waiting
 * indefinitely.
 */
const ProviderTimeoutModal = ({ open, onWait, onCancel, cancelling }) => {
  return (
    <Modal open={open} onClose={onWait} size="sm" showClose={false}>
      <div className="py-2 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock size={30} className="text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Still waiting…</h2>
        <p className="mt-2 text-sm text-slate-500">
          The provider hasn't responded to your request yet. You can keep
          waiting a little longer, or cancel and pick a different provider.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button onClick={onWait} disabled={cancelling} fullWidth>
            Wait a bit longer
          </Button>
          <Button variant="outline" onClick={onCancel} loading={cancelling} fullWidth>
            Cancel Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProviderTimeoutModal;
