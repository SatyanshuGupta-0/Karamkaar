import { useProviderWaitlistWatcher } from "../../hooks/useProviderWaitlistWatcher";

// Renders nothing — just keeps the waitlist watcher running for as
// long as the app is open, regardless of which page the customer is
// currently on. Mounted once near the top of App.jsx.
const ProviderWaitlistWatcher = () => {
  useProviderWaitlistWatcher();
  return null;
};

export default ProviderWaitlistWatcher;
