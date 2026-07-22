import { post } from "./api";

/**
 * Thin abstraction over the OTP provider. Every component calls one
 * of the send/verify functions below and never talks to a specific
 * vendor directly — so swapping providers later means editing only
 * this one file.
 *
 * Current implementation calls our own backend (which is expected to
 * proxy to whichever provider gets wired up server-side — Twilio
 * Verify, MSG91, AWS SNS all work this way: your backend calls their
 * API, the frontend never sees vendor details).
 *
 * Firebase Phone Auth is the one exception for the mobile flow — its
 * OTP send/verify happens client-side via the Firebase SDK, no
 * backend round trip needed to send the code. To switch to it,
 * replace sendMobileOtp/verifyMobileOtp with:
 *
 *   import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
 *   let confirmationResult;
 *   export const sendMobileOtp = async (mobile) => {
 *     const verifier = new RecaptchaVerifier(getAuth(), "recaptcha-container", {});
 *     confirmationResult = await signInWithPhoneNumber(getAuth(), mobile, verifier);
 *   };
 *   export const verifyMobileOtp = async (mobile, otp) => {
 *     return confirmationResult.confirm(otp);
 *   };
 *
 * No calling component needs to change either way — same signatures.
 */

// Rename these to match your backend's actual routes.
const SEND_MOBILE_OTP_URL = "/user/send-mobile-otp";
const VERIFY_MOBILE_OTP_URL = "/user/verify-mobile-otp";
const SEND_EMAIL_OTP_URL = "/user/send-email-otp";
const VERIFY_EMAIL_OTP_URL = "/user/verify-email-otp";

export const sendMobileOtp = async (mobile) => {
  return post(SEND_MOBILE_OTP_URL, { mobile });
};

export const verifyMobileOtp = async (mobile, otp) => {
  return post(VERIFY_MOBILE_OTP_URL, { mobile, otp });
};

export const sendEmailOtp = async (email) => {
  return post(SEND_EMAIL_OTP_URL, { email });
};

export const verifyEmailOtp = async (email, otp) => {
  return post(VERIFY_EMAIL_OTP_URL, { email, otp });
};

// Generic dispatchers so a component can stay channel-agnostic (one
// OtpModal instance handles both mobile and email verification) —
// used by components/auth/OtpModal.jsx.
export const sendOtp = (channel, destination) =>
  channel === "email" ? sendEmailOtp(destination) : sendMobileOtp(destination);

export const verifyOtp = (channel, destination, otp) =>
  channel === "email"
    ? verifyEmailOtp(destination, otp)
    : verifyMobileOtp(destination, otp);
