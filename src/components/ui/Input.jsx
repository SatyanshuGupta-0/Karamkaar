import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

/**
 * Reusable text input with label, icon, error state, and password toggle.
 */
const Input = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      type = "text",
      className = "",
      containerClassName = "",
      required = false,
      ...props
    },
    ref
  ) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (show ? "text" : "password") : type;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={`w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              Icon ? "pl-10" : "pl-3.5"
            } ${isPassword ? "pr-10" : "pr-3.5"} ${
              error
                ? "border-red-400 focus:ring-red-500/30"
                : "border-slate-200 focus:border-blue-500"
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
            <AlertCircle size={13} />
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
