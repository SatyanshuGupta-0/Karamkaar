import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StarRating from "./StarRating";
import { useToast } from "../../context/ToastContext";
import { submitReview } from "../../utils/reviews";
import { getUser } from "../../utils/auth";

/**
 * Opens after a booking is marked Completed. Submits a 1-5 star
 * rating + optional written review for that booking's provider.
 */
const ReviewModal = ({ open, onClose, booking, onSubmitted }) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const providerName = booking?.provider?.name || "your provider";

  const handleClose = () => {
    if (submitting) return;
    setRating(0);
    setReview("");
    onClose?.();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Please select a star rating");
      return;
    }
    setSubmitting(true);
    const user = getUser();
    const result = await submitReview({
      bookingId: booking?._id,
      providerId: booking?.provider?._id,
      rating,
      review: review.trim(),
      userName: user?.name,
    });
    setSubmitting(false);

    if (result.ok) {
      toast.success("Thanks for your feedback!");
      onSubmitted?.(booking?._id, result.review);
      setRating(0);
      setReview("");
      onClose?.();
    } else {
      toast.error("Couldn't submit your review — please try again");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Rate ${providerName}`}
      footer={
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={handleClose} disabled={submitting} fullWidth>
            Skip
          </Button>
          <Button onClick={handleSubmit} loading={submitting} fullWidth>
            Submit
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <p className="text-center text-sm text-slate-500">
          How was your experience with {providerName} for{" "}
          {booking?.service?.serviceName || "this service"}?
        </p>

        <StarRating value={rating} onChange={setRating} size={34} />

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          placeholder="Share more about your experience (optional)"
          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
    </Modal>
  );
};

export default ReviewModal;
