import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  DollarSign,
  Star,
  Briefcase,
  CheckCircle,
  XCircle,
  MapPin,
  LogOut,
  Power,
  KeyRound,
  PlayCircle,
  Menu,
  X,
  User as UserIcon,
  Navigation2,
  Wallet,
  CreditCard,
  Clock,
} from "lucide-react";
import LocationTracker from "../components/LocationTracker";
import NotificationBell from "../components/notifications/NotificationBell";
import CompletePaymentModal from "../components/provider/CompletePaymentModal";
import { useProviderRequestsFeed } from "../hooks/useProviderRequestsFeed";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../hooks/useConfirm";
import { usePrompt } from "../hooks/usePrompt";
import { put, post } from "../utils/api";
import {
  getUser,
  logout,
  hasRole,
  getCurrentRole,
  setCurrentRole,
  distanceKm,
} from "../utils/auth";

// Real backend enum (booking_model.js): Pending, Accepted, Rejected,
// OnTheWay, Started, Completed, Cancelled — PascalCase, not uppercase.
const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-600",
  Accepted: "bg-blue-100 text-blue-600",
  OnTheWay: "bg-indigo-100 text-indigo-600",
  Started: "bg-purple-100 text-purple-600",
  Completed: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-600",
  Cancelled: "bg-red-100 text-red-600",
};

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [actioningId, setActioningId] = useState(null);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const { promptText, PromptDialog } = usePrompt();
  const {
    bookings,
    setBookings,
    profile,
    setProfile,
    loading,
    refresh: fetchDashboard,
  } = useProviderRequestsFeed();
  const [search, setSearch] = useState("");
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [completingJob, setCompletingJob] = useState(null);

  const currentRole = getCurrentRole();
  const isDualRole = hasRole("USER") && hasRole("PROVIDER");

  const switchRole = (role) => {
    setCurrentRole(role);
    navigate(role === "PROVIDER" ? "/provider/dashboard" : "/dashboard");
  };

  const toggleAvailability = async () => {
    try {
      setTogglingAvailability(true);
      const res = await put("/user/toggle-availability");
      setProfile((prev) => ({
        ...prev,
        providerDetails: {
          ...prev.providerDetails,
          availabilityStatus: res.availabilityStatus,
        },
      }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Couldn't update availability"
      );
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      setActioningId(bookingId);
      const res = await put(`/booking/accept/${bookingId}`);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.booking : b))
      );
      toast.success(`Accepted! OTP for this job: ${res.booking.otp}`, 8000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not accept booking");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      setActioningId(bookingId);
      const res = await put(`/booking/reject/${bookingId}`, {
        reason: "Not available",
      });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.booking : b))
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not reject booking");
    } finally {
      setActioningId(null);
    }
  };

  const handleVerifyOtpAndStart = async (bookingId) => {
    const otp = await promptText("Enter the OTP the customer gave you", {
      placeholder: "6-digit OTP",
      submitLabel: "Verify & Start",
    });
    if (!otp) return;

    try {
      setActioningId(bookingId);
      await post("/booking/verify-otp", { bookingId, otp });
      const res = await put(`/booking/start/${bookingId}`);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.booking : b))
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setActioningId(null);
    }
  };

  const handleComplete = async (paymentMethod) => {
    const bookingId = completingJob?._id;
    if (!bookingId) return;
    try {
      setActioningId(bookingId);
      const res = await put(`/booking/complete/${bookingId}`, {
        paymentMethod,
      });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.booking : b))
      );
      toast.success(
        paymentMethod === "Cash"
          ? "Marked completed — cash collected"
          : "Marked completed — payment collected"
      );
      setCompletingJob(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not complete booking");
    } finally {
      setActioningId(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const ok = await confirm(
      "Cancel this booking? The customer will be notified and can book another provider.",
      { confirmLabel: "Cancel Booking", danger: true }
    );
    if (!ok) return;
    try {
      setActioningId(bookingId);
      const res = await put(`/booking/cancel/${bookingId}`, {
        reason: "Cancelled by provider",
      });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.booking : b))
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not cancel booking");
    } finally {
      setActioningId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isOnline =
    profile?.providerDetails?.availabilityStatus === "ONLINE";

  const stats = {
    earnings: profile?.providerDetails?.totalEarnings ?? 0,
    completed: profile?.providerDetails?.totalCompletedJobs ?? 0,
    rating: profile?.providerDetails?.averageRating ?? 0,
    bookings: bookings.length,
  };

  const filteredBookings = bookings.filter((job) => {
    const name = job?.customer?.name || "";
    const service = job?.service?.serviceName || "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || service.toLowerCase().includes(q);
  });

  const getJobDistance = (job) => {
    const providerCoords = profile?.currentLocation?.coordinates;
    const customerCoords = job?.address?.location?.coordinates;

    if (
      !providerCoords ||
      !customerCoords ||
      (providerCoords[0] === 0 && providerCoords[1] === 0)
    ) {
      return null;
    }

    const km = distanceKm(
      [providerCoords[1], providerCoords[0]],
      [customerCoords[1], customerCoords[0]]
    );

    return km;
  };

  return (
    <>
      <LocationTracker />

      <div className="min-h-screen bg-slate-100 overflow-x-hidden">
        <nav className="bg-white shadow-sm px-4 sm:px-8 py-4 relative">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
              ServicePro
            </h1>

            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-4">
              {isDualRole && (
                <div className="flex bg-slate-100 rounded-xl p-1 text-sm font-medium">
                  <button
                    onClick={() => switchRole("USER")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      currentRole === "USER"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => switchRole("PROVIDER")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      currentRole === "PROVIDER"
                        ? "bg-green-600 text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Provider
                  </button>
                </div>
              )}

              <button
                onClick={toggleAvailability}
                disabled={togglingAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 transition ${
                  isOnline
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                {isOnline ? "Online" : "Offline"}
              </button>

              <NotificationBell />

              <img
                src={profile?.avatar?.url || "https://i.pravatar.cc/100"}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
                title={isOnline ? "Online" : "Offline"}
              />
              <NotificationBell />
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="text-gray-600 p-1"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown panel */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg border-t z-50 p-4 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <img
                  src={profile?.avatar?.url || "https://i.pravatar.cc/100"}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user?.name || "Provider"}</p>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
              </div>

              {isDualRole && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Switch account</p>
                  <div className="flex bg-slate-100 rounded-xl p-1 text-sm font-medium">
                    <button
                      onClick={() => {
                        switchRole("USER");
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition ${
                        currentRole === "USER"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600"
                      }`}
                    >
                      <UserIcon size={14} />
                      Customer
                    </button>
                    <button
                      onClick={() => {
                        switchRole("PROVIDER");
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition ${
                        currentRole === "PROVIDER"
                          ? "bg-green-600 text-white"
                          : "text-gray-600"
                      }`}
                    >
                      <Briefcase size={14} />
                      Provider
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={toggleAvailability}
                disabled={togglingAvailability}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 transition ${
                  isOnline
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Power size={16} />
                {isOnline ? "You're Online" : "You're Offline"}
              </button>

              <button
                onClick={() => {
                  navigate("/providerprofile");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-gray-700 font-medium"
              >
                Profile & Services
              </button>

              <button
                onClick={() => {
                  navigate(`/booking/provider/${user?._id}`);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-gray-700 font-medium"
              >
                <Star size={16} />
                Reviews
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 font-medium hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </nav>

        <div className="flex">
          <aside className="w-72 min-h-screen bg-white shadow-md p-6 hidden lg:block">
            <ul className="space-y-4">
              <li className="bg-blue-600 text-white p-3 rounded-xl">
                Dashboard
              </li>
              <li
                onClick={() => navigate("/providerprofile")}
                className="hover:bg-slate-100 p-3 rounded-xl cursor-pointer"
              >
                Profile & Services
              </li>
              <li
                onClick={() => navigate(`/booking/provider/${user?._id}`)}
                className="hover:bg-slate-100 p-3 rounded-xl cursor-pointer flex items-center gap-2"
              >
                <Star size={16} />
                Reviews
              </li>
            </ul>
          </aside>

          <main className="flex-1 min-w-0 p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold">
                  Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                </h2>
                <p className="text-gray-500">
                  {isOnline
                    ? "You're online — new requests will come in."
                    : "You're offline — go online to receive bookings."}
                </p>
              </div>

              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bookings..."
                  className="pl-10 pr-4 py-2 rounded-xl border bg-white w-full sm:w-64"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <DollarSign className="text-green-500 mb-3" />
                <p className="text-gray-500">Total earnings</p>
                <h3 className="text-3xl font-bold">
                  ₹{stats.earnings.toLocaleString("en-IN")}
                </h3>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <Briefcase className="text-blue-500 mb-3" />
                <p className="text-gray-500">Jobs completed</p>
                <h3 className="text-3xl font-bold">{stats.completed}</h3>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <Star className="text-yellow-500 mb-3" />
                <p className="text-gray-500">Rating</p>
                <h3 className="text-3xl font-bold">{stats.rating}</h3>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <Calendar className="text-purple-500 mb-3" />
                <p className="text-gray-500">Bookings</p>
                <h3 className="text-3xl font-bold">{stats.bookings}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold">Service requests</h2>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                </div>
                <button
                  onClick={fetchDashboard}
                  className="text-blue-600 text-sm font-medium"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="text-gray-500 py-10 text-center">
                  Loading bookings…
                </p>
              ) : filteredBookings.length === 0 ? (
                <p className="text-gray-500 py-10 text-center">
                  No bookings yet. New requests will show up here.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredBookings.map((job) => {
                    const distance = getJobDistance(job);
                    const isOnlinePayment = job?.paymentMethod === "Online";

                    return (
                      <div
                        key={job._id}
                        className="border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                job?.customer?.avatar?.url ||
                                "https://i.pravatar.cc/80?u=" + job._id
                              }
                              alt=""
                              className="w-11 h-11 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold truncate">
                                {job?.customer?.name || "Customer"}
                              </p>
                              <p className="text-gray-400 text-xs truncate">
                                {job?.customer?.mobile || ""}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                              statusStyles[job.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {job?.service?.serviceName || "Service"}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {job?.service?.category || ""}
                            </p>
                          </div>
                          <p className="font-bold text-lg">
                            ₹{job?.service?.price ?? 0}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm bg-slate-50 rounded-xl px-3 py-2.5">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Navigation2 size={14} className="text-blue-600" />
                            {distance !== null
                              ? `${distance.toFixed(1)} km away`
                              : "Distance unavailable"}
                          </span>

                          <span
                            className={`flex items-center gap-1.5 ${
                              isOnlinePayment
                                ? "text-indigo-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {isOnlinePayment ? (
                              <CreditCard size={14} />
                            ) : (
                              <Wallet size={14} />
                            )}
                            {isOnlinePayment ? "Paid online" : "Cash on service"}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500 space-y-1.5">
                          <p className="flex items-start gap-1.5">
                            <MapPin size={14} className="mt-0.5 shrink-0" />
                            <span className="line-clamp-2">
                              {job?.address?.fullAddress ||
                                "Address not provided"}
                            </span>
                          </p>
                          {job?.scheduledDate && (
                            <p className="flex items-center gap-1.5">
                              <Clock size={14} className="shrink-0" />
                              {new Date(job.scheduledDate).toLocaleString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t">
                          {job.status === "Pending" ? (
                            <div className="flex gap-3">
                              <button
                                disabled={actioningId === job._id}
                                onClick={() => handleAccept(job._id)}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2.5 rounded-xl font-medium disabled:opacity-50"
                              >
                                <CheckCircle size={16} />
                                Accept
                              </button>
                              <button
                                disabled={actioningId === job._id}
                                onClick={() => handleReject(job._id)}
                                className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 py-2.5 rounded-xl font-medium disabled:opacity-50"
                              >
                                <XCircle size={16} />
                                Decline
                              </button>
                            </div>
                          ) : job.status === "Accepted" ? (
                            <div className="flex gap-3">
                              <button
                                onClick={() =>
                                  navigate(`/trackbooking/${job._id}`)
                                }
                                className="flex-1 flex items-center justify-center gap-1.5 border border-blue-200 text-blue-600 py-2.5 rounded-xl font-medium"
                              >
                                <MapPin size={16} />
                                Navigate
                              </button>
                              <button
                                disabled={actioningId === job._id}
                                onClick={() =>
                                  handleVerifyOtpAndStart(job._id)
                                }
                                className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 text-white py-2.5 rounded-xl font-medium disabled:opacity-50"
                              >
                                <KeyRound size={16} />
                                Verify & Start
                              </button>
                              <button
                                disabled={actioningId === job._id}
                                onClick={() => handleCancelBooking(job._id)}
                                title="Cancel booking"
                                className="flex items-center justify-center gap-1.5 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl font-medium disabled:opacity-50"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : job.status === "Started" ? (
                            <div className="flex gap-3">
                              <button
                                disabled={actioningId === job._id}
                                onClick={() => setCompletingJob(job)}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 text-white py-2.5 rounded-xl font-medium disabled:opacity-50"
                              >
                                <PlayCircle size={16} />
                                Mark Completed
                              </button>
                              <button
                                disabled={actioningId === job._id}
                                onClick={() => handleCancelBooking(job._id)}
                                title="Cancel booking"
                                className="flex items-center justify-center gap-1.5 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl font-medium disabled:opacity-50"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : (
                            <p className="text-center text-gray-400 text-sm py-1">
                              No action needed
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {ConfirmDialog}
      {PromptDialog}
      <CompletePaymentModal
        open={Boolean(completingJob)}
        job={completingJob}
        providerId={user?._id}
        onClose={() => setCompletingJob(null)}
        onConfirm={handleComplete}
        submitting={Boolean(actioningId)}
      />
    </>
  );
}