import React from "react";
import Card from "../ui/Card";
import StarRating from "./StarRating";

const timeAgo = (isoDate) => {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

const ReviewList = ({ reviews = [], emptyText = "No reviews yet." }) => {
  if (reviews.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={r._id} padding="p-4 sm:p-5">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-800">
              {r.user?.name || "Customer"}
            </span>
            <div className="flex items-center gap-2">
              <StarRating value={r.rating} size={14} />
              <span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span>
            </div>
          </div>
          {r.review && <p className="text-sm text-slate-600">{r.review}</p>}
        </Card>
      ))}
    </div>
  );
};

export default ReviewList;
