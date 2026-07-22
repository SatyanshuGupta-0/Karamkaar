// import React, { useEffect, useState } from "react";
// import {
//   Star,
//   ShieldCheck,
//   ShieldAlert,
//   ShieldQuestion,
//   Clock,
//   MapPin,
//   Briefcase,
//   Pencil,
//   Save,
//   X,
//   Plus,
//   Phone,
//   Mail,
//   Globe,
//   Power,
//   IndianRupee,
//   UploadCloud,
//   FileText,
//   CheckCircle2,
//   Loader2,
// } from "lucide-react";
// import { get, put, uploadFile } from "../utils/api";
// import Navbar from "../components/Navbar";
// import Button from "../components/ui/Button";
// import Input from "../components/ui/Input";
// import Card from "../components/ui/Card";
// import { Badge, Skeleton } from "../components/ui/Badge";
// import { useToast } from "../context/ToastContext";

// const EMPTY_SERVICE = {
//   serviceName: "",
//   category: "",
//   description: "",
//   price: "",
//   estimatedTime: "",
//   isActive: true,
// };

// const DOCUMENT_TYPES = [
//   { key: "aadhaarCard", label: "Aadhaar Card" },
//   { key: "panCard", label: "PAN Card" },
//   { key: "drivingLicense", label: "Driving License" },
//   { key: "shopLicense", label: "Shop License (optional)" },
// ];

// const emptyForm = () => ({
//   name: "",
//   mobile: "",
//   email: "",
//   language: "English",
//   address: {
//     fullAddress: "",
//     houseNo: "",
//     landmark: "",
//     city: "",
//     state: "",
//     pincode: "",
//     country: "India",
//   },
//   providerDetails: {
//     description: "",
//     experience: 0,
//     serviceRadius: 5,
//     availabilityStatus: "OFFLINE",
//     services: [],
//   },
// });

// // Flattens the nested GET response into the shape the form (and the
// // PUT /user/provider/profile payload) work with.
// const toFormData = (provider) => ({
//   name: provider?.name || "",
//   mobile: provider?.mobile || "",
//   email: provider?.email || "",
//   language: provider?.language || "English",
//   address: {
//     fullAddress: provider?.address?.fullAddress || "",
//     houseNo: provider?.address?.houseNo || "",
//     landmark: provider?.address?.landmark || "",
//     city: provider?.address?.city || "",
//     state: provider?.address?.state || "",
//     pincode: provider?.address?.pincode || "",
//     country: provider?.address?.country || "India",
//   },
//   providerDetails: {
//     description: provider?.providerDetails?.description || "",
//     experience: provider?.providerDetails?.experience || 0,
//     serviceRadius: provider?.providerDetails?.serviceRadius || 5,
//     availabilityStatus:
//       provider?.providerDetails?.availabilityStatus || "OFFLINE",
//     services: provider?.providerDetails?.services || [],
//   },
// });

// const VERIFICATION_META = {
//   VERIFIED: { label: "Verified", variant: "green", icon: CheckCircle2 },
//   PENDING: { label: "Pending review", variant: "amber", icon: ShieldQuestion },
//   REJECTED: { label: "Rejected", variant: "red", icon: ShieldAlert },
//   NOT_SUBMITTED: { label: "Not submitted", variant: "slate", icon: ShieldQuestion },
// };

// /**
//  * Provider profile — display + inline edit in one page.
//  *
//  * Fetches from GET /user/provider/profile, saves via
//  * PUT /user/provider/profile, and uploads verification documents via
//  * POST /user/provider/documents (multipart). All three are wired
//  * through utils/api.js so swapping in the real backend needs no UI
//  * changes.
//  */
// const ProviderProfile = () => {
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [error, setError] = useState(null);

//   const [provider, setProvider] = useState(null);
//   const [formData, setFormData] = useState(emptyForm());
//   const [newService, setNewService] = useState(EMPTY_SERVICE);

