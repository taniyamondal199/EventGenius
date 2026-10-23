"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useUIStore } from "@/stores/uiStore";
import { BudgetItemSchema, BudgetItemInput, BUDGET_CATEGORIES, Event } from "@/types";

interface BudgetItemModalProps {
  event: Event;
  onSave: (data: BudgetItemInput, itemId?: string) => Promise<void>;
  isLoading?: boolean;
}

export function BudgetItemModal({ event, onSave, isLoading }: BudgetItemModalProps) {
  const { isBudgetItemModalOpen, closeBudgetItemModal, editingBudgetItemId } = useUIStore();

  const editingItem = event.budgetItems?.find((it) => it.id === editingBudgetItemId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetItemInput>({
    resolver: zodResolver(BudgetItemSchema),
    defaultValues: {
      category: "CATERING",
      name: "",
      estimatedCost: 0,
      actualCost: 0,
      paidAmount: 0,
      status: "ESTIMATED",
      notes: "",
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        category: editingItem.category,
        name: editingItem.name,
        estimatedCost: editingItem.estimatedCost,
        actualCost: editingItem.actualCost,
        paidAmount: editingItem.paidAmount,
        status: editingItem.status,
        notes: editingItem.notes || "",
      });
    } else {
      reset({
        category: "CATERING",
        name: "",
        estimatedCost: 0,
        actualCost: 0,
        paidAmount: 0,
        status: "ESTIMATED",
        notes: "",
      });
    }
  }, [editingItem, reset, isBudgetItemModalOpen]);

  const onSubmit = async (data: BudgetItemInput) => {
    await onSave(data, editingBudgetItemId || undefined);
    closeBudgetItemModal();
  };

  return (
    <Modal
      isOpen={isBudgetItemModalOpen}
      onClose={closeBudgetItemModal}
      title={editingItem ? "Edit Budget Item" : "Add Budget Line Item"}
      description={`Allocate funds for ${event.title}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Category
          </label>
          <select
            {...register("category")}
            className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {BUDGET_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Item Name */}
        <Input
          label="Item Name / Vendor Specification"
          placeholder="e.g., Farm-to-table Plated Dinner"
          {...register("name")}
          error={errors.name?.message}
        />

        {/* Cost Matrix (3 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Estimated ($)"
            type="number"
            step="any"
            placeholder="0"
            {...register("estimatedCost", { valueAsNumber: true })}
            error={errors.estimatedCost?.message}
          />
          <Input
            label="Actual ($)"
            type="number"
            step="any"
            placeholder="0"
            {...register("actualCost", { valueAsNumber: true })}
            error={errors.actualCost?.message}
          />
          <Input
            label="Paid ($)"
            type="number"
            step="any"
            placeholder="0"
            {...register("paidAmount", { valueAsNumber: true })}
            error={errors.paidAmount?.message}
          />
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Payment Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["ESTIMATED", "RESERVED", "PAID"] as const).map((st) => (
              <label
                key={st}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-semibold cursor-pointer hover:border-brand-500 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10 has-[:checked]:text-brand-400"
              >
                <input
                  type="radio"
                  value={st}
                  {...register("status")}
                  className="sr-only"
                />
                {st}
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Contract Notes / Inclusions"
          placeholder="Details on payment milestones, taxes, or tips..."
          {...register("notes")}
          error={errors.notes?.message}
        />

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={closeBudgetItemModal}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="luxury" isLoading={isLoading}>
            {editingItem ? "Save Changes" : "Add Line Item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
