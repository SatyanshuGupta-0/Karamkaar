import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, LayoutGrid, CalendarClock, MessageSquare, User } from "lucide-react";
import {
  getUser,
  isAuthenticated,
  hasRole,
  getCurrentRole,
  setCurrentRole,
  logout,
} from "../utils/auth";
import NotificationBell from "./notifications/NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const loggedIn = isAuthenticated();
  const user = getUser();
  const currentRole = getCurrentRole();
  const isDualRole = hasRole("USER") && hasRole("PROVIDER");

  const switchRole = (role) => {
    setCurrentRole(role);
    navigate(role === "PROVIDER" ? "/provider/dashboard" : "/landing");
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const dashboardPath =
    currentRole === "PROVIDER" ? "/provider/dashboard" : "/dashboard";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          to={loggedIn ? dashboardPath : "/"}
          className="text-2xl font-extrabold tracking-tight text-blue-600"
        >
          Karamkaar
        </Link>

        {/* Desktop links */}
        {loggedIn && (
          <div className="hidden items-center gap-1 md:flex">
            <Link
              to={dashboardPath}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LayoutGrid size={16} />
              Dashboard
            </Link>
            <Link
              to="/booking"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <CalendarClock size={16} />
              Bookings
            </Link>
            <button
              disabled
              title="Messaging coming soon"
              className="flex cursor-not-allowed items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-300"
            >
              <MessageSquare size={16} />
              Messages
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {isDualRole && (
            <div className="hidden sm:flex bg-slate-100 rounded-xl p-1 text-sm font-medium">
              <button
                onClick={() => switchRole("USER")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentRole === "USER"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => switchRole("PROVIDER")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentRole === "PROVIDER"
                    ? "bg-green-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Provider
              </button>
            </div>
          )}

          {loggedIn ? (
            <>
              <NotificationBell />
              <Link
                to={currentRole === "PROVIDER" ? "/providerprofile" : "/edit-profile"}
                className="hidden md:inline text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Hi, {user?.name?.split(" ")[0] || "there"}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 md:flex"
              >
                <LogOut size={16} />
                Logout
              </button>
              <button
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-slate-900"
              >
                Login
              </Link>
              <Link to="/signup">
                <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {loggedIn && mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <Link
            to={dashboardPath}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LayoutGrid size={16} />
            Dashboard
          </Link>
          <Link
            to="/booking"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <CalendarClock size={16} />
            Bookings
          </Link>
          <Link
            to={currentRole === "PROVIDER" ? "/providerprofile" : "/edit-profile"}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <User size={16} />
            Edit Profile
          </Link>
          {isDualRole && (
            <div className="mt-1 flex gap-2 px-3 py-2">
              <button
                onClick={() => switchRole("USER")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                  currentRole === "USER"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => switchRole("PROVIDER")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                  currentRole === "PROVIDER"
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Provider
              </button>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