//   const [documents, setDocuments] = useState({});
//   const [verificationStatus, setVerificationStatus] = useState("NOT_SUBMITTED");
//   const [verificationNote, setVerificationNote] = useState("");
//   const [uploadingType, setUploadingType] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const fetchProvider = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await get("/user/provider/profile");
//       setProvider(res?.provider || null);
//       setFormData(toFormData(res?.provider));
//       setDocuments(res?.provider?.documents || {});
//       setVerificationStatus(
//         res?.provider?.providerDetails?.verificationStatus || "NOT_SUBMITTED"
//       );
//       setVerificationNote(res?.provider?.providerDetails?.verificationNote || "");
//     } catch (err) {
//       setError(err?.response?.data?.message || "Couldn't load your profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProvider();
//   }, []);

//   const setField = (field, value) =>
//     setFormData((prev) => ({ ...prev, [field]: value }));

//   const setAddressField = (field, value) =>
//     setFormData((prev) => ({
//       ...prev,
//       address: { ...prev.address, [field]: value },
//     }));

//   const setProviderField = (field, value) =>
//     setFormData((prev) => ({
//       ...prev,
//       providerDetails: { ...prev.providerDetails, [field]: value },
//     }));

//   const handleDocumentUpload = async (type, file) => {
//     if (!file) return;
//     const body = new FormData();
//     body.append("document", file);
//     body.append("type", type);

//     try {
//       setUploadingType(type);
//       setUploadProgress(0);
//       const res = await uploadFile("/user/provider/documents", body, setUploadProgress);
//       setDocuments(res.documents || {});
//       setVerificationStatus(res.verificationStatus || "PENDING");
//       setVerificationNote("");
//       toast.success("Document uploaded — pending review");
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Couldn't upload this document");
//     } finally {
//       setUploadingType(null);
//       setUploadProgress(0);
//     }
//   };

//   const handleAddService = () => {
//     if (!newService.serviceName || !newService.category || !newService.price) {
//       toast.warning("Service name, category and price are required");
//       return;
//     }
//     setProviderField("services", [...formData.providerDetails.services, { ...newService }]);
//     setNewService(EMPTY_SERVICE);
//   };

//   const handleRemoveService = (index) => {
//     setProviderField(
//       "services",
//       formData.providerDetails.services.filter((_, i) => i !== index)
//     );
//   };

//   const toggleServiceActive = (index) => {
//     setProviderField(
//       "services",
//       formData.providerDetails.services.map((s, i) =>
//         i === index ? { ...s, isActive: !s.isActive } : s
//       )
//     );
//   };

//   const handleCancel = () => {
//     setFormData(toFormData(provider));
//     setNewService(EMPTY_SERVICE);
//     setEditMode(false);
//   };

//   const handleSave = async () => {
//     const payload = {
//       name: formData.name,
//       mobile: formData.mobile,
//       email: formData.email,
//       language: formData.language,
//       fullAddress: formData.address.fullAddress,
//       houseNo: formData.address.houseNo,
//       landmark: formData.address.landmark,
//       city: formData.address.city,
//       state: formData.address.state,
//       pincode: formData.address.pincode,
//       country: formData.address.country,
//       description: formData.providerDetails.description,
//       experience: formData.providerDetails.experience,
//       serviceRadius: formData.providerDetails.serviceRadius,
//       availabilityStatus: formData.providerDetails.availabilityStatus,
//       services: formData.providerDetails.services,
//     };

//     try {
//       setSaving(true);
//       setError(null);
//       const res = await put("/user/provider/profile", payload);
//       toast.success(res?.message || "Profile updated successfully");
//       setEditMode(false);
//       fetchProvider();
//     } catch (err) {
//       const message = err?.response?.data?.message || "Couldn't save changes";
//       setError(message);
//       toast.error(message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50">
//         <Navbar />
//         <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
//           <Skeleton className="h-56 w-full rounded-3xl mb-6" />
//           <div className="grid gap-4 sm:grid-cols-4 mb-6">
//             {[0, 1, 2, 3].map((i) => (
//               <Skeleton key={i} className="h-24 rounded-2xl" />
//             ))}
//           </div>
//           <Skeleton className="h-40 w-full rounded-2xl" />
//         </div>
//       </div>
//     );
//   }

//   if (!provider) {
//     return (
//       <div className="min-h-screen bg-slate-50">
//         <Navbar />
//         <div className="flex flex-col items-center justify-center py-24 text-center">
//           <ShieldAlert className="mb-3 text-slate-300" size={40} />
//           <p className="font-medium text-slate-600">
//             {error || "Provider profile not found"}
//           </p>
//           <Button className="mt-4" onClick={fetchProvider}>
//             Try again
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const isOnline = provider?.providerDetails?.availabilityStatus === "ONLINE";
//   const vMeta = VERIFICATION_META[verificationStatus] || VERIFICATION_META.NOT_SUBMITTED;
//   const VIcon = vMeta.icon;
//   const services = editMode ? formData.providerDetails.services : provider?.providerDetails?.services || [];

