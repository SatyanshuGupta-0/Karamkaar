import React, { useCallback, useRef, useState } from "react";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

/**
 * Drop-in replacement for `window.prompt()` — collects a single
 * short text value through the app's own UI instead of a native
 * browser prompt.
 *
 * Usage:
 *   const { promptText, PromptDialog } = usePrompt();
 *   const otp = await promptText("Enter the OTP the customer gave you");
 *   if (!otp) return;
 *   ...
 *   return <>{page content}{PromptDialog}</>;
 */
export const usePrompt = () => {
  const [state, setState] = useState({
    open: false,
    title: "",
    placeholder: "",
    submitLabel: "Submit",
  });
  const [value, setValue] = useState("");
  const resolver = useRef(null);

  const promptText = useCallback((title, options = {}) => {
    setValue("");
    setState({
      open: true,
      title,
      placeholder: options.placeholder || "",
      submitLabel: options.submitLabel || "Submit",
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

  const PromptDialog = (
    <Modal open={state.open} onClose={() => settle(null)} size="sm">
      <div className="py-2">
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900">
          {state.title}
        </h2>
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={state.placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) settle(value.trim());
          }}
        />
        <div className="mt-6 flex gap-2.5">
          <Button variant="outline" fullWidth onClick={() => settle(null)}>
            Cancel
          </Button>
          <Button
            fullWidth
            disabled={!value.trim()}
            onClick={() => settle(value.trim())}
          >
            {state.submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return { promptText, PromptDialog };
};
