import React from "react";
import { Link } from "react-router-dom";
import {
    User,
    Briefcase,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";

const Landing = () => {
    return (
        <div className="min-h-screen min-w-fit bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            <nav className="flex justify-between items-center px-8 py-6">
                            <h1 className="text-3xl font-bold text-white">
                                Karamkaar
                            </h1>
            
                            <div className="flex gap-4">
                                <Link
                                    to="/login"
                                    className="bg-white/20 text-white px-5 py-2 rounded-xl"
                                >
                                    Login
                                </Link>
            
                            </div>
                        </nav>
            {/* Hero */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-6">
                        <ShieldCheck size={18} />
                        Trusted Service Marketplace
                    </div>

                    <h1 className="text-6xl font-bold text-white mb-6">
                        Find Professionals
                        <br />
                        Or Grow Your Business
                    </h1>

                    <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12">
                        Connect customers with trusted service providers.
                        Book services, manage requests and grow your
                        business from one platform.
                    </p>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Customer */}
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                            <User size={30} className="text-blue-600" />
                        </div>

                        <h2 className="text-3xl font-bold mb-4">
                            I'm a Customer
                        </h2>

                        <p className="text-gray-600 mb-8">
                            Find electricians, plumbers, cleaners,
                            mechanics, AC repair experts and more.
                        </p>

                        <Link
                            to="/signup?role=USER"
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-semibold"
                        >
                            Continue as Customer
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Provider */}
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                            <Briefcase
                                size={30}
                                className="text-green-600"
                            />
                        </div>

                        <h2 className="text-3xl font-bold mb-4">
                            I'm a Service Provider
                        </h2>

                        <p className="text-gray-600 mb-8">
                            Accept jobs, manage bookings, track
                            earnings and grow your service business.
                        </p>

                        <Link
                            to="/signup?role=PROVIDER"
                            className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl font-semibold"
                        >
                            Continue as Provider
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mt-16">
                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl text-white">
                        <h3 className="font-bold text-xl mb-2">
                            Verified Professionals
                        </h3>
                        <p className="text-white/80">
                            Trusted and background-checked providers.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl text-white">
                        <h3 className="font-bold text-xl mb-2">
                            Easy Booking
                        </h3>
                        <p className="text-white/80">
                            Book services within seconds.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl text-white">
                        <h3 className="font-bold text-xl mb-2">
                            Secure Payments
                        </h3>
                        <p className="text-white/80">
                            Safe and transparent transactions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;