"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useUIStore } from "@/stores/uiStore";
import { VendorChecklistSchema, VendorChecklistInput, VENDOR_STATUSES, Event } from "@/types";

interface VendorModalProps {
  event: Event;
  onSave: (data: VendorChecklistInput, vendorId?: string) => Promise<void>;
  isLoading?: boolean;
}

export function VendorModal({ event, onSave, isLoading }: VendorModalProps) {
  const { isVendorModalOpen, closeVendorModal, editingVendorId } = useUIStore();

  const editingVendor = event.vendors?.find((v) => v.id === editingVendorId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorChecklistInput>({
    resolver: zodResolver(VendorChecklistSchema),
    defaultValues: {
      category: "Catering",
      vendorName: "",
      contactEmail: "",
      contactPhone: "",
      contractUrl: "",
      notes: "",
      status: "RESEARCHING",
    },
  });

  useEffect(() => {
    if (editingVendor) {
      reset({
        category: editingVendor.category,
        vendorName: editingVendor.vendorName,
        contactEmail: editingVendor.contactEmail || "",
        contactPhone: editingVendor.contactPhone || "",
        contractUrl: editingVendor.contractUrl || "",
        notes: editingVendor.notes || "",
        status: editingVendor.status,
      });
    } else {
      reset({
        category: "Catering",
        vendorName: "",
        contactEmail: "",
        contactPhone: "",
        contractUrl: "",
        notes: "",
        status: "RESEARCHING",
      });
    }
  }, [editingVendor, reset, isVendorModalOpen]);

  const onSubmit = async (data: VendorChecklistInput) => {
    await onSave(data, editingVendorId || undefined);
    closeVendorModal();
  };

  return (
    <Modal
      isOpen={isVendorModalOpen}
      onClose={closeVendorModal}
      title={editingVendor ? "Edit Vendor Details" : "Add Vendor Candidate"}
      description={`Vendor directory for ${event.title}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Vendor Name */}
        <Input
          label="Vendor Business Name"
          placeholder="e.g., Farm & Vine Culinary Guild"
          {...register("vendorName")}
          error={errors.vendorName?.message}
        />

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Service Category"
            placeholder="e.g., Floral & Lighting"
            {...register("category")}
            error={errors.category?.message}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Pipeline Stage
            </label>
            <select
              {...register("status")}
              className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {VENDOR_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Contact Email"
            type="email"
            placeholder="lead@vendor.com"
            {...register("contactEmail")}
            error={errors.contactEmail?.message}
          />
          <Input
            label="Contact Phone"
            placeholder="+1 (555) 000-0000"
            {...register("contactPhone")}
            error={errors.contactPhone?.message}
          />
        </div>

        {/* Contract URL */}
        <Input
          label="Contract / Proposal Link"
          type="url"
          placeholder="https://drive.google.com/... or pdf url"
          {...register("contractUrl")}
          error={errors.contractUrl?.message}
        />

        {/* Notes */}
        <Textarea
          label="Notes & Inclusions"
          placeholder="Pricing quotes, tastings scheduled, special dietary requests..."
          {...register("notes")}
          error={errors.notes?.message}
        />

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={closeVendorModal}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="luxury" isLoading={isLoading}>
            {editingVendor ? "Save Changes" : "Save Vendor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
