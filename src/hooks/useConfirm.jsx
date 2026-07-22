import React, { useCallback, useRef, useState } from "react";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

/**
 * Drop-in replacement for `window.confirm()` that matches the app's
 * own UI instead of a jarring native browser dialog.
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   const ok = await confirm("Cancel this booking?");
 *   if (!ok) return;
 *   ...
 *   return <>{page content}{ConfirmDialog}</>;
 */
export const useConfirm = () => {
  const [state, setState] = useState({
    open: false,
    title: "Are you sure?",
    message: "",
    confirmLabel: "Confirm",
    danger: false,
  });
  const resolver = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    setState({
      open: true,
      title: options.title || "Are you sure?",
      message,
      confirmLabel: options.confirmLabel || "Confirm",
      danger: options.danger ?? false,
    });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (result) => {
    setState((s) => ({ ...s, open: false }));
    resolver.current?.(result);
    resolver.current = null;
  };

  const ConfirmDialog = (
    <Modal open={state.open} onClose={() => settle(false)} size="sm">
      <div className="py-2 text-center">
        <h2 className="text-lg font-bold text-slate-900">{state.title}</h2>
        <p className="mt-2 text-sm text-slate-500">{state.message}</p>
        <div className="mt-6 flex gap-2.5">
          <Button variant="outline" fullWidth onClick={() => settle(false)}>
            Cancel
          </Button>
          <Button
            variant={state.danger ? "danger" : "primary"}
            fullWidth
            onClick={() => settle(true)}
          >
            {state.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return { confirm, ConfirmDialog };
};