//   return (
//     <div className="min-h-screen bg-slate-50 pb-16">
//       <Navbar />

//       <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
//         {error && !editMode && (
//           <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
//             {error}
//           </div>
//         )}

//         {/* HERO */}
//         <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
//           <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 sm:h-44" />

//           <div className="px-5 pb-6 sm:px-8 sm:pb-8">
//             <div className="flex justify-end pt-4">
//               {!editMode ? (
//                 <Button icon={Pencil} onClick={() => setEditMode(true)}>
//                   Edit Profile
//                 </Button>
//               ) : (
//                 <div className="flex gap-2.5">
//                   <Button variant="outline" icon={X} onClick={handleCancel} disabled={saving}>
//                     Cancel
//                   </Button>
//                   <Button
//                     variant="success"
//                     icon={saving ? undefined : Save}
//                     loading={saving}
//                     onClick={handleSave}
//                   >
//                     Save
//                   </Button>
//                 </div>
//               )}
//             </div>

//             <div className="-mt-14 flex flex-col gap-6 sm:-mt-16 sm:flex-row">
//               <div className="relative w-fit">
//                 <img
//                   src={provider?.avatar?.url || "https://i.pravatar.cc/300"}
//                   alt={provider?.name}
//                   className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md sm:h-32 sm:w-32"
//                 />
//                 <span
//                   className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-white ${
//                     isOnline ? "bg-emerald-500" : "bg-slate-400"
//                   }`}
//                 />
//               </div>

//               <div className="flex-1 pt-1">
//                 <div className="flex flex-wrap items-center gap-2.5">
//                   {editMode ? (
//                     <Input
//                       containerClassName="w-56"
//                       value={formData.name}
//                       onChange={(e) => setField("name", e.target.value)}
//                       placeholder="Your name"
//                     />
//                   ) : (
//                     <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
//                       {provider.name}
//                     </h1>
//                   )}
//                   <Badge variant={isOnline ? "green" : "slate"}>
//                     {isOnline ? "Online" : "Offline"}
//                   </Badge>
//                   <Badge variant={vMeta.variant}>
//                     <VIcon size={13} />
//                     {vMeta.label}
//                   </Badge>
//                 </div>

//                 <p className="mt-1.5 text-slate-500">
//                   {provider?.providerDetails?.services?.[0]?.category
//                     ? `${provider.providerDetails.services[0].category} Specialist`
//                     : "Service Provider"}
//                 </p>

//                 <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
//                   <span className="flex items-center gap-1.5">
//                     <Star size={16} className="text-amber-400" />
//                     {provider?.providerDetails?.averageRating || 0} rating
//                   </span>
//                   <span className="flex items-center gap-1.5">
//                     <Briefcase size={16} className="text-slate-400" />
//                     {provider?.providerDetails?.totalCompletedJobs || 0} jobs
//                   </span>
//                   <span className="flex items-center gap-1.5">
//                     <Clock size={16} className="text-slate-400" />
//                     {provider?.providerDetails?.experience || 0} yrs experience
//                   </span>
//                   <span className="flex items-center gap-1.5">
//                     <MapPin size={16} className="text-slate-400" />
//                     {provider?.address?.city || "—"}
//                     {provider?.address?.state ? `, ${provider.address.state}` : ""}
//                   </span>
//                 </div>

