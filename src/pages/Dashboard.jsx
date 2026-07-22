import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  LogOut,
  Star,
  X,
  CreditCard,
  Wallet,
  CalendarClock,
  PackageOpen,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Badge, SkeletonCard } from "../components/ui/Badge";
import CancelBookingModal from "../components/booking/CancelBookingModal";
import { get, put } from "../utils/api";
import { getUser, logout } from "../utils/auth";
import { getReviewedBookingIds } from "../utils/reviews";
import { getLocallyCompletedIds } from "../utils/payment";
import ReviewModal from "../components/reviews/ReviewModal";
import { useToast } from "../context/ToastContext";

// Real backend enum (booking_model.js): Pending, Accepted, Rejected,
// OnTheWay, Started, Completed, Cancelled — PascalCase, not uppercase.
const STATUS_BADGE = {
  Pending: "amber",
  Accepted: "blue",
  OnTheWay: "purple",
  Started: "purple",
  Completed: "green",
  Rejected: "red",
  Cancelled: "red",
};

// A dual-role account (USER + PROVIDER) gets back jobs from
// /booking/my-bookings where they were the PROVIDER too — those
// belong to a *different* customer and must never show up on this
// page. Only keep bookings where the logged-in user is the customer.
const belongsToCustomer = (job, userId) => {
  if (!userId) return true; // can't verify — don't hide everything
  const customerId = job?.customer?._id || job?.customer;
  if (!customerId) return true; // no customer field to check against
  return String(customerId) === String(userId);
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [reviewedIds, setReviewedIds] = useState(getReviewedBookingIds());
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await get("/booking/my-bookings");
      const all = res?.bookings || [];
      const userId = user?._id || user?.id;
      const locallyCompleted = getLocallyCompletedIds();
      const mine = all
        .filter((job) => belongsToCustomer(job, userId))
        .map((job) =>
          // Payment happened locally (frontend-only for now) — reflect
          // it immediately instead of waiting for the backend to catch up.
          locallyCompleted.includes(job._id) && job.status !== "Completed"
            ? { ...job, status: "Completed" }
            : job
        );
      setBookings(mine);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Couldn't load your bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmCancel = async (reason) => {
    const bookingId = cancellingBooking._id;
    try {
      await put(`/booking/cancel/${bookingId}`, { reason });
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: "Cancelled", cancelReason: reason }
            : b
        )
      );
      toast.success("Booking cancelled");
      setCancellingBooking(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Couldn't cancel this booking"
      );
      throw error; // let the modal know so it stops its own spinner
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-slate-500 mt-1">
              Track your bookings or request a new service.
            </p>
          </div>

          <div className="flex gap-3">
            <Button icon={Plus} onClick={() => navigate("/booking")}>
              Book a service
            </Button>
            <Button variant="outline" icon={LogOut} onClick={handleLogout} />
          </div>
        </div>

        <Card padding="p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Your bookings
            </h2>
            <button
              onClick={fetchBookings}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <PackageOpen className="text-slate-400" size={26} />
              </div>
              <p className="text-slate-500 mb-4">
                You haven't booked a service yet.
              </p>
              <Button onClick={() => navigate("/booking")}>
                Book your first service
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((job) => {
                const canCancel = ["Pending", "Accepted"].includes(job.status);
                const canTrack = ["Accepted", "OnTheWay", "Started"].includes(
                  job.status
                );
                const canPay = job.status === "Started";
                const canReview =
                  job.status === "Completed" && !reviewedIds.includes(job._id);

                return (
                  <div
                    key={job._id}
                    className="rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-200"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-lg text-slate-900">
                          {job?.service?.serviceName || "Service"}
                        </h3>
                        <Badge variant={STATUS_BADGE[job.status] || "slate"}>
                          {job.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        {job?.address?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {job.address.city}
                            {job.address.state ? `, ${job.address.state}` : ""}
                          </span>
                        )}
                        {job?.scheduledDate && (
                          <span className="flex items-center gap-1">
                            <CalendarClock size={13} />
                            {new Date(job.scheduledDate).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" }
                            )}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Wallet size={13} />
                          {job.paymentMethod === "Online" ? "Paid online" : "Cash"}
                        </span>
                      </div>

                      {job?.provider?.name && (
                        <p className="text-slate-500 text-sm mt-2 flex items-center gap-1.5">
                          Provider:{" "}
                          <span className="text-slate-700 font-medium">
                            {job.provider.name}
                          </span>
                          {job?.provider?.providerDetails?.averageRating && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Star
                                size={13}
                                className="fill-amber-400 text-amber-400"
                              />
                              {job.provider.providerDetails.averageRating}
                            </span>
                          )}
                        </p>
                      )}

                      {job.status === "Cancelled" && job.cancelReason && (
                        <p className="text-xs text-red-500 mt-2">
                          Reason: {job.cancelReason}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0 flex-wrap">
                      {canTrack && (
                        <Button
                          size="sm"
                          icon={MapPin}
                          onClick={() => navigate(`/trackbooking/${job._id}`)}
                        >
                          Track
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={X}
                          className="!border-red-200 !text-red-600 hover:!bg-red-50"
                          onClick={() => setCancellingBooking(job)}
                        >
                          Cancel
                        </Button>
                      )}
                      {canPay && (
                        <Button
                          size="sm"
                          variant="success"
                          icon={CreditCard}
                          onClick={() => navigate(`/payment/${job._id}`)}
                        >
                          Complete & Pay
                        </Button>
                      )}
                      {canReview && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Star}
                          className="!border-amber-200 !text-amber-700 !bg-amber-50"
                          onClick={() => setReviewingBooking(job)}
                        >
                          Rate this service
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <ReviewModal
        open={Boolean(reviewingBooking)}
        booking={reviewingBooking}
        onClose={() => setReviewingBooking(null)}
        onSubmitted={(bookingId) =>
          setReviewedIds((prev) => [...prev, bookingId])
        }
      />

      <CancelBookingModal
        open={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        onConfirm={handleConfirmCancel}
        serviceName={cancellingBooking?.service?.serviceName}
      />
    </div>
  );
}
