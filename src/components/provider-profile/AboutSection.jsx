import React from "react";
import { Clock } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";

const AboutSection = ({ provider, formData, editMode, setProviderField }) => (
  <Card className="mt-4 sm:mt-6" padding="p-4 sm:p-5">
    <h2 className="mb-3 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">
      About Provider
    </h2>
    {editMode ? (
      <div>
        <textarea
          rows={4}
          value={formData.providerDetails.description}
          onChange={(e) => setProviderField("description", e.target.value)}
          placeholder="Tell customers about your experience and specialties"
          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <Input
          className="mt-3"
          label="Years of experience"
          icon={Clock}
          type="number"
          min="0"
          value={formData.providerDetails.experience}
          onChange={(e) => setProviderField("experience", e.target.value)}
          containerClassName="max-w-xs"
        />
      </div>
    ) : (
      <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        {provider?.providerDetails?.description || "No description added"}
      </p>
    )}
  </Card>
);

export default AboutSection;