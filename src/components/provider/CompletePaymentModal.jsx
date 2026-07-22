import React, { useState } from "react";
import { Wallet, QrCode, IndianRupee, ArrowLeft, CheckCircle2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { getProviderUpiId, setProviderUpiId } from "../../utils/providerUpi";

const CompletePaymentModal = ({ open, job, providerId, onClose, onConfirm, submitting }) => {
  const [step, setStep] = useState("choose"); // "choose" | "qr"
  const [upiId, setUpiId] = useState(() => getProviderUpiId(providerId));

  const amount = job?.service?.price ?? job?.totalAmount ?? 0;

  const handleClose = () => {
    if (submitting) return;
    setStep("choose");
    onClose?.();
  };

  const handleCashSelected = () => onConfirm("Cash");

  const handleShowQr = () => {
    if (!upiId.trim()) return;
    setProviderUpiId(providerId, upiId.trim());
    setStep("qr");
  };

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=ServiceHub%20Provider&am=${amount}&cu=INR&tn=${encodeURIComponent(
    job?.service?.serviceName || "Service payment"
  )}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUri
  )}`;

  return (
    <Modal open={open} onClose={handleClose} size="sm" title="Collect Payment">
      {step === "choose" && (
        <div className="py-1">
          <p className="mb-4 text-center text-sm text-slate-500">
            How is the customer paying for{" "}
            <span className="font-medium text-slate-700">
              {job?.service?.serviceName || "this service"}
            </span>
            ?
          </p>

          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-3 text-lg font-bold text-slate-900">
            <IndianRupee size={18} />
            {amount}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCashSelected}
              disabled={submitting}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 disabled:opacity-60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Cash Received</p>
                <p className="text-xs text-slate-500">Customer paid you directly</p>
              </div>
            </button>

            <div className="rounded-xl border-2 border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <QrCode size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Collect via UPI / QR</p>
                  <p className="text-xs text-slate-500">Show a scannable code to the customer</p>
                </div>
              </div>
              <Input
                placeholder="Your UPI ID (e.g. name@bank)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <Button
                className="mt-3"
                variant="outline"
                fullWidth
                disabled={!upiId.trim()}
                onClick={handleShowQr}
              >
                Show QR Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "qr" && (
        <div className="py-1 text-center">
          <button
            onClick={() => setStep("choose")}
            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <p className="mb-3 text-sm text-slate-500">
            Ask the customer to scan this with any UPI app
          </p>

          <img
            src={qrImageUrl}
            alt="UPI payment QR code"
            className="mx-auto rounded-2xl border border-slate-200 p-2"
            width={220}
            height={220}
          />

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xl font-bold text-slate-900">
            <IndianRupee size={17} />
            {amount}
          </p>

          <Button
            className="mt-5"
            fullWidth
            icon={CheckCircle2}
            loading={submitting}
            onClick={() => onConfirm("Online")}
          >
            Payment Received — Mark Completed
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default CompletePaymentModal;