import React from "react";
import { ShieldCheck, UploadCloud, FileText, Loader2 } from "lucide-react";
import Card from "../ui/Card";
import { Badge } from "../ui/Badge";
import { DOCUMENT_TYPES } from "./constants";

const VerificationSection = ({
  vMeta,
  verificationStatus,
  verificationNote,
  documents,
  uploadingType,
  uploadProgress,
  onUpload,
}) => {
  const VIcon = vMeta.icon;

  return (
    <Card className="mt-4 sm:mt-6" padding="p-4 sm:p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
          <ShieldCheck size={17} />
          Verification
        </h2>
        <Badge variant={vMeta.variant}>
          <VIcon size={13} />
          {vMeta.label}
        </Badge>
      </div>
      <p className="mb-4 text-xs text-slate-500 sm:mb-5 sm:text-sm">
        Upload these so customers know you're a verified provider.
        {verificationStatus === "REJECTED" && verificationNote && (
          <span className="mt-1 block font-medium text-red-600">
            Reason: {verificationNote}
          </span>
        )}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {DOCUMENT_TYPES.map(({ key, label }) => {
          const doc = documents?.[key];
          const isUploading = uploadingType === key;
          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                {doc?.url ? (
                  <img
                    src={doc.url}
                    alt={label}
                    className="h-11 w-11 shrink-0 rounded-lg object-cover sm:h-12 sm:w-12"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 sm:h-12 sm:w-12">
                    <FileText size={20} className="text-slate-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 sm:text-base">
                    {label}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isUploading
                      ? `Uploading… ${uploadProgress}%`
                      : doc?.url
                      ? "Uploaded"
                      : "Not uploaded"}
                  </p>
                </div>
              </div>

              <label
                className={`flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                  isUploading
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UploadCloud size={16} />
                )}
                {doc?.url ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onUpload(key, file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default VerificationSection;