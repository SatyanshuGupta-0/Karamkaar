import { CheckCircle2, ShieldAlert, ShieldQuestion } from "lucide-react";

export const EMPTY_SERVICE = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  estimatedTime: "",
   keywords: "",
  isActive: true,
};

export const DOCUMENT_TYPES = [
  { key: "aadhaarCard", label: "Aadhaar Card" },
  { key: "panCard", label: "PAN Card" },
  { key: "drivingLicense", label: "Driving License" },
  { key: "shopLicense", label: "Shop License (optional)" },
];

export const emptyForm = () => ({
  name: "",
  mobile: "",
  email: "",
  language: "English",
  address: {
    fullAddress: "",
    houseNo: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  },
  providerDetails: {
    description: "",
    experience: 0,
    serviceRadius: 5,
    availabilityStatus: "OFFLINE",
    services: [],
  },
});

// Flattens the nested GET response into the shape the form (and the
// PUT /user/provider/profile payload) work with.
export const toFormData = (provider) => ({
  name: provider?.name || "",
  mobile: provider?.mobile || "",
  email: provider?.email || "",
  language: provider?.language || "English",
  address: {
    fullAddress: provider?.address?.fullAddress || "",
    houseNo: provider?.address?.houseNo || "",
    landmark: provider?.address?.landmark || "",
    city: provider?.address?.city || "",
    state: provider?.address?.state || "",
    pincode: provider?.address?.pincode || "",
    country: provider?.address?.country || "India",
  },
  providerDetails: {
    description: provider?.providerDetails?.description || "",
    experience: provider?.providerDetails?.experience || 0,
    serviceRadius: provider?.providerDetails?.serviceRadius || 5,
    availabilityStatus:
      provider?.providerDetails?.availabilityStatus || "OFFLINE",
    services: provider?.providerDetails?.services || [],
  },
});

export const VERIFICATION_META = {
  VERIFIED: { label: "Verified", variant: "green", icon: CheckCircle2 },
  PENDING: { label: "Pending review", variant: "amber", icon: ShieldQuestion },
  REJECTED: { label: "Rejected", variant: "red", icon: ShieldAlert },
  NOT_SUBMITTED: { label: "Not submitted", variant: "slate", icon: ShieldQuestion },
};