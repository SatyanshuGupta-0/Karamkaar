import React from "react";

/**
 * Reusable Card container. Pass `hover` for a subtle lift-on-hover
 * interaction (used for clickable cards like provider/booking cards).
 */
const Card = ({
  children,
  className = "",
  hover = false,
  padding = "p-5",
  as: Tag = "div",
  ...props
}) => {
  return (
    <Tag
      className={`rounded-2xl border border-slate-100 bg-white shadow-sm ${padding} ${
        hover
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Card;
