import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Briefcase, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { setCurrentRole, isAuthenticated } from "../utils/auth";

const ChooseRole = () => {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);

  if (!isAuthenticated()) {
    navigate("/login", { replace: true });
    return null;
  }

  const selectRole = (role) => {
    setLoadingRole(role);
    setCurrentRole(role);

    setTimeout(() => {
      navigate(role === "PROVIDER" ? "/provider/dashboard" : "/landing");
    }, 250);
  };

  const roles = [
    {
      key: "USER",
      title: "Continue as customer",
      description:
        "Find electricians, plumbers, cleaners, mechanics, AC repair experts and more.",
      icon: User,
      accent: "blue",
    },
    {
      key: "PROVIDER",
      title: "Continue as provider",
      description:
        "Accept jobs, manage bookings, track earnings and grow your service business.",
      icon: Briefcase,
      accent: "green",
    },
  ];

  const accentClasses = {
    blue: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      ring: "hover:border-blue-300 focus-visible:ring-blue-500",
    },
    green: {
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      button: "bg-green-600 hover:bg-green-700",
      ring: "hover:border-green-300 focus-visible:ring-green-500",
    },
  };

  return (
    <div className="min-h-screen min-w-fit bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col">
      <div className="flex items-center justify-between px-8 py-6">
        <Link to="/" className="text-3xl font-bold text-white">
          Karamkaar
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-6">
              <ShieldCheck size={18} />
              Trusted service marketplace
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Choose your account
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Your account has both roles. Pick how you'd like to use
              ServiceHub right now — you can switch anytime from the top bar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {roles.map(({ key, title, description, icon: Icon, accent }) => {
              const styles = accentClasses[accent];
              const isLoading = loadingRole === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectRole(key)}
                  disabled={loadingRole !== null}
                  aria-busy={isLoading}
                  className={`group text-left bg-white rounded-3xl p-8 shadow-2xl border-2 border-transparent transition-all duration-200 ${styles.ring} focus:outline-none focus-visible:ring-4 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-105`}
                  >
                    <Icon size={30} className={styles.iconColor} />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {key === "USER" ? "I'm a customer" : "I'm a service provider"}
                  </h2>

                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {description}
                  </p>

                  <span
                    className={`flex items-center justify-center gap-2 ${styles.button} text-white py-4 rounded-xl font-semibold transition-colors`}
                  >
                    {isLoading ? "Setting up your account…" : title}
                    {!isLoading && (
                      <ArrowRight
                        size={18}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;
