"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useUIStore } from "@/stores/uiStore";
import { TimelineItemSchema, TimelineItemInput, TIMELINE_PHASES, Event } from "@/types";

interface TimelineItemModalProps {
  event: Event;
  onSave: (data: TimelineItemInput, itemId?: string) => Promise<void>;
  isLoading?: boolean;
}

export function TimelineItemModal({ event, onSave, isLoading }: TimelineItemModalProps) {
  const { isTimelineModalOpen, closeTimelineModal, editingTimelineItemId } = useUIStore();

  const editingItem = event.timelineItems?.find((it) => it.id === editingTimelineItemId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimelineItemInput>({
    resolver: zodResolver(TimelineItemSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      phase: "PLANNING",
      isCompleted: false,
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        title: editingItem.title,
        description: editingItem.description || "",
        startTime: editingItem.startTime.slice(0, 16),
        endTime: editingItem.endTime.slice(0, 16),
        phase: editingItem.phase,
        isCompleted: editingItem.isCompleted,
      });
    } else {
      const defaultStart = new Date(event.targetDate).toISOString().slice(0, 16);
      const defaultEnd = new Date(new Date(event.targetDate).getTime() + 7200000)
        .toISOString()
        .slice(0, 16);
      reset({
        title: "",
        description: "",
        startTime: defaultStart,
        endTime: defaultEnd,
        phase: "EVENT_DAY",
        isCompleted: false,
      });
    }
  }, [editingItem, reset, isTimelineModalOpen, event.targetDate]);

  const onSubmit = async (data: TimelineItemInput) => {
    await onSave(data, editingTimelineItemId || undefined);
    closeTimelineModal();
  };

  return (
    <Modal
      isOpen={isTimelineModalOpen}
      onClose={closeTimelineModal}
      title={editingItem ? "Edit Timeline Milestone" : "Schedule Timeline Milestone"}
      description={`Itinerary schedule for ${event.title}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Milestone Title */}
        <Input
          label="Milestone Title"
          placeholder="e.g., Cocktail Hour & Grand Reception Entrance"
          {...register("title")}
          error={errors.title?.message}
        />

        {/* Phase Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Execution Phase
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TIMELINE_PHASES.map((p) => (
              <label
                key={p.value}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-semibold cursor-pointer hover:border-brand-500 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10 has-[:checked]:text-brand-400"
              >
                <input
                  type="radio"
                  value={p.value}
                  {...register("phase")}
                  className="sr-only"
                />
                {p.label}
              </label>
            ))}
          </div>
          {errors.phase && (
            <p className="text-xs text-rose-400 mt-1">{errors.phase.message}</p>
          )}
        </div>

        {/* Start and End Datetime */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Time"
            type="datetime-local"
            {...register("startTime")}
            error={errors.startTime?.message}
          />
          <Input
            label="End Time"
            type="datetime-local"
            {...register("endTime")}
            error={errors.endTime?.message}
          />
        </div>

        {/* Description / Logistics */}
        <Textarea
          label="Operational Details & Instructions"
          placeholder="Contact leads, location, AV requirements, cues..."
          {...register("description")}
          error={errors.description?.message}
        />

        {/* Completed Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isCompleted"
            {...register("isCompleted")}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="isCompleted" className="text-xs text-slate-300 cursor-pointer">
            Mark this milestone as completed
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={closeTimelineModal}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="luxury" isLoading={isLoading}>
            {editingItem ? "Save Changes" : "Schedule Milestone"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
