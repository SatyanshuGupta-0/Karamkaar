import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PhoneInputModule from "react-phone-input-2";

const PhoneInput = PhoneInputModule.default;
import "react-phone-input-2/lib/style.css";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
} from "lucide-react";

import { post } from "../utils/api";
import GoogleAuthButton from "../components/GoogleAuthButton";
import OtpModal from "../components/auth/OtpModal";
import { useToast } from "../context/ToastContext";

const Signup = () => {
    const [searchParams] =
  useSearchParams();

const role =
  searchParams.get("role") ||
  "USER";

  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] =
    useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] =
  useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role,
  });

  useEffect(() => {
    localStorage.setItem('userEmail', formData.email);
  }, [formData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleRoleChange = (
    role
  ) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await post(
          "/user/register",
          formData
        );
      console.log(response)

      toast.success(
        response?.message ||
          "Account created — verify your mobile number to continue"
      );

      setShowOtpModal(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">

        {/* Left Side */}
        <div className="hidden lg:flex bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 text-white flex-col justify-center">

          <h1 className="text-5xl font-bold mb-6">
            ServiceHub
          </h1>

          <p className="text-lg text-blue-100 leading-8">
            Find trusted professionals,
            book services instantly,
            track providers live, and
            manage all bookings in one
            place.
          </p>

          <div className="space-y-4 mt-10">

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              ✓ Verified Service Providers
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              ✓ Live Location Tracking
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              ✓ Secure Payments
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              ✓ Fast Booking Process
            </div>

          </div>

        </div>

        {/* Right Side */}
        <div className="p-8 md:p-12">

          <div className="text-center mb-8">

            <h2 className="text-4xl font-bold">
              Create Account
            </h2>

            <p className="text-gray-500 mt-2">
              Join as a customer or
              service provider
            </p>

          </div>

          {/* Role Selection */}

           <div
  className={`mb-8 p-4 rounded-xl text-center font-semibold ${
    role === "PROVIDER"
      ? "bg-green-100 text-green-700 border border-green-200"
      : "bg-blue-100 text-blue-700 border border-blue-200"
  }`}
>
  {role === "PROVIDER"
    ? "🚀 Service Provider Registration"
    : "👤 Customer Registration"}
</div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}

            <div className="relative">

              <User
                size={18}
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type="text"
                name="name"
                required
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-xl pl-12 p-3 outline-none focus:border-blue-500"
              />

            </div>

            {/* Mobile */}
            



<div className="relative">
  

  <PhoneInput
  country={"in"}
  enableSearch
  value={formData.mobile}
  onChange={(phone) =>
    setFormData({
      ...formData,
      mobile: phone,
    })
  }
  containerStyle={{
    width: "100%",
  }}
  inputStyle={{
    width: "100%",
    height: "50px",
    paddingLeft: "50px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
  }}
  buttonStyle={{
    width: "45px",
    background: "transparent",
    border: "none",
    borderRight: "1px solid #e5e7eb",
    borderRadius: "12px 0 0 12px",
  }}
/>
</div>

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
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* Provider Info */}

            {formData.role ===
              "PROVIDER" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">

                <h3 className="font-semibold text-green-700">
                  Service Provider
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  After registration
                  you'll be able to
                  complete your
                  profile, add
                  services, upload
                  documents and start
                  accepting bookings.
                </p>

              </div>
            )}

            {/* Terms */}

            <label className="flex gap-3 text-sm text-gray-600">

              <input
                type="checkbox"
                required
                className="mt-1"
              />

              <span>
                I agree to the Terms
                & Conditions and
                Privacy Policy.
              </span>

            </label>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* Login Link */}

          <div className="text-center mt-8">

            <div className="mb-6">
              <GoogleAuthButton onError={(msg) => toast.error(msg)} />
            </div>

            <p className="text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold"
              >
                Login
              </Link>
            </p>

          </div>

        </div>

      </div>

      <OtpModal
        open={showOtpModal}
        mobile={formData.mobile}
        title="Verify your mobile number"
        onClose={() => setShowOtpModal(false)}
        onVerified={() => {
          setShowOtpModal(false);
          toast.success("Mobile verified — you can log in now");
          navigate("/login");
        }}
      />

    </div>
  );
};

export default Signup;