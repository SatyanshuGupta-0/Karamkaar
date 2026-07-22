import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Star, ArrowLeft, Clock, IndianRupee, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import { get } from "../utils/api";
import { fetchProviderReviews } from "../utils/reviews";
import ReviewList from "../components/reviews/ReviewList";
import { useProviderAvailability } from "../hooks/useProviderAvailability";
import ProviderBusyBanner from "../components/booking/ProviderBusyBanner";

const ProviderDetail = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { isBusy, isOffline } = useProviderAvailability(providerId);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Nearby search returns a lean list — reuse it filtered by id
        // rather than needing a dedicated "get provider by id" route.
        const res = await get(
          `/user/providers/nearby?maxDistance=50000`
        );
        const found = (res?.providers || []).find(
          (p) => p._id === providerId
        );
        setProvider(found || null);

        const providerReviews = await fetchProviderReviews(providerId);
        setReviews(providerReviews);
      } catch (error) {
        console.error("Failed to load provider:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [providerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <p className="text-center text-gray-500 py-20">Loading provider…</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">
            Couldn't find this provider — they may be offline now.
          </p>
          <Link to="/booking" className="text-blue-600 font-medium">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/booking")}
          className="flex items-center gap-2 text-gray-500 mb-6"
        >
          <ArrowLeft size={16} />
          Back to search
        </button>

        {(isBusy || isOffline) && (
          <ProviderBusyBanner
            offline={isOffline}
            providerId={provider._id}
            providerName={provider.name}
          />
        )}

        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-5">
            <img
              src={
                provider.avatar?.url ||
                "https://i.pravatar.cc/150?u=" + provider._id
              }
              alt=""
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              <div className="flex items-center gap-1 text-yellow-600 mt-1">
                <Star size={16} fill="currentColor" />
                {provider.providerDetails?.averageRating || "New"}
                <span className="text-gray-400 text-sm">
                  ({provider.providerDetails?.totalReviews || 0} reviews)
                </span>
              </div>
              {provider.providerDetails?.experience > 0 && (
                <p className="text-gray-500 text-sm mt-1">
                  {provider.providerDetails.experience} years experience
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 text-xs px-2.5 py-1 rounded-full mt-2">
                <ShieldCheck size={12} />
                Online now
              </span>
            </div>
          </div>

          {provider.providerDetails?.description && (
            <p className="text-gray-600 mt-6">
              {provider.providerDetails.description}
            </p>
          )}
        </div>

        <h2 className="text-xl font-bold mb-4">Services offered</h2>

        <div className="space-y-4 mb-10">
          {(provider.providerDetails?.services || []).length === 0 ? (
            <p className="text-gray-500">
              This provider hasn't listed any services yet.
            </p>
          ) : (
            provider.providerDetails.services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-lg">
                    {service.serviceName}
                  </h3>
                  <p className="text-gray-500 text-sm">{service.category}</p>
                  {service.description && (
                    <p className="text-gray-500 text-sm mt-1">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
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

                <button
                  onClick={() =>
                    navigate("/booking/confirm", {
                      state: {
                        providerId: provider._id,
                        providerName: provider.name,
                        service,
                      },
                    })
                  }
                  disabled={isBusy || isOffline}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shrink-0 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isBusy || isOffline ? "Unavailable" : "Book"}
                </button>
              </div>
            ))
          )}
        </div>

        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        <ReviewList reviews={reviews} emptyText="No reviews yet — be the first to book and rate this provider." />
      </div>
    </div>
  );
};

export default ProviderDetail;
