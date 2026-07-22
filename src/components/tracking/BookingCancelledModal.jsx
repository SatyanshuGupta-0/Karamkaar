import React from "react";
import { XCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

/**
 * Shown when the provider cancels an already-accepted booking while
 * the customer is on the tracking page — explains what happened and
 * sends them straight back to browsing so they can pick someone
 * else, instead of leaving them stuck staring at a dead tracking map.
 */
const BookingCancelledModal = ({ open, onFindAnother }) => (
  <Modal open={open} onClose={onFindAnother} size="sm" showClose={false}>
    <div className="py-2 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <XCircle size={30} className="text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Booking Cancelled</h2>
      <p className="mt-2 text-sm text-slate-500">
        The provider has cancelled this booking. Sorry for the inconvenience —
        you can find another available provider right away.
      </p>

      <Button className="mt-6" fullWidth onClick={onFindAnother}>
        Find Another Provider
      </Button>
    </div>
  </Modal>
);

export default BookingCancelledModal;
