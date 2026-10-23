"use client";

import React, { useState } from "react";
import { Event, TimelineItem, TimelinePhase, TIMELINE_PHASES } from "@/types";
import { useUIStore } from "@/stores/uiStore";
import { useEventStore } from "@/stores/eventStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, formatTimeOnly } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  Filter,
  CheckCheck,
} from "lucide-react";

interface InteractiveTimelineViewProps {
  event: Event;
  onToggleComplete: (itemId: string, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

export function InteractiveTimelineView({
  event,
  onToggleComplete,
  onDeleteItem,
}: InteractiveTimelineViewProps) {
  const { openTimelineModal, setAICreativeDrawerOpen } = useUIStore();
  const { timelinePhaseFilter, setTimelinePhaseFilter } = useEventStore();
  const [dayOfOnly, setDayOfOnly] = useState(false);

  const timelineItems = [...(event.timelineItems || [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const completedCount = timelineItems.filter((i) => i.isCompleted).length;
  const progressPercent =
    timelineItems.length > 0 ? Math.round((completedCount / timelineItems.length) * 100) : 0;

  // Filter logic
  const filteredItems = timelineItems.filter((item) => {
    if (dayOfOnly) return item.phase === "EVENT_DAY";
    if (timelinePhaseFilter !== "ALL") return item.phase === timelinePhaseFilter;
    return true;
  });

  const handleToggle = async (item: TimelineItem) => {
    const nextState = !item.isCompleted;
    if (nextState) {
      // Trigger celebration confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#3b82f6", "#8b5cf6", "#10b981"],
      });
    }
    await onToggleComplete(item.id, nextState);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Progress Bar & Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-purple-400" />
              <CardTitle>Master Itinerary & Day-of Schedule</CardTitle>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological milestones from pre-planning through post-event wrap-up
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAICreativeDrawerOpen(true)}
              className="text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
              AI Itinerary Suggestions
            </Button>
            <Button
              variant="luxury"
              size="sm"
              onClick={() => openTimelineModal(null)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Milestone
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Overall Completion ({completedCount}/{timelineItems.length} Milestones)
            </span>
            <span className="font-bold text-white font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" /> Phase:
            </span>
            <Button
              variant={!dayOfOnly && timelinePhaseFilter === "ALL" ? "primary" : "ghost"}
              size="sm"
              onClick={() => {
                setDayOfOnly(false);
                setTimelinePhaseFilter("ALL");
              }}
              className="text-xs h-7 px-2.5"
            >
              All Phases ({timelineItems.length})
            </Button>
            {TIMELINE_PHASES.map((p) => (
              <Button
                key={p.value}
                variant={!dayOfOnly && timelinePhaseFilter === p.value ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setDayOfOnly(false);
                  setTimelinePhaseFilter(p.value);
                }}
                className="text-xs h-7 px-2.5"
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Quick toggle for Day-of only */}
          <Button
            variant={dayOfOnly ? "luxury" : "outline"}
            size="sm"
            onClick={() => setDayOfOnly(!dayOfOnly)}
            className="text-xs h-8 gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Day-of Run of Show Only</span>
          </Button>
        </div>
      </Card>

      {/* Chronological Milestone Timeline Cards */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {filteredItems.map((item, index) => {
          const phaseConfig = TIMELINE_PHASES.find((p) => p.value === item.phase);

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Node Point */}
              <button
                onClick={() => handleToggle(item)}
                title="Toggle milestone completion"
                className={`absolute -left-6 sm:-left-8 top-4 flex items-center justify-center w-6 h-6 rounded-full transition-transform hover:scale-125 z-10 ${
                  item.isCompleted
                    ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20"
                    : "bg-slate-900 border-2 border-slate-600 text-slate-400 hover:border-brand-400"
                }`}
              >
                {item.isCompleted ? (
                  <CheckCheck className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-current opacity-40" />
                )}
              </button>

              {/* Card Container */}
              <Card
                className={`p-5 transition-all ${
                  item.isCompleted
                    ? "bg-slate-900/30 border-slate-800/50 opacity-75"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${phaseConfig?.badge}`}
                      >
                        {phaseConfig?.label}
                      </span>

                      <span className="text-xs font-mono text-indigo-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(item.startTime)} — {formatTimeOnly(item.endTime)}
                      </span>
                    </div>

                    <h4
                      className={`text-base font-bold text-white transition-all ${
                        item.isCompleted ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTimelineModal(item.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteItem(item.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center rounded-2xl glass-card border border-dashed border-slate-800">
            <CalendarClock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              No milestones in this phase view
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add custom day-of and pre-event milestones or launch the AI Creative Studio to generate your starter schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
