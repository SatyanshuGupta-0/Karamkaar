import React, { useState } from "react";
import { Star } from "lucide-react";

/**
 * Star rating — read-only display by default; pass `onChange` to
 * make it an interactive 1-5 picker (used in the review submission
 * modal).
 */
const StarRating = ({
  value = 0,
  onChange,
  size = 20,
  className = "",
}) => {
  const [hovered, setHovered] = useState(0);
  const interactive = Boolean(onChange);
  const display = interactive && hovered ? hovered : value;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={interactive ? `Rate ${star} star${star > 1 ? "s" : ""}` : undefined}
        >
          <Star
            size={size}
            className={star <= display ? "text-amber-400" : "text-slate-200"}
            fill={star <= display ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
