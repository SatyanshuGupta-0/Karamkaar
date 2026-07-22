import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Save } from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Badge";
import VerifiableField from "../components/auth/VerifiableField";
import OtpModal from "../components/auth/OtpModal";
import { get, put } from "../utils/api";
import { getUser } from "../utils/auth";
import { isContactVerified, markContactVerified } from "../utils/verification";
import { useToast } from "../context/ToastContext";

const EditProfile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
  const [, setVerifiedTick] = useState(0); // bump to re-check verified state
  const [otpChannel, setOtpChannel] = useState(null); // "email" | "mobile" | null

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Rename this if your backend uses a different route for a
      // plain customer's own profile (ProviderProfile uses the
      // provider-specific /user/provider/profile).
      const res = await get("/user/profile");
      const u = res?.user || res;
      setFormData({
        name: u?.name || "",
        email: u?.email || "",
        mobile: u?.mobile || "",
      });
    } catch {
      // Endpoint not wired up yet — fall back to what's already
      // cached locally from login so the page is still usable.
      const cached = getUser();
      setFormData({
        name: cached?.name || "",
        email: cached?.email || "",
        mobile: cached?.mobile || "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await put("/user/profile", formData);
      const updatedUser = res?.user || { ...getUser(), ...formData };
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch {
        // ignore quota errors
      }
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit Profile</h1>

        <Card padding="p-5 sm:p-6">
          <div className="space-y-5">
            <Input
              label="Name"
              icon={User}
              value={formData.name}
              onChange={(e) => setField("name", e.target.value)}
            />

            <VerifiableField
              label="Email"
              icon={Mail}
              type="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@example.com"
              verified={isContactVerified("email", formData.email)}
              onVerifyClick={() => setOtpChannel("email")}
            />

            <VerifiableField
              label="Mobile Number"
              icon={Phone}
              type="tel"
              value={formData.mobile}
              onChange={(e) => setField("mobile", e.target.value)}
              placeholder="+91 98765 43210"
              verified={isContactVerified("mobile", formData.mobile)}
              onVerifyClick={() => setOtpChannel("mobile")}
            />
          </div>

          <Button className="mt-6" icon={Save} loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </Card>
      </div>

      <OtpModal
        open={Boolean(otpChannel)}
        channel={otpChannel || "mobile"}
        destination={otpChannel === "email" ? formData.email : formData.mobile}
        autoSend
        title={`Verify your ${otpChannel === "email" ? "email" : "mobile number"}`}
        onClose={() => setOtpChannel(null)}
        onVerified={() => {
          markContactVerified(otpChannel, otpChannel === "email" ? formData.email : formData.mobile);
          setVerifiedTick((t) => t + 1);
          setOtpChannel(null);
          toast.success(`${otpChannel === "email" ? "Email" : "Mobile number"} verified`);
        }}
      />
    </div>
  );
};

export default EditProfile;
