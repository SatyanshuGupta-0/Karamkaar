import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  ShieldCheck,
  Clock3,
  Wrench,
  Paintbrush,
  Zap,
  Droplets,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { isAuthenticated } from "../utils/auth";
import LocationTracker from "../components/LocationTracker";
import { get } from "../utils/api";



const Home = () => {
  const services = [
    { name: "Electrician", icon: <Zap size={32} /> },
    { name: "Plumber", icon: <Droplets size={32} /> },
    { name: "Carpenter", icon: <Wrench size={32} /> },
    { name: "Painter", icon: <Paintbrush size={32} /> },
  ];
  const [providers, setProviders] = useState([]);
  const navigate = useNavigate();

  const goToBooking = () => {
    navigate(isAuthenticated() ? "/booking" : "/login");
  };

  
const fetchNearbyProviders = async () => {
  try {
    const response = await get("/user/providers/nearby");
    
    console.log(response);
    
    if (response.success) {
      setProviders(response.providers);
    }
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  fetchNearbyProviders();
}, []);

  return (
<>
    <LocationTracker />

    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-6xl font-bold mb-6">
            Book Trusted Home Services
          </h1>

          <p className="text-xl mb-10 opacity-90">
            Electricians, Plumbers, Cleaners, AC Repair and more.
          </p>

          <div className="">

            <button
              onClick={goToBooking}
              className="bg-white text-blue-600 px-9 py-4 cursor-pointer rounded-xl"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Popular Services
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-white p-8 rounded-3xl shadow hover:shadow-xl transition cursor-pointer"
            >
              <div className="text-blue-600 mb-4">
                {service.icon}
              </div>

              <h3 className="font-bold text-xl">
                {service.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

     {/* Top Providers */}
<section className="bg-white py-20">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center mb-12">
      Top Rated Providers
    </h2>

    <div className="grid md:grid-cols-3 gap-8">
      {providers.map((provider) => (
        <div
          key={provider._id}
          className="border rounded-3xl p-6"
        >
          <div className="flex items-center gap-4">
            <img
              src={
                provider.avatar?.url ||
                "https://i.pravatar.cc/100"
              }
              alt={provider.name}
              className="w-16 h-16 rounded-full object-cover"
            />

            <div>
              <h3 className="font-bold">
                {provider.name}
              </h3>

              <p className="text-gray-500">
                {provider.providerDetails?.services?.[0]
                  ?.serviceName || "No Service"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-yellow-500">
            <Star size={18} fill="currentColor" />
            {provider.providerDetails?.averageRating || 0}
          </div>

          <button
            onClick={() => goToBooking(provider)}
            className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl"
          >
            Book Now
          </button>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Why Us */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose Us
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow">
            <ShieldCheck
              className="text-green-500 mb-4"
              size={40}
            />
            <h3 className="font-bold text-xl mb-2">
              Verified Professionals
            </h3>
            <p className="text-gray-500">
              All providers are background verified.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow">
            <Clock3
              className="text-blue-500 mb-4"
              size={40}
            />
            <h3 className="font-bold text-xl mb-2">
              Quick Service
            </h3>
            <p className="text-gray-500">
              Get help within minutes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow">
            <Star
              className="text-yellow-500 mb-4"
              size={40}
            />
            <h3 className="font-bold text-xl mb-2">
              Top Ratings
            </h3>
            <p className="text-gray-500">
              Thousands of satisfied customers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold mb-6">
            Need Help Today?
          </h2>

          <p className="text-xl mb-8">
            Book a trusted professional in seconds.
          </p>

          <button
            onClick={goToBooking}
            className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold"
          >
            Book Service Now
          </button>
        </div>
      </section>
    </div>
    </>

  );
};

export default Home;