import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: "border-emerald-100 bg-white text-emerald-600",
  error: "border-red-100 bg-white text-red-600",
  info: "border-blue-100 bg-white text-blue-600",
  warning: "border-amber-100 bg-white text-amber-600",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
    warning: (msg, duration) => addToast(msg, "warning", duration),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:w-full">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-2.5 rounded-xl border ${STYLES[t.type]} px-4 py-3 shadow-lg shadow-slate-900/5 animate-[toastIn_0.2s_ease-out]`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium text-slate-700">
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-slate-300 hover:text-slate-500"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

export default ToastContext;
