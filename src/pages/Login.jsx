import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { post } from "../utils/api";
import { setCurrentRole } from "../utils/auth";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const response = await post(
      "/user/login",
      formData
    );

    const {
      accessToken,
      refreshToken,
      user,
    } = response.data;

    localStorage.setItem(
      "accessToken",
      accessToken
    );

   

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    // USER + PROVIDER
    if (
      user.role.includes("USER") &&
      user.role.includes("PROVIDER")
    ) {
      navigate("/choose-role");
      return;
    }

    // PROVIDER ONLY
    if (
      user.role.includes("PROVIDER")
    ) {
      setCurrentRole("PROVIDER");

      navigate(
        "/provider/dashboard"
      );

      return;
    }

    // USER ONLY
    setCurrentRole("USER");

    navigate("/dashboard");
  } catch (error) {
    console.error(error);

    toast.error(
      error?.response?.data
        ?.message ||
        "Login Failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">

        {/* Left Side */}

        <div className="hidden lg:flex bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 text-white flex-col justify-center">

          <h1 className="text-5xl font-bold mb-6">
            ServiceHub
          </h1>

          <p className="text-lg text-blue-100 leading-8">
            Login to manage bookings,
            services, providers and
            your account dashboard.
          </p>

          <div className="space-y-4 mt-10">

            <div className="bg-white/10 p-4 rounded-2xl">
              ✓ Live Booking Tracking
            </div>

            <div className="bg-white/10 p-4 rounded-2xl">
              ✓ Secure Authentication
            </div>

            <div className="bg-white/10 p-4 rounded-2xl">
              ✓ Instant Notifications
            </div>

            <div className="bg-white/10 p-4 rounded-2xl">
              ✓ Manage Services Easily
            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="p-8 md:p-12">

          <div className="text-center mb-8">

            <h2 className="text-4xl font-bold">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Login to your account
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type="email"
                name="email"
                required
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="Email Address"
                className="w-full border border-gray-300 rounded-xl pl-12 p-3 outline-none focus:border-blue-500"
              />

            </div>

            {/* Password */}

            <div className="relative">

              <Lock
                size={18}
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                required
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                placeholder="Password"
                className="w-full border border-gray-300 rounded-xl pl-12 pr-12 p-3 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-4"
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}
              </button>

            </div>

            <div className="flex justify-end">

              <Link
                to="/forgot-password"
                className="text-blue-600 text-sm"
              >
                Forgot Password?
              </Link>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            >
              {loading
                ? "Logging In..."
                : "Login"}
            </button>

          </form>

          <div className="text-center mt-8">

           <div className="mt-6 mb-2 text-center">
            <GoogleAuthButton onError={(msg) => toast.error(msg)} />
          </div>
            <p className="text-gray-500 mt-4">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 font-semibold"
              >
                Sign Up
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;