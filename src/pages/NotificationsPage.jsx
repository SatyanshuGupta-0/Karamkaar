import React, { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useNotifications } from "../context/NotificationContext";
import NotificationItem from "../components/notifications/NotificationItem";
import { NOTIFICATION_TYPES } from "../components/notifications/notificationTypes";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "UNREAD", label: "Unread" },
  ...Object.entries(NOTIFICATION_TYPES).map(([key, meta]) => ({
    key,
    label: meta.label,
  })),
];

const NotificationsPage = () => {
  const [filter, setFilter] = useState("ALL");
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const filtered = notifications.filter((n) => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !n.read;
    return n.type === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" icon={Trash2} onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {loading ? (
            <p className="px-4 py-16 text-center text-sm text-slate-400">
              Loading notifications…
            </p>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <Bell className="mx-auto mb-3 text-slate-200" size={40} />
              <p className="text-sm font-medium text-slate-500">
                No notifications here
              </p>
              <p className="mt-1 text-xs text-slate-400">
                New updates about your bookings will show up here.
              </p>
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
