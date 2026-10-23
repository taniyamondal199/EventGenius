"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useUIStore } from "@/stores/uiStore";
import { CreateEventSchema, CreateEventInput, EVENT_TYPES, EventType } from "@/types";
import { Sparkles, HeartHandshake, Cake, Users } from "lucide-react";

interface CreateEventModalProps {
  onCreate: (data: CreateEventInput) => Promise<void>;
  isLoading?: boolean;
}

export const EVENT_PRESETS: Record<
  EventType,
  {
    title: string;
    eventType: EventType;
    guestCount: number;
    totalBudget: number;
    location: string;
    themeNotes: string;
    highlight: string;
  }
> = {
  WEDDING: {
    title: "Liam & Chloe's Coastal Vineyard Wedding",
    eventType: "WEDDING",
    guestCount: 130,
    totalBudget: 55000,
    location: "Meadowood Estate, Napa Valley, CA",
    themeNotes:
      "Multi-vendor contracts, ceremony vs. reception timeline, guest count budgeting, floral installations, and sommelier pairing.",
    highlight: "Multi-vendor contracts & ceremony/reception split",
  },
  BIRTHDAY: {
    title: "Marcus's 30th Rooftop Milestone Celebration",
    eventType: "BIRTHDAY",
    guestCount: 65,
    totalBudget: 12000,
    location: "Skyline Lounge & Terrace, Austin, TX",
    themeNotes:
      "Venue, party favors, interactive games, cake/entertainment checklist, retro DJ sets, and craft cocktail mixology.",
    highlight: "Party favors, games & cake checklist",
  },
  COMMUNITY: {
    title: "Oakridge District Summer Green Fair",
    eventType: "COMMUNITY",
    guestCount: 450,
    totalBudget: 25000,
    location: "Oakridge Community Park & Pavilion, Portland, OR",
    themeNotes:
      "City permits, volunteering checklist, public logistics, community sponsorship budgets, and local artisan food trucks.",
    highlight: "Permits, volunteers & community sponsors",
  },
};

export function CreateEventModal({ onCreate, isLoading }: CreateEventModalProps) {
  const { isCreateEventModalOpen, setCreateEventModalOpen } = useUIStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const selectedEventType = watch("eventType");

  const applyPreset = (type: EventType) => {
    const preset = EVENT_PRESETS[type];
    setValue("eventType", preset.eventType, { shouldValidate: true });
    setValue("title", preset.title, { shouldValidate: true });
    setValue("guestCount", preset.guestCount, { shouldValidate: true });
    setValue("totalBudget", preset.totalBudget, { shouldValidate: true });
    setValue("location", preset.location, { shouldValidate: true });
    setValue("themeNotes", preset.themeNotes, { shouldValidate: true });
  };

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Event Creation Form">
        {/* Presets Selector */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick-start with Tailored Domain Presets:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Domain Presets">
            <button
              type="button"
              onClick={() => applyPreset("WEDDING")}
              className={`p-2 rounded-lg text-left text-xs border transition-all ${
                selectedEventType === "WEDDING"
                  ? "bg-rose-500/10 border-rose-500/50 text-rose-300"
                  : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
              aria-label="Apply Wedding Preset"
            >
              <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                Wedding
              </div>
              <span className="text-[10px] text-slate-400 block line-clamp-1">Multi-vendor & timeline</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("BIRTHDAY")}
              className={`p-2 rounded-lg text-left text-xs border transition-all ${
                selectedEventType === "BIRTHDAY"
                  ? "bg-amber-500/10 border-amber-500/50 text-amber-300"
                  : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
              aria-label="Apply Birthday Preset"
            >
              <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                <Cake className="w-3.5 h-3.5 text-amber-400" />
                Birthday
              </div>
              <span className="text-[10px] text-slate-400 block line-clamp-1">Favors, games & cake</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("COMMUNITY")}
              className={`p-2 rounded-lg text-left text-xs border transition-all ${
                selectedEventType === "COMMUNITY"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
              aria-label="Apply Community Preset"
            >
              <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Community
              </div>
              <span className="text-[10px] text-slate-400 block line-clamp-1">Permits & logistics</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <Input
          id="event-title-input"
          label="Event Title"
          placeholder="e.g., Liam & Chloe's Coastal Wedding"
          {...register("title")}
          error={errors.title?.message}
          aria-required="true"
          aria-label="Event Title"
        />

        {/* Event Type Radio Group */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1" id="event-domain-label">
            Event Domain
          </label>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="event-domain-label">
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
                  aria-label={t.label}
                />
                {t.label.split(" ")[0]}
              </label>
            ))}
          </div>
          {errors.eventType && (
            <p className="text-xs text-rose-400 mt-1" role="alert">{errors.eventType.message}</p>
          )}
        </div>

        {/* Date and Guest Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="event-date-input"
            label="Target Event Date"
            type="date"
            {...register("targetDate")}
            error={errors.targetDate?.message}
            aria-required="true"
            aria-label="Target Event Date"
          />
          <Input
            id="guest-count-input"
            label="Guest Count"
            type="number"
            placeholder="100"
            {...register("guestCount", { valueAsNumber: true })}
            error={errors.guestCount?.message}
            aria-required="true"
            aria-label="Guest Count"
          />
        </div>

        {/* Location */}
        <Input
          id="location-input"
          label="Location / Venue Name"
          placeholder="e.g., Meadowood Estate, Napa Valley, CA"
          {...register("location")}
          error={errors.location?.message}
          aria-required="true"
          aria-label="Location"
        />

        {/* Budget */}
        <Input
          id="budget-input"
          label="Total Budget Cap ($)"
          type="number"
          placeholder="50000"
          {...register("totalBudget", { valueAsNumber: true })}
          error={errors.totalBudget?.message}
          aria-required="true"
          aria-label="Total Budget Cap"
        />

        {/* Theme notes */}
        <Textarea
          id="theme-notes-input"
          label="Vision & Style Keywords (Optional)"
          placeholder="e.g., Candlelit Tuscan elegance, warm earthy tones, acoustic live music..."
          {...register("themeNotes")}
          error={errors.themeNotes?.message}
          aria-label="Vision and Style Keywords"
        />

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCreateEventModalOpen(false)}
            disabled={isLoading}
            aria-label="Cancel event creation"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="luxury"
            isLoading={isLoading}
            aria-label="Initialize Event"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
            Initialize Event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
