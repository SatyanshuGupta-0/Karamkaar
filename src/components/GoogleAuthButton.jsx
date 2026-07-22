import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../utils/api";
import { setCurrentRole } from "../utils/auth";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Drop this in on Login or Signup. It renders Google's own button
// (so it looks right and stays compliant with their branding rules)
// and on success posts the id_token straight to /user/google-auth.
//
// `role`: "USER" (default) or "PROVIDER". Only matters the first time
// this Google account signs up — pass role="PROVIDER" on your
// Provider signup page so a brand-new account gets created with the
// PROVIDER role too. If the Google account already has an account
// with us, this is ignored server-side (existing role is kept).
const GoogleAuthButton = ({ onError, role }) => {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  useEffect(() => {
    if (!CLIENT_ID || CLIENT_ID.includes("your_google_client_id")) {
      // Not configured — silently skip rendering rather than crash.
      return;
    }

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
      });
    };

    const handleCredentialResponse = async (response) => {
      try {
        const result = await post("/user/google-auth", {
          token: response.credential,
          role, // "USER" or "PROVIDER" — used only on first-time signup
        });

        const { accessToken, refreshToken, user } = result.data || {};

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        if (user?.email) localStorage.setItem("userEmail", user.email);

        const isDualRole =
          user?.role?.includes("USER") && user?.role?.includes("PROVIDER");

        if (isDualRole) {
          navigate("/choose-role");
        } else if (user?.role?.includes("PROVIDER")) {
          setCurrentRole("PROVIDER");
          navigate("/provider/dashboard");
        } else {
          setCurrentRole("USER");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Google auth failed:", error);
        onError?.(
          error?.response?.data?.message || "Google sign-in failed"
        );
      }
    };

    // The script tag in index.html loads async — poll briefly until
    // it's ready rather than assuming it's there on first render.
    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          renderButton();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [navigate, onError, role]);

  if (!CLIENT_ID || CLIENT_ID.includes("your_google_client_id")) {
    return (
      <p className="text-xs text-gray-400 text-center border border-dashed rounded-xl py-3">
        Google sign-in isn't configured yet — set VITE_GOOGLE_CLIENT_ID in
        .env to enable it.
      </p>
    );
  }

  return (
    <div className="w-full flex justify-center items-center">
      <div ref={buttonRef}></div>
    </div>
  );
};

export default GoogleAuthButton;