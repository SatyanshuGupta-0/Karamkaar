import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin, Loader2, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { get, put } from "../utils/api";
import { getAccuratePosition, reverseGeocode } from "../utils/geocode";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Car Wash",
  "AC Repair",
  "Carpentry",
  "Painting",
  "Appliance Repair",
];

const SEARCH_DEBOUNCE_MS = 400;

const BrowseProviders = () => {
  const navigate = useNavigate();
  const searchBoxRef = useRef(null);

  const [locating, setLocating] = useState(true);
  const [locationLabel, setLocationLabel] = useState("");
  const [locationError, setLocationError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Live suggestions sourced from what providers have actually listed
  // (name + provider-defined keywords) — no hardcoded service list to
  // maintain, so it stays accurate as providers add new service types.
  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await get(
          `/user/services/suggest?q=${encodeURIComponent(query)}`
        );
        setSuggestions(res?.suggestions || []);
      } catch (error) {
        console.error("Failed to load suggestions:", error);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  // Auto-search: debounced so it doesn't fire on every keystroke, and
  // there's no separate Search button to click anymore.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders({ search });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Close the suggestions dropdown when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // On first load: get an accurate GPS fix, save it to the backend
  // (so $near queries have something to search from), then fetch
  // nearby providers.
  useEffect(() => {
    (async () => {
      try {
        setLocating(true);
        const { latitude, longitude } = await getAccuratePosition();

        await put("/user/update-location", { latitude, longitude });

        try {
          const address = await reverseGeocode(latitude, longitude);
          setLocationLabel(
            address.city || address.fullAddress || "Current location"
          );
        } catch {
          setLocationLabel("Current location");
        }

        setLocationError(null);
        fetchProviders();
      } catch (error) {
        console.error(error);
        setLocationError(
          "Couldn't get your location. Please allow location access to find nearby providers."
        );
      } finally {
        setLocating(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProviders = async (overrides = {}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      const s = overrides.search ?? search;
      const c = overrides.category ?? category;
      if (s) params.set("serviceName", s);
      if (c) params.set("category", c);

      const query = params.toString();
      const res = await get(
        `/user/providers/nearby${query ? `?${query}` : ""}`
      );
      setProviders(res?.providers || []);
    } catch (error) {
      console.error("Failed to load providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickSuggestion = (entry) => {
    setSearch(entry.serviceName);
    setShowSuggestions(false);
    setCategory("");
    fetchProviders({ search: entry.serviceName, category: "" });
  };

  const clearSearch = () => {
    setSearch("");
    setShowSuggestions(false);
    fetchProviders({ search: "" });
  };

  const pickCategory = (cat) => {
    const next = category === cat ? "" : cat;
    setCategory(next);
    fetchProviders({ category: next });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Find a service near you</h1>
          <p className="text-gray-500 flex items-center gap-1.5">
            <MapPin size={16} />
            {locating
              ? "Finding your location…"
              : locationLabel || "Location unavailable"}
          </p>
        </div>

        {locationError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mb-6">
            {locationError}
          </div>
        )}

        {/* Search — auto-searches as you type, no button needed */}
        <div ref={searchBoxRef} className="relative mb-6">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Try 'electrican', 'ac', 'plumer'…"
            className="w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-12 py-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          {/* Inline status: spinner while searching, clear (X) otherwise */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 size={18} className="animate-spin text-blue-500" />
            ) : (
              search.length > 0 && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )
            )}
          </div>

          {showSuggestions && search.length > 0 && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border bg-white shadow-xl z-50 overflow-hidden">
              {suggestions.map((item) => (
                <button
                  key={item.serviceName}
                  type="button"
                  onClick={() => pickSuggestion(item)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-100 transition text-left"
                >
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="font-medium">{item.serviceName}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => pickCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                category === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading || locating ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            {locating ? "Finding your location…" : "Searching nearby providers…"}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <p className="text-gray-500 mb-2">
              No online providers found nearby right now.
            </p>
            <p className="text-gray-400 text-sm">
              Try a different search, or check back soon.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <button
                key={p._id}
                onClick={() => navigate(`/booking/provider/${p._id}`)}
                className="text-left bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={p.avatar?.url || "https://i.pravatar.cc/100?u=" + p._id}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Star size={14} fill="currentColor" />
                      {p.providerDetails?.averageRating || "New"}
                      <span className="text-gray-400">
                        ({p.providerDetails?.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(p.providerDetails?.services || [])
                    .slice(0, 3)
                    .map((s) => (
                      <span
                        key={s._id}
                        className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full"
                      >
                        {s.serviceName}
                      </span>
                    ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseProviders;