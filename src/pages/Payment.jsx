import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IndianRupee,
  Wallet,
  Smartphone,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Badge";
import { get } from "../utils/api";
import { getUser } from "../utils/auth";
import { openRazorpayCheckout } from "../utils/razorpay";
import { completeBookingAfterPayment } from "../utils/payment";
import { useToast } from "../context/ToastContext";

const PAYMENT_METHODS = [
  { key: "online", label: "Pay Online", sub: "UPI, Card, Netbanking, Wallet", icon: Smartphone },
  { key: "cash", label: "Cash on Service", sub: "Pay the provider directly", icon: Wallet },
];

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState("online");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null); // "success" | "failed" | null

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await get(`/booking/${bookingId}`);
        setBooking(res?.booking || res?.data || null);
      } catch (error) {
        toast.error("Couldn't load this booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const price = Number(booking?.service?.price) || 0;
  const taxes = Math.round(price * 0.02); // simple placeholder GST-style fee
  const total = price + taxes;

  const finishAsCompleted = async (paymentInfo) => {
    await completeBookingAfterPayment(bookingId, paymentInfo);
    setResult("success");
  };

  const handlePayNow = async () => {
    if (method === "cash") {
      setProcessing(true);
      await finishAsCompleted({ method: "cash" });
      setProcessing(false);
      return;
    }

    setProcessing(true);
    const user = getUser();
    await openRazorpayCheckout({
      amountInRupees: total,
      name: "ServiceHub",
      description: booking?.service?.serviceName || "Service payment",
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.mobile,
      },
      onSuccess: async (response) => {
        await finishAsCompleted({
          method: "online",
          razorpayPaymentId: response?.razorpay_payment_id,
        });
        setProcessing(false);
      },
      onFailure: (error) => {
        setProcessing(false);
        setResult("failed");
        toast.error(error?.description || error?.message || "Payment failed");
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (result === "success") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Successful</h1>
          <p className="mt-2 text-slate-500">
            {method === "cash"
              ? "Booking marked as completed — please pay the provider directly."
              : `₹${total} paid successfully. Your booking is now marked as completed.`}
          </p>
          <Button className="mt-8" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <XCircle className="mb-3 text-slate-300" size={40} />
          <p className="font-medium text-slate-600">Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="mb-5 text-2xl font-bold text-slate-900">Payment</h1>

        {result === "failed" && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            Your last payment attempt didn't go through — you can try again below.
          </div>
        )}

        <Card padding="p-5 sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">Booking Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Service</span>
              <span className="font-medium text-slate-900">
                {booking?.service?.serviceName || "—"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Provider</span>
              <span className="font-medium text-slate-900">
                {booking?.provider?.name || "—"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service charge</span>
              <span className="flex items-center">
                <IndianRupee size={12} />
                {price}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes & fees</span>
              <span className="flex items-center">
                <IndianRupee size={12} />
                {taxes}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
              <span>Total</span>
              <span className="flex items-center">
                <IndianRupee size={15} />
                {total}
              </span>
            </div>
          </div>
        </Card>

        <Card className="mt-5" padding="p-5 sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">Payment Method</h2>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon;
              const selected = method === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                    selected
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                    <p className="text-xs text-slate-500">{m.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Button
          className="mt-6"
          fullWidth
          size="lg"
          loading={processing}
          onClick={handlePayNow}
        >
          {processing
            ? "Processing…"
            : method === "cash"
            ? "Confirm — Pay with Cash"
            : `Pay ₹${total}`}
        </Button>
      </div>
    </div>
  );
};

export default Payment;
