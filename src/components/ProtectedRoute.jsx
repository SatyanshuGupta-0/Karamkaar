import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, hasRole } from "../utils/auth";

// Wrap any route element that requires login (and optionally a
// specific role) with this component.
//
//   <Route path="/dashboard" element={
//     <ProtectedRoute role="USER"><Dashboard /></ProtectedRoute>
//   } />

const ProtectedRoute = ({ role, children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
