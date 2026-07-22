import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { get, put, remove } from "../utils/api";
import { isAuthenticated } from "../utils/auth";
import {
  requestNotificationPermission,
  showBrowserNotification,
} from "../utils/browserNotifications";

const NotificationContext = createContext(null);

const STORAGE_KEY = "notifications_cache";

// Convert backend notification shape to frontend shape
const normalize = (notification) => ({
  ...notification,
  id: notification._id || notification.id,
  read: notification.isRead ?? notification.read ?? false,
});

const loadCache = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCache = (notifications) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Ignore storage errors
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(loadCache);
  const [loading, setLoading] = useState(true);

  const seenIds = useRef(new Set());
  const initialized = useRef(false);

  // Ask browser notification permission
  useEffect(() => {
    if (isAuthenticated()) {
      requestNotificationPermission();
    }
  }, []);

  // Show browser notifications only for NEW unread notifications
  const notifyNewNotifications = useCallback((list) => {
    if (!initialized.current) {
      list.forEach((n) => seenIds.current.add(n.id));
      initialized.current = true;
      return;
    }

    list.forEach((notification) => {
      if (seenIds.current.has(notification.id)) return;

      seenIds.current.add(notification.id);

      if (notification.read) return;

      showBrowserNotification(notification.title || "New Notification", {
        body: notification.message,
        tag: notification.id,
      });
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated()) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await get("/notification/my-notifications");

      const list = (response?.notifications || []).map(normalize);

      setNotifications(list);
      saveCache(list);
      notifyNewNotifications(list);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);

      // Load cached notifications if backend fails
      const cached = loadCache();
      setNotifications(cached);
      notifyNewNotifications(cached);
    } finally {
      setLoading(false);
    }
  }, [notifyNewNotifications]);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const persist = (updater) => {
    setNotifications((prev) => {
      const updated = updater(prev);
      saveCache(updated);
      return updated;
    });
  };

  const markAsRead = useCallback(async (id) => {
    persist((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
            }
          : n
      )
    );

    try {
      await put(`/notification/read/${id}`);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    persist((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      }))
    );

    try {
      await put("/notification/read-all");
    } catch (error) {
      console.error(error);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    persist((prev) => prev.filter((n) => n.id !== id));

    try {
      await remove(`/notification/delete/${id}`);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    const ids = notifications.map((n) => n.id);

    persist(() => []);

    await Promise.allSettled(
      ids.map((id) => remove(`/notification/delete/${id}`))
    );
  }, [notifications]);

  // Add local notification instantly
  const addNotification = useCallback((notification) => {
    const id = `local-${Date.now()}`;

    const newNotification = {
      id,
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };

    persist((prev) => [newNotification, ...prev]);

    seenIds.current.add(id);

    showBrowserNotification(
      notification.title || "New Notification",
      {
        body: notification.message,
        tag: id,
      }
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }

  return context;
};

export default NotificationContext;