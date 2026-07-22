import React from "react";
import { IndianRupee } from "lucide-react";
import Card from "../ui/Card";

const ProfileStats = ({ provider }) => {
  const stats = [
    { label: "Experience", value: `${provider?.providerDetails?.experience || 0} yrs` },
    { label: "Jobs Done", value: provider?.providerDetails?.totalCompletedJobs || 0 },
    { label: "Reviews", value: provider?.providerDetails?.totalReviews || 0 },
    {
      label: "Earnings",
      value: (
        <span className="inline-flex items-center">
          <IndianRupee size={16} className="sm:hidden" />
          <IndianRupee size={18} className="hidden sm:block" />
          {provider?.providerDetails?.totalEarnings || 0}
        </span>
      ),
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} padding="p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-400">{stat.label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900 sm:mt-1.5 sm:text-2xl">
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  );
};

export default ProfileStats;