//                 {editMode && (
//                   <div className="mt-4">
//                     <label className="mb-1 block text-xs font-medium text-slate-500">
//                       Availability
//                     </label>
//                     <select
//                       value={formData.providerDetails.availabilityStatus}
//                       onChange={(e) => setProviderField("availabilityStatus", e.target.value)}
//                       className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
//                     >
//                       <option value="ONLINE">Online — accepting jobs</option>
//                       <option value="BUSY">Busy</option>
//                       <option value="OFFLINE">Offline — not accepting jobs</option>
//                     </select>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
//           {[
//             { label: "Experience", value: `${provider?.providerDetails?.experience || 0} yrs` },
//             { label: "Jobs Done", value: provider?.providerDetails?.totalCompletedJobs || 0 },
//             { label: "Reviews", value: provider?.providerDetails?.totalReviews || 0 },
//             {
//               label: "Earnings",
//               value: (
//                 <span className="inline-flex items-center">
//                   <IndianRupee size={18} />
//                   {provider?.providerDetails?.totalEarnings || 0}
//                 </span>
//               ),
//             },
//           ].map((stat) => (
//             <Card key={stat.label}>
//               <p className="text-xs font-medium text-slate-400">{stat.label}</p>
//               <p className="mt-1.5 text-2xl font-bold text-slate-900">{stat.value}</p>
//             </Card>
//           ))}
//         </div>

//         {/* CONTACT (edit mode only) */}
//         {editMode && (
//           <Card className="mt-6">
//             <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
//               <Phone size={18} />
//               Contact details
//             </h2>
//             <div className="grid gap-4 sm:grid-cols-2">
//               <Input
//                 label="Mobile"
//                 icon={Phone}
//                 value={formData.mobile}
//                 onChange={(e) => setField("mobile", e.target.value)}
//               />
//               <Input
//                 label="Email"
//                 icon={Mail}
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setField("email", e.target.value)}
//                 placeholder="you@example.com"
//               />
//               <Input
//                 label="Preferred language"
//                 icon={Globe}
//                 value={formData.language}
//                 onChange={(e) => setField("language", e.target.value)}
//               />
//               <Input
//                 label="Service radius (km)"
//                 icon={Power}
//                 type="number"
//                 min="1"
//                 value={formData.providerDetails.serviceRadius}
//                 onChange={(e) => setProviderField("serviceRadius", e.target.value)}
//               />
//             </div>
//           </Card>
//         )}

//         {/* ABOUT */}
//         <Card className="mt-6">
//           <h2 className="mb-4 text-lg font-bold text-slate-900">About Provider</h2>
//           {editMode ? (
//             <div>
//               <textarea
//                 rows={4}
//                 value={formData.providerDetails.description}
//                 onChange={(e) => setProviderField("description", e.target.value)}
//                 placeholder="Tell customers about your experience and specialties"
//                 className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
//               />
//               <Input
//                 className="mt-3"
//                 label="Years of experience"
//                 icon={Clock}
//                 type="number"
//                 min="0"
//                 value={formData.providerDetails.experience}
//                 onChange={(e) => setProviderField("experience", e.target.value)}
//                 containerClassName="max-w-xs"
//               />
//             </div>
//           ) : (
//             <p className="leading-7 text-slate-600">
//               {provider?.providerDetails?.description || "No description added"}
//             </p>
//           )}
//         </Card>

//         {/* ADDRESS */}
//         <Card className="mt-6">
//           <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
//             <MapPin size={18} />
//             Address
//           </h2>
//           {editMode ? (
//             <div className="grid gap-4">
//               <Input
//                 placeholder="Full address"
//                 value={formData.address.fullAddress}
//                 onChange={(e) => setAddressField("fullAddress", e.target.value)}
//               />
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <Input
//                   placeholder="House / flat no."
//                   value={formData.address.houseNo}
//                   onChange={(e) => setAddressField("houseNo", e.target.value)}
//                 />
//                 <Input
//                   placeholder="Landmark"
//                   value={formData.address.landmark}
//                   onChange={(e) => setAddressField("landmark", e.target.value)}
//                 />
//               </div>
//               <div className="grid gap-4 sm:grid-cols-4">
//                 <Input
//                   placeholder="City"
//                   value={formData.address.city}
//                   onChange={(e) => setAddressField("city", e.target.value)}
//                 />
//                 <Input
//                   placeholder="State"
//                   value={formData.address.state}
//                   onChange={(e) => setAddressField("state", e.target.value)}
//                 />
//                 <Input
//                   placeholder="Pincode"
//                   value={formData.address.pincode}
//                   onChange={(e) => setAddressField("pincode", e.target.value)}
//                 />
//                 <Input
//                   placeholder="Country"
//                   value={formData.address.country}
//                   onChange={(e) => setAddressField("country", e.target.value)}
//                 />
//               </div>
//             </div>
//           ) : (
//             <p className="text-slate-600">
//               {[
//                 provider?.address?.fullAddress,
//                 provider?.address?.city,
//                 provider?.address?.state,
//                 provider?.address?.pincode,
//               ]
//                 .filter(Boolean)
//                 .join(", ") || "No address added"}
//             </p>
//           )}
//         </Card>

