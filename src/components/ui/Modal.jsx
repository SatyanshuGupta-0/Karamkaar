import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Reusable Modal / bottom-sheet.
 *
 * On mobile widths it slides up from the bottom (feels native, like the
 * booking/OTP sheets in Uber/Rapido); on larger screens it's a centered
 * dialog.
 */
const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showClose = true,
}) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl animate-[slideUp_0.2s_ease-out] sm:animate-[fadeIn_0.15s_ease-out]`}
      >
        {(title || showClose) && (
          <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 rounded-t-3xl sm:rounded-t-2xl">
            <h3 className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            {showClose && (
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-4">
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
};

export default Modal;
