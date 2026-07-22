import React from "react";
import { CheckCircle2 } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";

/**
 * A text field (email or mobile) with its own "Verify" button. Shows
 * a green "Verified" badge once utils/verification.js confirms this
 * exact value has been OTP-confirmed; editing the value back out of
 * the verified state clears the badge automatically.
 */
const VerifiableField = ({
  label,
  icon,
  type = "text",
  value,
  onChange,
  verified,
  onVerifyClick,
  placeholder,
}) => {
  return (
    <div>
      <Input
        label={label}
        icon={icon}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div className="mt-2">
        {verified ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 size={13} />
            Verified
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={onVerifyClick} disabled={!value}>
            Verify {label}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerifiableField;
