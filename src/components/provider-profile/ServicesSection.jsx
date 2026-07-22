import React from "react";
import { X, Plus, IndianRupee } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Badge } from "../ui/Badge";

const ServicesSection = ({
    services,
    editMode,
    newService,
    setNewService,
    onAddService,
    onRemoveService,
    onToggleActive,
}) => (
    <Card className="mt-4 sm:mt-6" padding="p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">
            Services Offered
        </h2>

        {services.length === 0 && !editMode && (
            <p className="text-sm text-slate-500">
                No services added yet. Click "Edit Profile" to add your first service so
                customers can book you.
            </p>
        )}

        {!editMode && services.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {services.map((service, index) => (
                    <span
                        key={service._id || index}
                        className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-blue-700 sm:px-4 sm:py-2 sm:text-sm"
                    >
                        {service.serviceName} · ₹{service.price}
                    </span>
                ))}

                {services.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {services.keywords.map((k) => (
                            <span
                                key={k}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                            >
                                {k}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        )}

        {editMode && (
            <>
                <div className="mb-5 space-y-3 sm:mb-6">
                    {services.length === 0 && (
                        <p className="text-sm text-slate-500">
                            No services added yet — customers can only book services you list here.
                        </p>
                    )}
                    {services.map((service, index) => (
                        <div
                            key={service._id || index}
                            className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">
                                    {service.serviceName}{" "}
                                    <span className="font-normal text-slate-400">· {service.category}</span>
                                    {!service.isActive && (
                                        <Badge variant="slate" className="ml-2">
                                            Inactive
                                        </Badge>
                                    )}
                                </p>
                                <p className="flex items-center gap-1 text-xs text-slate-500 sm:text-sm">
                                    <IndianRupee size={12} />
                                    {service.price}
                                    {service.estimatedTime ? ` · ${service.estimatedTime}` : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 self-end sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => onToggleActive(index)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    {service.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemoveService(index)}
                                    className="text-slate-400 hover:text-red-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-100 pt-5 sm:pt-6">
                    <h3 className="mb-3 text-sm font-semibold text-slate-800 sm:text-base">
                        Add a service
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        <Input
                            placeholder="Service name (e.g. AC Repair)"
                            value={newService.serviceName}
                            onChange={(e) =>
                                setNewService((prev) => ({ ...prev, serviceName: e.target.value }))
                            }
                        />
                        <Input
                            placeholder="Category (e.g. Electrical)"
                            value={newService.category}
                            onChange={(e) => setNewService((prev) => ({ ...prev, category: e.target.value }))}
                        />
                        <Input
                            type="number"
                            min="0"
                            icon={IndianRupee}
                            placeholder="Price"
                            value={newService.price}
                            onChange={(e) => setNewService((prev) => ({ ...prev, price: e.target.value }))}
                        />
                        <Input
                            placeholder="Estimated time (e.g. 1-2 hours)"
                            value={newService.estimatedTime}
                            onChange={(e) =>
                                setNewService((prev) => ({ ...prev, estimatedTime: e.target.value }))
                            }
                        />
                        <textarea
                            placeholder="Short description (optional)"
                            value={newService.description}
                            onChange={(e) =>
                                setNewService((prev) => ({ ...prev, description: e.target.value }))
                            }
                            rows={2}
                            className="rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 md:col-span-2"
                        />
                        <div className="md:col-span-2">
                            <input
                                placeholder="Search keywords, comma separated (e.g. ac, cooling, gas filling, air conditioner)"
                                value={newService.keywords}
                                onChange={(e) =>
                                    setNewService((prev) => ({
                                        ...prev,
                                        keywords: e.target.value,
                                    }))
                                }
                                className="border p-3 rounded-xl w-full"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Add other words customers might search for — including
                                common misspellings — so they can always find this service.
                            </p>
                        </div>
                    </div>
                    <Button className="mt-4 w-full sm:w-auto" icon={Plus} onClick={onAddService}>
                        Add Service
                    </Button>
                </div>
            </>
        )}
    </Card>
);

export default ServicesSection;