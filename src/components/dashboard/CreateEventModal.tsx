"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useUIStore } from "@/stores/uiStore";
import { CreateEventSchema, CreateEventInput, EVENT_TYPES } from "@/types";
import { Sparkles } from "lucide-react";

interface CreateEventModalProps {
  onCreate: (data: CreateEventInput) => Promise<void>;
  isLoading?: boolean;
}

export function CreateEventModal({ onCreate, isLoading }: CreateEventModalProps) {
  const { isCreateEventModalOpen, setCreateEventModalOpen } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      title: "",
      eventType: "WEDDING",
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)
        .toISOString()
        .slice(0, 10),
      location: "",
      totalBudget: 45000,
      currency: "USD",
      guestCount: 120,
      themeNotes: "",
    },
  });

  const onSubmit = async (data: CreateEventInput) => {
    await onCreate(data);
    reset();
    setCreateEventModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateEventModalOpen}
      onClose={() => setCreateEventModalOpen(false)}
      title="Create New Event Plan"
      description="Initialize an enterprise event workspace with budget tracking and AI automation."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <Input
          label="Event Title"
          placeholder="e.g., Liam & Chloe's Coastal Wedding"
          {...register("title")}
          error={errors.title?.message}
        />

        {/* Event Type */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Event Domain
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EVENT_TYPES.map((t) => (
              <label
                key={t.value}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-semibold cursor-pointer hover:border-brand-500 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10 has-[:checked]:text-brand-400 text-center"
              >
                <input
                  type="radio"
                  value={t.value}
                  {...register("eventType")}
                  className="sr-only"
                />
                {t.label.split(" ")[0]}
              </label>
            ))}
          </div>
          {errors.eventType && (
            <p className="text-xs text-rose-400 mt-1">{errors.eventType.message}</p>
          )}
        </div>

        {/* Date and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Target Event Date"
            type="date"
            {...register("targetDate")}
            error={errors.targetDate?.message}
          />
          <Input
            label="Guest Count"
            type="number"
            placeholder="100"
            {...register("guestCount", { valueAsNumber: true })}
            error={errors.guestCount?.message}
          />
        </div>

        {/* Location */}
        <Input
          label="Location / Venue Name"
          placeholder="e.g., Meadowood Estate, Napa Valley, CA"
          {...register("location")}
          error={errors.location?.message}
        />

        {/* Budget */}
        <Input
          label="Total Budget Cap ($)"
          type="number"
          placeholder="50000"
          {...register("totalBudget", { valueAsNumber: true })}
          error={errors.totalBudget?.message}
        />

        {/* Theme notes */}
        <Textarea
          label="Vision & Style Keywords (Optional)"
          placeholder="e.g., Candlelit Tuscan elegance, warm earthy tones, acoustic live music..."
          {...register("themeNotes")}
          error={errors.themeNotes?.message}
        />

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCreateEventModalOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="luxury" isLoading={isLoading}>
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
            Initialize Event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