//         {/* VERIFICATION */}
//         <Card className="mt-6">
//           <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
//             <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
//               <ShieldCheck size={18} />
//               Verification
//             </h2>
//             <Badge variant={vMeta.variant}>
//               <VIcon size={13} />
//               {vMeta.label}
//             </Badge>
//           </div>
//           <p className="mb-5 text-sm text-slate-500">
//             Upload these so customers know you're a verified provider.
//             {verificationStatus === "REJECTED" && verificationNote && (
//               <span className="mt-1 block font-medium text-red-600">
//                 Reason: {verificationNote}
//               </span>
//             )}
//           </p>

//           <div className="grid gap-4 sm:grid-cols-2">
//             {DOCUMENT_TYPES.map(({ key, label }) => {
//               const doc = documents?.[key];
//               const isUploading = uploadingType === key;
//               return (
//                 <div
//                   key={key}
//                   className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
//                 >
//                   <div className="flex min-w-0 items-center gap-3">
//                     {doc?.url ? (
//                       <img
//                         src={doc.url}
//                         alt={label}
//                         className="h-12 w-12 shrink-0 rounded-lg object-cover"
//                       />
//                     ) : (
//                       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
//                         <FileText size={20} className="text-slate-400" />
//                       </div>
//                     )}
//                     <div className="min-w-0">
//                       <p className="truncate font-medium text-slate-800">{label}</p>
//                       <p className="text-xs text-slate-400">
//                         {isUploading
//                           ? `Uploading… ${uploadProgress}%`
//                           : doc?.url
//                           ? "Uploaded"
//                           : "Not uploaded"}
//                       </p>
//                     </div>
//                   </div>

//                   <label
//                     className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
//                       isUploading
//                         ? "cursor-not-allowed bg-slate-100 text-slate-400"
//                         : "bg-blue-50 text-blue-700 hover:bg-blue-100"
//                     }`}
//                   >
//                     {isUploading ? (
//                       <Loader2 size={16} className="animate-spin" />
//                     ) : (
//                       <UploadCloud size={16} />
//                     )}
//                     {doc?.url ? "Replace" : "Upload"}
//                     <input
//                       type="file"
//                       accept="image/*,application/pdf"
//                       className="hidden"
//                       disabled={isUploading}
//                       onChange={(e) => {
//                         const file = e.target.files?.[0];
//                         handleDocumentUpload(key, file);
//                         e.target.value = "";
//                       }}
//                     />
//                   </label>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>

//         {/* SERVICES */}
//         <Card className="mt-6">
//           <h2 className="mb-4 text-lg font-bold text-slate-900">Services Offered</h2>

//           {services.length === 0 && !editMode && (
//             <p className="text-sm text-slate-500">
//               No services added yet. Click "Edit Profile" to add your first service so
//               customers can book you.
//             </p>
//           )}

//           {!editMode && services.length > 0 && (
//             <div className="flex flex-wrap gap-2.5">
//               {services.map((service, index) => (
//                 <span
//                   key={service._id || index}
//                   className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
//                 >
//                   {service.serviceName} · ₹{service.price}
//                 </span>
//               ))}
//             </div>
//           )}

