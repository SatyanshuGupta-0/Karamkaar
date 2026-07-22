import { post } from "./api";

/**
 * Thin abstraction over the OTP provider.
 *
 * EMAIL FLOW:
 *   - verify hits the PUBLIC /user/verifyotp route (verifyOtpController).
 *     No auth token needed — checks { email, otp } directly against the
 *     user document. This is what registerUserController's OTP (sent
 *     during signup) actually gets checked against.
 *   - send/resend goes through /user/send-email-otp (auth-protected).
 *     Works because registerUserController now issues an accessToken
 *     even for normal signup.
 *
 * Falls back to localStorage("userEmail") when no destination is
 * passed in — this mirrors the old working OtpVerification.jsx flow,
 * so verification still works even if a caller forgets to pass the
 * destination/email prop correctly.
 *
 * MOBILE FLOW: left as-is, to be revisited separately.
 */

const SEND_EMAIL_OTP_URL = "/user/send-email-otp";
const VERIFY_OTP_URL = "/user/verifyotp"; // public route

const SEND_MOBILE_OTP_URL = "/user/send-mobile-otp";
const VERIFY_MOBILE_OTP_URL = "/user/verify-mobile-otp";

// export const sendEmailOtp = async (email) => {
//   const targetEmail = email || localStorage.getItem("userEmail");
//   return post(SEND_EMAIL_OTP_URL, { email: targetEmail });
// };
const userEmail = localStorage.getItem("userEmail")
export const verifyEmailOtp = async (mobile, otp) => {
  const targetMobile = mobile;
  return post(VERIFY_OTP_URL, { email: userEmail, mobile: targetMobile, otp });
};

// --- Mobile: unchanged, fix later ---
// export const sendMobileOtp = async (mobile) => {
//   return post(SEND_MOBILE_OTP_URL, { mobile });
// };

// export const verifyMobileOtp = async (mobile, otp) => {
//   return post(VERIFY_MOBILE_OTP_URL, { mobile, otp });
// };

// Generic dispatchers so a component can stay channel-agnostic — used
// by components/auth/OtpModal.jsx.
export const sendOtp = (channel, destination) =>
  channel === "email" ? sendEmailOtp(destination) : sendMobileOtp(destination);

export const verifyOtp = (channel, destination, otp) =>
  channel === "email"
    ? verifyEmailOtp(destination, otp)
    : verifyMobileOtp(destination, otp);