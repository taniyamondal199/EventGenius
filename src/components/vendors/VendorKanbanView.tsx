"use client";

import React, { useState } from "react";
import { Event, VendorChecklist, VendorStatus, VENDOR_STATUSES } from "@/types";
import { useUIStore } from "@/stores/uiStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  Plus,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface VendorKanbanViewProps {
  event: Event;
  onUpdateVendorStatus: (vendorId: string, status: VendorStatus) => Promise<void>;
  onDeleteVendor: (vendorId: string) => Promise<void>;
}

export function VendorKanbanView({
  event,
  onUpdateVendorStatus,
  onDeleteVendor,
}: VendorKanbanViewProps) {
  const { openVendorModal, openVendorBriefModal } = useUIStore();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");

  const vendors = event.vendors || [];

  // Get unique categories for filter
  const categories = Array.from(new Set(vendors.map((v) => v.category)));

  const filteredVendors = vendors.filter((v) => {
    if (activeCategoryFilter !== "ALL") return v.category === activeCategoryFilter;
    return true;
  });

  const statusOrder: VendorStatus[] = [
    "RESEARCHING",
    "CONTACTED",
    "QUOTE_RECEIVED",
    "HIRED",
    "REJECTED",
  ];

  const moveVendor = (vendor: VendorChecklist, direction: "next" | "prev") => {
    const currentIndex = statusOrder.indexOf(vendor.status);
    if (direction === "next" && currentIndex < statusOrder.length - 1) {
      onUpdateVendorStatus(vendor.id, statusOrder[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      onUpdateVendorStatus(vendor.id, statusOrder[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <CardTitle>Vendor Lifecycle & Procurement Pipeline</CardTitle>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Track vendor progress from market research to contracts and execution
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openVendorBriefModal("Catering")}
              className="text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-400" />
              Generate Vendor RFP
            </Button>
            <Button
              variant="luxury"
              size="sm"
              onClick={() => openVendorModal(null)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Vendor Candidate
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-semibold text-slate-400 mr-1">Filter:</span>
          <Button
            variant={activeCategoryFilter === "ALL" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveCategoryFilter("ALL")}
            className="text-xs h-7 px-2.5"
          >
            All Categories ({vendors.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategoryFilter === cat ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveCategoryFilter(cat)}
              className="text-xs h-7 px-2.5"
            >
              {cat}
            </Button>
          ))}
        </div>
      </Card>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {VENDOR_STATUSES.map((statusConfig) => {
          const columnVendors = filteredVendors.filter(
            (v) => v.status === statusConfig.value
          );

          return (
            <div
              key={statusConfig.value}
              className="flex flex-col rounded-2xl bg-slate-900/40 border border-slate-800 p-3 min-w-[260px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: statusConfig.color }}
                  />
                  <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                    {statusConfig.label}
                  </h4>
                </div>
                <Badge variant="outline" size="sm">
                  {columnVendors.length}
                </Badge>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 flex-1">
                {columnVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="p-3.5 rounded-xl glass-card border border-slate-800/80 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="purple" size="sm" className="text-[10px] mb-1">
                          {vendor.category}
                        </Badge>
                        <h5 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                          {vendor.vendorName}
                        </h5>
                      </div>

                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openVendorModal(vendor.id)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Edit vendor"
                          aria-label={`Edit ${vendor.vendorName}`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteVendor(vendor.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                          title="Delete vendor"
                          aria-label={`Delete ${vendor.vendorName}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {vendor.notes && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">
                        &ldquo;{vendor.notes}&rdquo;
                      </p>
                    )}

                    {/* Contact & Contract URLs */}
                    <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                      {vendor.contactEmail && (
                        <a
                          href={`mailto:${vendor.contactEmail}`}
                          aria-label={`Email ${vendor.vendorName}`}
                          className="flex items-center gap-1.5 hover:text-brand-300 transition-colors truncate"
                        >
                          <Mail className="w-3 h-3 text-brand-400 shrink-0" />
                          <span className="truncate">{vendor.contactEmail}</span>
                        </a>
                      )}
                      {vendor.contactPhone && (
                        <a
                          href={`tel:${vendor.contactPhone}`}
                          aria-label={`Call ${vendor.vendorName}`}
                          className="flex items-center gap-1.5 hover:text-brand-300 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{vendor.contactPhone}</span>
                        </a>
                      )}
                      {vendor.contractUrl && (
                        <a
                          href={vendor.contractUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View agreement for ${vendor.vendorName}`}
                          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-medium truncate"
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate">View Agreement / Quote</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      )}
                    </div>

                    {/* Stage Transition Controls */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => moveVendor(vendor, "prev")}
                        disabled={vendor.status === "RESEARCHING"}
                        title="Move back a stage"
                        aria-label={`Move ${vendor.vendorName} back a stage`}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openVendorBriefModal(vendor.category)}
                        aria-label={`Generate RFP brief for ${vendor.category}`}
                        className="text-[10px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> RFP Brief
                      </button>

                      <button
                        onClick={() => moveVendor(vendor, "next")}
                        disabled={vendor.status === "REJECTED"}
                        title="Advance to next stage"
                        aria-label={`Advance ${vendor.vendorName} to next stage`}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {columnVendors.length === 0 && (
                  <div className="py-8 text-center text-slate-600 text-[11px] italic">
                    Empty in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
