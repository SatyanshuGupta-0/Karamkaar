// Native Browser Notifications

export const isBrowserNotificationSupported = () => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const requestNotificationPermission = async () => {
  if (!isBrowserNotificationSupported()) {
    console.warn("Browser notifications are not supported.");
    return "unsupported";
  }

  try {
    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission === "denied") {
      console.warn("Notification permission already denied.");
      return "denied";
    }

    const permission = await Notification.requestPermission();

    console.log("Notification Permission:", permission);

    return permission;
  } catch (error) {
    console.error("Notification permission error:", error);
    return "denied";
  }
};

export const showBrowserNotification = (
  title,
  {
    body = "",
    icon = "/favicon.ico",
    tag,
    requireInteraction = true,
    onClick,
  } = {}
) => {
  if (!isBrowserNotificationSupported()) {
    console.warn("Notifications not supported.");
    return null;
  }

  if (Notification.permission !== "granted") {
    console.warn(
      "Cannot show notification. Permission:",
      Notification.permission
    );
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon,
      tag,
      requireInteraction,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();

      if (typeof onClick === "function") {
        onClick();
      }

      notification.close();
    };

    notification.onerror = (error) => {
      console.error("Notification Error:", error);
    };

    notification.onshow = () => {
      console.log("Notification displayed:", title);
    };

    return notification;
  } catch (error) {
    console.error("Failed to show notification:", error);
    return null;
  }
};