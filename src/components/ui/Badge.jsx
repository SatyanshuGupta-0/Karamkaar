import React from "react";

const BADGE_VARIANTS = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
};

export const Badge = ({ children, variant = "slate", className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_VARIANTS[variant]} ${className}`}
  >
    {children}
  </span>
);

export const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`}
  />
);

export const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <Skeleton className="mb-3 h-32 w-full rounded-xl" />
    <Skeleton className="mb-2 h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export default Badge;
