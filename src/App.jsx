import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import Booking from "./pages/Booking";
import BrowseProviders from "./pages/BrowseProviders";
import ProviderDetail from "./pages/ProviderDetail";
import ProviderProfile from "./pages/ProviderProfile";
import EditProfile from "./pages/EditProfile";
import Payment from "./pages/Payment";
import Landing from "./pages/Landing";
import TrackBooking from "./pages/TrackBooking";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ChooseRole from "./components/ChooseRole";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import NotificationsPage from "./pages/NotificationsPage";
import ProviderWaitlistWatcher from "./components/notifications/ProviderWaitlistWatcher";
import "./App.css";

function App() {
  return (
    <>
    <ProviderWaitlistWatcher />
    <Routes>
      <Route
        path="/"
        element={
          <GuestRoute>
            <Landing />
          </GuestRoute>
        }
      />
      <Route path="/landing" element={<Home />} />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />

      <Route
        path="/choose-role"
        element={
          <ProtectedRoute>
            <ChooseRole />
          </ProtectedRoute>
        }
      />

      {/* Customer routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="USER">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute role="USER">
            <BrowseProviders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/provider/:providerId"
        element={
          <ProtectedRoute role="USER">
            <ProviderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/confirm"
        element={
          <ProtectedRoute role="USER">
            <Booking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trackbooking/:bookingId"
        element={
          <ProtectedRoute>
            <TrackBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Provider routes */}
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute role="PROVIDER">
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/providerprofile"
        element={
          <ProtectedRoute role="PROVIDER">
            <ProviderProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}

export default App;
