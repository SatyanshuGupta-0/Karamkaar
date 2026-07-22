import React from "react";
import { Phone, Mail, Globe, Power } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";

const ContactSection = ({ formData, setField, setProviderField }) => (
  <Card className="mt-4 sm:mt-6" padding="p-4 sm:p-5">
    <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
      <Phone size={17} />
      Contact details
    </h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Mobile"
        icon={Phone}
        value={formData.mobile}
        onChange={(e) => setField("mobile", e.target.value)}
      />
      <Input
        label="Email"
        icon={Mail}
        type="email"
        value={formData.email}
        onChange={(e) => setField("email", e.target.value)}
        placeholder="you@example.com"
      />
      <Input
        label="Preferred language"
        icon={Globe}
        value={formData.language}
        onChange={(e) => setField("language", e.target.value)}
      />
      <Input
        label="Service radius (km)"
        icon={Power}
        type="number"
        min="1"
        value={formData.providerDetails.serviceRadius}
        onChange={(e) => setProviderField("serviceRadius", e.target.value)}
      />
    </div>
  </Card>
);

export default ContactSection;