//           {editMode && (
//             <>
//               <div className="mb-6 space-y-3">
//                 {services.length === 0 && (
//                   <p className="text-sm text-slate-500">
//                     No services added yet — customers can only book services you list here.
//                   </p>
//                 )}
//                 {services.map((service, index) => (
//                   <div
//                     key={service._id || index}
//                     className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
//                   >
//                     <div>
//                       <p className="font-semibold text-slate-800">
//                         {service.serviceName}{" "}
//                         <span className="font-normal text-slate-400">
//                           · {service.category}
//                         </span>
//                         {!service.isActive && (
//                           <Badge variant="slate" className="ml-2">
//                             Inactive
//                           </Badge>
//                         )}
//                       </p>
//                       <p className="flex items-center gap-1 text-sm text-slate-500">
//                         <IndianRupee size={12} />
//                         {service.price}
//                         {service.estimatedTime ? ` · ${service.estimatedTime}` : ""}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <button
//                         type="button"
//                         onClick={() => toggleServiceActive(index)}
//                         className="text-sm font-medium text-blue-600 hover:text-blue-700"
//                       >
//                         {service.isActive ? "Deactivate" : "Activate"}
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveService(index)}
//                         className="text-slate-400 hover:text-red-600"
//                       >
//                         <X size={18} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="border-t border-slate-100 pt-6">
//                 <h3 className="mb-3 font-semibold text-slate-800">Add a service</h3>
//                 <div className="grid gap-3 md:grid-cols-2">
//                   <Input
//                     placeholder="Service name (e.g. AC Repair)"
//                     value={newService.serviceName}
//                     onChange={(e) =>
//                       setNewService((prev) => ({ ...prev, serviceName: e.target.value }))
//                     }
//                   />
//                   <Input
//                     placeholder="Category (e.g. Electrical)"
//                     value={newService.category}
//                     onChange={(e) =>
//                       setNewService((prev) => ({ ...prev, category: e.target.value }))
//                     }
//                   />
//                   <Input
//                     type="number"
//                     min="0"
//                     icon={IndianRupee}
//                     placeholder="Price"
//                     value={newService.price}
//                     onChange={(e) =>
//                       setNewService((prev) => ({ ...prev, price: e.target.value }))
//                     }
//                   />
//                   <Input
//                     placeholder="Estimated time (e.g. 1-2 hours)"
//                     value={newService.estimatedTime}
//                     onChange={(e) =>
//                       setNewService((prev) => ({ ...prev, estimatedTime: e.target.value }))
//                     }
//                   />
//                   <textarea
//                     placeholder="Short description (optional)"
//                     value={newService.description}
//                     onChange={(e) =>
//                       setNewService((prev) => ({ ...prev, description: e.target.value }))
//                     }
//                     rows={2}
//                     className="rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 md:col-span-2"
//                   />
//                 </div>
//                 <Button className="mt-4" icon={Plus} onClick={handleAddService}>
//                   Add Service
//                 </Button>
//               </div>
//             </>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ProviderProfile;





import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { get, put, uploadFile } from "../utils/api";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";

import ProfileHero from "../components/provider-profile/ProfileHero";
import ProfileStats from "../components/provider-profile/ProfileStats";
import ContactSection from "../components/provider-profile/ContactSection";
import AboutSection from "../components/provider-profile/AboutSection";
import AddressSection from "../components/provider-profile/AddressSection";
import VerificationSection from "../components/provider-profile/VerificationSection";
import ServicesSection from "../components/provider-profile/ServicesSection";
import {
  EMPTY_SERVICE,
  emptyForm,
  toFormData,
  VERIFICATION_META,
} from "../components/provider-profile/constants";

/**
 * Provider profile — display + inline edit in one page.
 *
 * Fetches from GET /user/provider/profile, saves via
 * PUT /user/provider/profile, and uploads verification documents via
 * POST /user/provider/documents (multipart). All three are wired
 * through utils/api.js so swapping in the real backend needs no UI
 * changes.
 *
 * The page itself only owns state + data fetching; each section of
 * the UI (hero, stats, contact, about, address, verification,
 * services) lives in its own file under components/provider-profile/
 * so this file stays readable as the feature grows.
 */
