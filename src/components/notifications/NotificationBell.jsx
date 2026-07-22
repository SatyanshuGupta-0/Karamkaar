import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const recent = notifications.slice(0, 6);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        // <div className="justify-center-safe flex">
        // <div className=" absolute right-0  z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm origin-top-right rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-900/10 animate-[popIn_0.15s_ease-out] sm:w-72">
         <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
  <div className="pointer-events-auto w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-100 bg-white shadow-xl">
  
         <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h4 className="text-sm font-semibold text-slate-800">
              Notifications
            </h4>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                Loading…
              </p>
            ) : recent.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 text-slate-200" size={32} />
                <p className="text-sm text-slate-400">You're all caught up</p>
              </div>
            ) : (
              recent.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                  onNavigate={() => setOpen(false)}
                  dense
                />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
              className="block w-full rounded-b-2xl border-t border-slate-100 py-3 text-center text-sm font-medium text-blue-600 hover:bg-slate-50"
            >
              View all
            </button>
          )}
        </div>
        </div>
      )}
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
