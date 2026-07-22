import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { sendOtp, verifyOtp } from "../../utils/otpService";
import { useToast } from "../../context/ToastContext";

const RESEND_SECONDS = 30;
const EMPTY_OTP = ["", "", "", "", "", ""];

/**
 * OTP verification modal — works for both mobile and email, shown
 * over whatever page triggered it (signup, edit-profile verify,
 * etc.) — the caller never navigates away. Built against
 * utils/otpService.js so swapping the actual SMS/email provider
 * never touches this file.
 *
 * `channel`: "mobile" (default) or "email".
 * `destination`: the phone number or email address the code was
 * sent to. `mobile` is kept as an alias for `destination` so
 * existing mobile-only callers (e.g. Signup) don't need to change.
 */
const OtpModal = ({
  open,
  channel = "mobile",
  destination,
  mobile,
  autoSend = false,
  onClose,
  onVerified,
  title,
}) => {
  const { toast } = useToast();
  const target = destination || mobile;
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [sendingInitial, setSendingInitial] = useState(false);

  const inputRefs = useRef([]);

  // Reset to a clean slate every time the modal opens for a new
  // verification (e.g. re-opened for a different mobile number).
  // When autoSend is set, this modal is responsible for triggering
  // the first OTP itself (Edit Profile's "Verify" button has nothing
  // upstream that already sent one — unlike Signup, where the
  // backend sends it as part of registration).
  useEffect(() => {
    if (!open) return;
    setOtp(EMPTY_OTP);
    setSuccess(false);
    setShake(false);
    setTimer(RESEND_SECONDS);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);

    if (autoSend && target) {
      setSendingInitial(true);
      sendOtp(channel, target)
        .catch(() => toast.error("Couldn't send OTP — try Resend"))
        .finally(() => setSendingInitial(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, target]);

  useEffect(() => {
    if (!open || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [open, timer]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      // Pasted or autofilled multiple digits at once.
      const pasted = value.slice(0, 6).split("");
      const next = [...EMPTY_OTP];
      pasted.forEach((digit, i) => (next[i] = digit));
      setOtp(next);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...EMPTY_OTP];
    pasted.split("").forEach((digit, i) => (next[i] = digit));
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (code) => {
    if (verifying) return;
    setVerifying(true);
    try {
      await verifyOtp(channel, target, code);
      setSuccess(true);
      setTimeout(() => {
        onVerified?.();
      }, 900);
    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(
        error?.response?.data?.message || "Invalid or expired OTP — please try again"
      );
      setOtp(EMPTY_OTP);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  // Auto-verify the moment all 6 digits are in — no separate tap
  // needed, but the Verify button below still works for anyone who
  // types the last digit and expects to press something.
  useEffect(() => {
    const code = otp.join("");
    if (code.length === 6 && !verifying && !success) handleVerify(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleResend = async () => {
    if (resending || timer > 0) return;
    setResending(true);
    try {
      await sendOtp(channel, target);
      toast.success("OTP sent again");
      setOtp(EMPTY_OTP);
      setTimer(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Couldn't resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal open={open} onClose={verifying ? undefined : onClose} size="sm" showClose={!verifying}>
      <div className="py-2 text-center">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
            success ? "bg-emerald-100" : "bg-blue-100"
          }`}
        >
          {success ? (
            <CheckCircle2 size={32} className="text-emerald-600" />
          ) : (
            <ShieldCheck size={32} className="text-blue-600" />
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          {success ? "Verified!" : title || `Verify your ${channel === "email" ? "email" : "mobile number"}`}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          {success ? (
            "You're all set."
          ) : sendingInitial ? (
            "Sending code…"
          ) : (
            <>
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-slate-700">{target}</span>
            </>
          )}
        </p>

        {!success && (
          <>
            <div
              className={`mt-6 flex justify-center gap-2 sm:gap-2.5 ${
                shake ? "animate-[otpShake_0.4s_ease-in-out]" : ""
              }`}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  disabled={verifying || sendingInitial}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="h-12 w-10 rounded-xl border-2 border-slate-200 text-center text-lg font-bold text-slate-900 outline-none focus:border-blue-600 disabled:bg-slate-50 sm:h-14 sm:w-12"
                />
              ))}
            </div>

            <Button
              className="mt-6"
              fullWidth
              loading={verifying}
              onClick={() => handleVerify(otp.join(""))}
              disabled={otp.join("").length !== 6}
            >
              {verifying ? "Verifying…" : "Verify"}
            </Button>

            <div className="mt-5">
              {timer > 0 ? (
                <p className="text-sm text-slate-400">
                  Resend OTP in <span className="font-semibold text-slate-600">{timer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="mx-auto flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-60"
                >
                  {resending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <RefreshCw size={15} />
                  )}
                  {resending ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes otpShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </Modal>
  );
};

export default OtpModal;