const ProviderProfile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);

  const [provider, setProvider] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [newService, setNewService] = useState(EMPTY_SERVICE);

  const [documents, setDocuments] = useState({});
  const [verificationStatus, setVerificationStatus] = useState("NOT_SUBMITTED");
  const [verificationNote, setVerificationNote] = useState("");
  const [uploadingType, setUploadingType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchProvider = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await get("/user/provider/profile");
      setProvider(res?.provider || null);
      setFormData(toFormData(res?.provider));
      setDocuments(res?.provider?.documents || {});
      setVerificationStatus(
        res?.provider?.providerDetails?.verificationStatus || "NOT_SUBMITTED"
      );
      setVerificationNote(res?.provider?.providerDetails?.verificationNote || "");
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't load your profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvider();
  }, []);

  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const setAddressField = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));

  const setProviderField = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      providerDetails: { ...prev.providerDetails, [field]: value },
    }));

  const handleDocumentUpload = async (type, file) => {
    if (!file) return;
    const body = new FormData();
    body.append("document", file);
    body.append("type", type);

    try {
      setUploadingType(type);
      setUploadProgress(0);
      const res = await uploadFile("/user/provider/documents", body, setUploadProgress);
      setDocuments(res.documents || {});
      setVerificationStatus(res.verificationStatus || "PENDING");
      setVerificationNote("");
      toast.success("Document uploaded — pending review");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't upload this document");
    } finally {
      setUploadingType(null);
      setUploadProgress(0);
    }
  };

  const handleAddService = () => {
    if (!newService.serviceName || !newService.category || !newService.price) {
      toast.warning("Service name, category and price are required");
      return;
    }
    setProviderField("services", [...formData.providerDetails.services, { ...newService }]);
    setNewService(EMPTY_SERVICE);
  };

  const handleRemoveService = (index) => {
    setProviderField(
      "services",
      formData.providerDetails.services.filter((_, i) => i !== index)
    );
  };

  const toggleServiceActive = (index) => {
    setProviderField(
      "services",
      formData.providerDetails.services.map((s, i) =>
        i === index ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  const handleCancel = () => {
    setFormData(toFormData(provider));
    setNewService(EMPTY_SERVICE);
    setEditMode(false);
  };

  const handleSave = async () => {
    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      language: formData.language,
      fullAddress: formData.address.fullAddress,
      houseNo: formData.address.houseNo,
      landmark: formData.address.landmark,
      city: formData.address.city,
      state: formData.address.state,
      pincode: formData.address.pincode,
      country: formData.address.country,
      description: formData.providerDetails.description,
      experience: formData.providerDetails.experience,
      serviceRadius: formData.providerDetails.serviceRadius,
      availabilityStatus: formData.providerDetails.availabilityStatus,
      services: formData.providerDetails.services,
    };

    try {
      setSaving(true);
      setError(null);
      const res = await put("/user/provider/profile", payload);
      toast.success(res?.message || "Profile updated successfully");
      setEditMode(false);
      fetchProvider();
    } catch (err) {
      const message = err?.response?.data?.message || "Couldn't save changes";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          <Skeleton className="mb-4 h-44 w-full rounded-2xl sm:mb-6 sm:h-56 sm:rounded-3xl" />
          <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl sm:h-24" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <ShieldAlert className="mb-3 text-slate-300" size={40} />
          <p className="font-medium text-slate-600">
            {error || "Provider profile not found"}
          </p>
          <Button className="mt-4" onClick={fetchProvider}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const isOnline = provider?.providerDetails?.availabilityStatus === "ONLINE";
  const vMeta = VERIFICATION_META[verificationStatus] || VERIFICATION_META.NOT_SUBMITTED;
  const services = editMode
    ? formData.providerDetails.services
    : provider?.providerDetails?.services || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-10 sm:pb-16">
      <Navbar />

      <div className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        {error && !editMode && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mb-5">
            {error}
          </div>
        )}

        <ProfileHero
          provider={provider}
          formData={formData}
          editMode={editMode}
          saving={saving}
          isOnline={isOnline}
          vMeta={vMeta}
          onEdit={() => setEditMode(true)}
          onCancel={handleCancel}
          onSave={handleSave}
          setField={setField}
          setProviderField={setProviderField}
        />

        <ProfileStats provider={provider} />

        {editMode && (
          <ContactSection
            formData={formData}
            setField={setField}
            setProviderField={setProviderField}
          />
        )}

        <AboutSection
          provider={provider}
          formData={formData}
          editMode={editMode}
          setProviderField={setProviderField}
        />

        <AddressSection
          provider={provider}
          formData={formData}
          editMode={editMode}
          setAddressField={setAddressField}
        />

        <VerificationSection
          vMeta={vMeta}
          verificationStatus={verificationStatus}
          verificationNote={verificationNote}
          documents={documents}
          uploadingType={uploadingType}
          uploadProgress={uploadProgress}
          onUpload={handleDocumentUpload}
        />

        <ServicesSection
          services={services}
          editMode={editMode}
          newService={newService}
          setNewService={setNewService}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
          onToggleActive={toggleServiceActive}
        />
      </div>
    </div>
  );
};

export default ProviderProfile;