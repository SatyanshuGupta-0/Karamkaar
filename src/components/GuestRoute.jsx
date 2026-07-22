import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getCurrentRole } from "../utils/auth";

// Wraps pre-auth pages (Landing, Login, Signup, Forgot Password) so a
// logged-in user visiting them directly — typing the URL, an old
// bookmark, browser back — gets bounced straight to their dashboard
// instead of seeing Login/Signup again.
//
//   <Route path="/login" element={
//     <GuestRoute><Login /></GuestRoute>
//   } />

const GuestRoute = ({ children }) => {
  if (isAuthenticated()) {
    const dashboardPath =
      getCurrentRole() === "PROVIDER" ? "/provider/dashboard" : "/dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default GuestRoute;
