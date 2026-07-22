import React from "react";
import { MapPin } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";

const AddressSection = ({ provider, formData, editMode, setAddressField }) => (
  <Card className="mt-4 sm:mt-6" padding="p-4 sm:p-5">
    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">
      <MapPin size={17} />
      Address
    </h2>
    {editMode ? (
      <div className="grid gap-4">
        <Input
          placeholder="Full address"
          value={formData.address.fullAddress}
          onChange={(e) => setAddressField("fullAddress", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="House / flat no."
            value={formData.address.houseNo}
            onChange={(e) => setAddressField("houseNo", e.target.value)}
          />
          <Input
            placeholder="Landmark"
            value={formData.address.landmark}
            onChange={(e) => setAddressField("landmark", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            placeholder="City"
            value={formData.address.city}
            onChange={(e) => setAddressField("city", e.target.value)}
          />
          <Input
            placeholder="State"
            value={formData.address.state}
            onChange={(e) => setAddressField("state", e.target.value)}
          />
          <Input
            placeholder="Pincode"
            value={formData.address.pincode}
            onChange={(e) => setAddressField("pincode", e.target.value)}
          />
          <Input
            placeholder="Country"
            value={formData.address.country}
            onChange={(e) => setAddressField("country", e.target.value)}
          />
        </div>
      </div>
    ) : (
      <p className="text-sm text-slate-600 sm:text-base">
        {[
          provider?.address?.fullAddress,
          provider?.address?.city,
          provider?.address?.state,
          provider?.address?.pincode,
        ]
          .filter(Boolean)
          .join(", ") || "No address added"}
      </p>
    )}
  </Card>
);

export default AddressSection;