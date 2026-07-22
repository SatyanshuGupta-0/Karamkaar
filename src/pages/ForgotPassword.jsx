import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Lock, KeyRound } from "lucide-react";
import { post } from "../utils/api";
import { useToast } from "../context/ToastContext";

const STEPS = {
  EMAIL: "EMAIL",
  OTP: "OTP",
  RESET: "RESET",
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const requestOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await post("/user/forgot-password", { email });
      toast.success(res?.message || "OTP sent to your email");
      setStep(STEPS.OTP);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Couldn't send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await post("/user/verify-forgot-password-otp", {
        email,
        otp,
      });
      // Backend returns a short-lived reset token used to authorize
      // the actual password change (verified via the verifyReset
      // middleware on /user/reset-password).
      setResetToken(res?.resetToken || "");
      setStep(STEPS.RESET);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await post(
        "/user/reset-password",
        { newPassword, confirmPassword },
        resetToken
          ? { headers: { Authorization: `Bearer ${resetToken}` } }
          : undefined
      );
      toast.success(res?.message || "Password reset successfully");
      navigate("/login");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Couldn't reset password. Please restart the process."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === STEPS.EMAIL && <Mail className="text-blue-600" size={28} />}
            {step === STEPS.OTP && <ShieldCheck className="text-blue-600" size={28} />}
            {step === STEPS.RESET && <KeyRound className="text-blue-600" size={28} />}
          </div>
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {step === STEPS.EMAIL &&
              "Enter your account email and we'll send you a code."}
            {step === STEPS.OTP && `Enter the code sent to ${email}`}
            {step === STEPS.RESET && "Choose a new password"}
          </p>
        </div>

        {step === STEPS.EMAIL && (
          <form onSubmit={requestOtp} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        )}

        {step === STEPS.OTP && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              className="w-full border border-gray-300 rounded-xl p-3 text-center text-xl tracking-widest outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
          </form>
        )}

        {step === STEPS.RESET && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full border border-gray-300 rounded-xl pl-12 p-3 outline-none focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-xl pl-12 p-3 outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {loading ? "Saving…" : "Reset Password"}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 mt-6 text-sm">
          <Link to="/login" className="text-blue-600 font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
