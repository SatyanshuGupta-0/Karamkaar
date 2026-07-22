import React, { useRef } from "react";
import {
  Star,
  Briefcase,
  Clock,
  MapPin,
  Pencil,
  Save,
  X,
  Camera,
} from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import { Badge } from "../ui/Badge";

const ProfileHero = ({
  provider,
  formData,
  editMode,
  saving,
  isOnline,
  vMeta,
  onEdit,
  onCancel,
  onSave,
  setField,
  setProviderField,
  onAvatarChange,
}) => {
  const VIcon = vMeta.icon;

  const fileInputRef = useRef(null);

  return (
    <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow">

      {/* Banner */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

      <div className="relative px-5 sm:px-8 pb-8">

        {/* Avatar + Header */}
        <div className="-mt-16 flex flex-col sm:flex-row gap-6">

          {/* Avatar */}
          <div className="relative w-fit mx-auto sm:mx-0">

            <img
              src={
                formData?.avatar?.url ||
                provider?.avatar?.url ||
                "https://i.pravatar.cc/300"
              }
              alt={provider?.name}
              className="h-32 w-32 rounded-full border-[5px] border-white object-cover shadow-xl"
            />

            {/* Online Dot */}
            <span
              className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-[3px] border-white ${
                isOnline
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />

            {/* Upload */}
            {editMode && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current.click()
                  }
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
                >
                  <Camera size={18} />
                </button>

                <input
                  hidden
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                />
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex-1">

            {/* Edit Buttons */}
            <div className="flex justify-end">

              {!editMode ? (

                <Button
                  icon={Pencil}
                  onClick={onEdit}
                >
                  Edit Profile
                </Button>

              ) : (

                <div className="flex gap-2">

                  <Button
                    variant="outline"
                    icon={X}
                    disabled={saving}
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="success"
                    loading={saving}
                    icon={!saving ? Save : undefined}
                    onClick={onSave}
                  >
                    Save
                  </Button>

                </div>

              )}

            </div>

            {/* Name */}
            <div className="mt-5 flex flex-wrap items-center gap-3">

              {editMode ? (

                <Input
                  value={formData.name}
                  containerClassName="max-w-xs"
                  onChange={(e) =>
                    setField(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Provider name"
                />

              ) : (

                <h1 className="text-3xl font-bold text-slate-900">
                  {provider?.name}
                </h1>

              )}

              <Badge
                variant={
                  isOnline
                    ? "green"
                    : "slate"
                }
              >
                {isOnline
                  ? "Online"
                  : "Offline"}
              </Badge>

              <Badge variant={vMeta.variant}>
                <VIcon size={13} />
                {vMeta.label}
              </Badge>

            </div>

            {/* Category */}

            <p className="mt-2 text-slate-500">

              {provider?.providerDetails
                ?.services?.[0]?.category
                ? `${provider.providerDetails.services[0].category} Specialist`
                : "Service Provider"}

            </p>            {/* Stats */}

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

              {/* <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:shadow-md">
                <Star
                  size={22}
                  className="mx-auto text-amber-500 fill-amber-500"
                />

                <h3 className="mt-2 text-xl font-bold">
                  {provider?.providerDetails?.averageRating || 0}
                </h3>

                <p className="text-xs text-slate-500">
                  Rating
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:shadow-md">
                <Briefcase
                  size={22}
                  className="mx-auto text-blue-600"
                />

                <h3 className="mt-2 text-xl font-bold">
                  {provider?.providerDetails?.totalCompletedJobs || 0}
                </h3>

                <p className="text-xs text-slate-500">
                  Jobs Completed
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:shadow-md">
                <Clock
                  size={22}
                  className="mx-auto text-purple-600"
                />

                <h3 className="mt-2 text-xl font-bold">
                  {provider?.providerDetails?.experience || 0}
                </h3>

                <p className="text-xs text-slate-500">
                  Years Experience
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:shadow-md">
                <MapPin
                  size={22}
                  className="mx-auto text-red-500"
                />

                <h3 className="mt-2 text-sm font-semibold truncate">
                  {provider?.address?.city || "Unknown"}
                </h3>

                <p className="text-xs text-slate-500 truncate">
                  {provider?.address?.state || "India"}
                </p>
              </div> */}

            </div>

            {/* Availability */}

            {editMode && (

              <div className="mt-7">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Availability
                </label>

                <select
                  value={
                    formData.providerDetails.availabilityStatus
                  }
                  onChange={(e) =>
                    setProviderField(
                      "availabilityStatus",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600"
                >
                  <option value="ONLINE">
                    🟢 Online
                  </option>

                  <option value="BUSY">
                    🟠 Busy
                  </option>

                  <option value="OFFLINE">
                    🔴 Offline
                  </option>

                </select>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfileHero;