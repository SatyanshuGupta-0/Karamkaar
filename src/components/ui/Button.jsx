import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Button.
 *
 * variant: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
 * size: "sm" | "md" | "lg"
 */
const VARIANT_CLASSES = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-600/20 disabled:bg-blue-300",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-300",
  outline:
    "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-300",
  ghost:
    "text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-300",
};

const SIZE_CLASSES = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3.5 rounded-xl gap-2",
};

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          VARIANT_CLASSES[variant]
        } ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === "sm" ? 14 : 18} />
        ) : (
          Icon &&
          iconPosition === "left" && (
            <Icon size={size === "sm" ? 14 : 18} />
          )
        )}
        {children}
        {!loading && Icon && iconPosition === "right" && (
          <Icon size={size === "sm" ? 14 : 18} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
