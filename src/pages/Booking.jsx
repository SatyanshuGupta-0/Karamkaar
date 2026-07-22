import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  LocateFixed,
  IndianRupee,
  Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { post } from "../utils/api";
import { getAccuratePosition, reverseGeocode } from "../utils/geocode";
import { useProviderAvailability } from "../hooks/useProviderAvailability";
import ProviderBusyBanner from "../components/booking/ProviderBusyBanner";
import { useToast } from "../context/ToastContext";

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { providerId, providerName, service } = location.state || {};
  const { isBusy, isOffline } = useProviderAvailability(providerId);

  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const [formData, setFormData] = useState({
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    scheduledDate: "",
    customerNote: "",
    paymentMethod: "COD",
  });

  // If someone lands here directly (refresh, back button, bookmarked
  // link) without picking a provider/service first, send them back
  // to start that flow properly instead of crashing.
  if (!providerId || !service) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">
            Pick a provider and service first to book.
          </p>
          <Link to="/booking" className="text-blue-600 font-medium">
            Browse providers
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getCurrentLocation = async () => {
    try {
      setLocating(true);

      const { latitude, longitude } = await getAccuratePosition();

      setFormData((prev) => ({ ...prev, latitude, longitude }));

      try {
        const address = await reverseGeocode(latitude, longitude);
        setFormData((prev) => ({
          ...prev,
          fullAddress: address.fullAddress || prev.fullAddress,
          city: address.city || prev.city,
          state: address.state || prev.state,
          pincode: address.pincode || prev.pincode,
        }));
      } catch (geocodeError) {
        console.error("Reverse geocoding failed:", geocodeError);
      }
    } catch (error) {
      console.error("Location error:", error);
      toast.error(
        "Couldn't get your location. Please allow location access and try again."
      );
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude || !formData.fullAddress) {
      toast.warning(
        'Please share your location using "Use Current Location" so the provider knows where to go.'
      );
      return;
    }
    console.log(service)
    const payload = {
      providerId,
      serviceId: service?._id,

      address: {
        fullAddress: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        location: {
          type: "Point",
          coordinates: [
            Number(formData.longitude),
            Number(formData.latitude),
          ],
        },
      },

      scheduledDate: formData.scheduledDate || undefined,
      customerNote: formData.customerNote,
      paymentMethod: formData.paymentMethod,
    };

    try {
      setSubmitting(true);

      const response = await post("/booking/create", payload);
      const bookingId = response?.data?._id;

      toast.success(response?.message || "Booking confirmed");

      if (bookingId) {
        navigate(`/trackbooking/${bookingId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Couldn't confirm your booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-1">Confirm your booking</h1>
        <p className="text-gray-500 mb-8">
          with {providerName || "your provider"}
        </p>

        {(isBusy || isOffline) && (
          <ProviderBusyBanner
            offline={isOffline}
            providerId={providerId}
            providerName={providerName}
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-lg">{service.serviceName}</h3>
          <p className="text-gray-500 text-sm mb-3">{service.category}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1 font-semibold text-gray-900">
              <IndianRupee size={14} />
              {service.price}
            </span>
            {service.estimatedTime && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {service.estimatedTime}
              </span>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-6"
        >
          <div>
            <label className="flex items-center gap-2 font-semibold mb-3">
              <MapPin size={18} />
              Service Address
            </label>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locating}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl disabled:opacity-60 mb-4"
            >
              <LocateFixed size={18} />
              {locating ? "Finding your location…" : "Use Current Location"}
            </button>

            <div className="grid gap-3">
              <input
                type="text"
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleChange}
                placeholder="Full address"
                required
                className="border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  className="border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {formData.latitude && (
              <p className="text-green-700 text-sm mt-2">
                Location captured — address filled in automatically, feel
                free to adjust it.
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold mb-3">
              <Calendar size={18} />
              When do you need this?
            </label>
            <input
              type="datetime-local"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold mb-3">
              <FileText size={18} />
              Notes for the provider (optional)
            </label>
            <textarea
              name="customerNote"
              value={formData.customerNote}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the issue, access instructions, etc."
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold mb-3">
              <CreditCard size={18} />
              Payment method
            </label>
            <div className="flex gap-3">
              {["COD", "Online"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: method,
                    }))
                  }
                  className={`flex-1 py-3 rounded-xl font-medium border ${
                    formData.paymentMethod === method
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {method === "COD" ? "Cash on Service" : "Pay Online"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isBusy || isOffline}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold disabled:opacity-60"
          >
            {isBusy || isOffline
              ? "Provider unavailable"
              : submitting
              ? "Confirming booking…"
              : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
