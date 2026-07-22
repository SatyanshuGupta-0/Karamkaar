import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { getNotificationMeta, getNotificationLink, timeAgo } from "./notificationTypes";

const NotificationItem = ({ notification, onRead, onDelete, onNavigate, dense = false }) => {
  const navigate = useNavigate();
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;

  const handleClick = () => {
    if (!notification.read) onRead(notification.id);

    const link = getNotificationLink(notification);
    if (link) {
      onNavigate?.(); // e.g. close the bell dropdown before routing away
      navigate(link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group justify-center-safe flex gap-3 border-b border-slate-50 px-4 py-3.5 transition last:border-0 hover:bg-slate-50 ${
        !notification.read ? "bg-blue-50/40" : ""
      } ${dense ? "px-3 py-3" : ""} cursor-pointer`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.color}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">
            {notification.title || meta.label}
          </p>
          {!notification.read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className="self-start opacity-0 transition group-hover:opacity-100 text-slate-300 hover:text-red-500"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

export default NotificationItem;
