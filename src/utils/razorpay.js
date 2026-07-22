const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptLoadingPromise = null;

const loadRazorpayScript = () => {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(true);
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return scriptLoadingPromise;
};

/**
 * Opens Razorpay Checkout. `amountInRupees` is converted to paise
 * automatically (Razorpay always wants the smallest currency unit).
 *
 * NOTE: in production, `order_id` should come from a backend call to
 * Razorpay's Orders API — creating the order server-side is what
 * makes the payment verifiable/secure, and is also required for
 * live-mode payments to actually go through. This frontend-only
 * version skips that (no backend yet) and opens Checkout directly
 * with just amount + currency, which works with a Razorpay test key
 * for demoing the full UI/flow. Once the backend exists, swap in:
 *
 *   const { order } = await post("/payment/create-order", { amount: amountInRupees });
 *   // then pass order.id as options.order_id below
 */
export const openRazorpayCheckout = async ({
  amountInRupees,
  name,
  description,
  prefill,
  onSuccess,
  onFailure,
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure?.(new Error("Couldn't load Razorpay checkout — check your connection"));
    return;
  }

  const options = {
    // Set VITE_RAZORPAY_KEY_ID in your .env once you have a real
    // Razorpay account — falls back to a placeholder test key so the
    // checkout UI still opens for demoing.
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    name: name || "ServiceHub",
    description: description || "Service payment",
    prefill,
    theme: { color: "#2563eb" },
    handler: (response) => onSuccess?.(response),
    modal: {
      ondismiss: () => onFailure?.(new Error("Payment cancelled")),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (response) => onFailure?.(response.error));
  rzp.open();
};
