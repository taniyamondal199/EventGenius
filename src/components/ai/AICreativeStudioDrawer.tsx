"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";
import {
  Event,
  AIPlanOutput,
  BudgetItemInput,
  TimelineItemInput,
  VendorChecklistInput,
  IdeaCategory,
} from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Sparkles,
  X,
  Wallet,
  CalendarCheck,
  Building2,
  Lightbulb,
  Plus,
  Star,
  Check,
  Loader2,
  Sliders,
  Send,
} from "lucide-react";

interface AICreativeStudioDrawerProps {
  event: Event;
  onAddBudgetItem: (data: BudgetItemInput) => Promise<void>;
  onAddTimelineItem: (data: TimelineItemInput) => Promise<void>;
  onAddVendorItem: (data: VendorChecklistInput) => Promise<void>;
  onAddAIIdea: (category: IdeaCategory, content: string) => Promise<void>;
  onToggleIdeaFavorite: (ideaId: string) => Promise<void>;
}

export function AICreativeStudioDrawer({
  event,
  onAddBudgetItem,
  onAddTimelineItem,
  onAddVendorItem,
  onAddAIIdea,
  onToggleIdeaFavorite,
}: AICreativeStudioDrawerProps) {
  const { isAICreativeDrawerOpen, setAICreativeDrawerOpen, addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<"blueprint" | "ideas">("blueprint");

  // Blueprint generation form state
  const [eventType, setEventType] = useState(event.eventType);
  const [budget, setBudget] = useState(event.totalBudget);
  const [guestCount, setGuestCount] = useState(event.guestCount);
  const [location, setLocation] = useState(event.location);
  const [styleKeywords, setStyleKeywords] = useState(
    event.themeNotes || "Modern luxury, warm romantic lighting, organic botanical elements"
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<AIPlanOutput | null>(null);

  // Added tracker sets for immediate visual feedback
  const [addedBudgetIndices, setAddedBudgetIndices] = useState<Set<number>>(new Set());
  const [addedTimelineIndices, setAddedTimelineIndices] = useState<Set<number>>(new Set());
  const [addedVendorIndices, setAddedVendorIndices] = useState<Set<number>>(new Set());
  const [addedIdeaIndices, setAddedIdeaIndices] = useState<Set<number>>(new Set());

  // Custom idea input
  const [customIdeaCategory, setCustomIdeaCategory] = useState<IdeaCategory>("THEME");
  const [customIdeaText, setCustomIdeaText] = useState("");

  const handleGenerateBlueprint = async () => {
    setIsGenerating(true);
    setAddedBudgetIndices(new Set());
    setAddedTimelineIndices(new Set());
    setAddedVendorIndices(new Set());
    setAddedIdeaIndices(new Set());

    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          date: event.targetDate,
          budget,
          guestCount,
          location,
          styleKeywords,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedBlueprint(data.data);
      addToast({
        type: "success",
        message: "AI Blueprint Generated",
        description: "Your master event blueprint is ready to review and import.",
      });

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error: any) {
      addToast({
        type: "error",
        message: "AI Blueprint Failed",
        description: error.message || "Failed to contact AI engine",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOneClickAddBudget = async (item: AIPlanOutput["budgetBreakdown"][0], index: number) => {
    try {
      await onAddBudgetItem({
        category: item.category,
        name: item.suggestedName,
        estimatedCost: item.estimatedCostMin,
        actualCost: 0,
        paidAmount: 0,
        status: "ESTIMATED",
        notes: item.rationale,
      });
      setAddedBudgetIndices((prev) => new Set(prev).add(index));
      addToast({
        type: "success",
        message: "Added to Budget",
        description: `${item.suggestedName} successfully added to budget.`,
      });
    } catch (err: any) {
      addToast({ type: "error", message: "Failed to add", description: err.message });
    }
  };

  const handleOneClickAddTimeline = async (
    item: AIPlanOutput["timelineMilestones"][0],
    index: number
  ) => {
    try {
      const eventDateObj = new Date(event.targetDate);
      const targetTime = new Date(
        eventDateObj.getTime() + item.offsetDaysFromEvent * 86400000
      );

      await onAddTimelineItem({
        title: item.title,
        description: item.description,
        startTime: targetTime.toISOString(),
        endTime: new Date(targetTime.getTime() + 3600000).toISOString(),
        phase: item.phase,
        isCompleted: false,
      });

      setAddedTimelineIndices((prev) => new Set(prev).add(index));
      addToast({
        type: "success",
        message: "Added to Timeline",
        description: `${item.title} scheduled in ${item.phase}.`,
      });
    } catch (err: any) {
      addToast({ type: "error", message: "Failed to add", description: err.message });
    }
  };

  const handleOneClickAddVendor = async (
    item: AIPlanOutput["vendorChecklist"][0],
    index: number
  ) => {
    try {
      await onAddVendorItem({
        category: item.category,
        vendorName: item.vendorRole,
        notes: `Procure ${item.procurementTimeline}. Priority: ${item.priority}. Key question: ${item.keyQuestionToAsk}`,
        status: "RESEARCHING",
      });

      setAddedVendorIndices((prev) => new Set(prev).add(index));
      addToast({
        type: "success",
        message: "Added to Checklist",
        description: `${item.vendorRole} added to vendor research board.`,
      });
    } catch (err: any) {
      addToast({ type: "error", message: "Failed to add", description: err.message });
    }
  };

  const handleOneClickSaveIdea = async (
    item: AIPlanOutput["creativeIdeas"][0],
    index: number
  ) => {
    try {
      await onAddAIIdea(item.category, `${item.title}: ${item.description}`);
      setAddedIdeaIndices((prev) => new Set(prev).add(index));
      addToast({
        type: "success",
        message: "Saved to Ideas",
        description: `${item.title} added to your creative log.`,
      });
    } catch (err: any) {
      addToast({ type: "error", message: "Failed to save idea", description: err.message });
    }
  };

  const handleCreateCustomIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdeaText.trim()) return;

    try {
      await onAddAIIdea(customIdeaCategory, customIdeaText.trim());
      setCustomIdeaText("");
      addToast({
        type: "success",
        message: "Idea Logged",
        description: "Your creative note was saved to this event.",
      });
    } catch (err: any) {
      addToast({ type: "error", message: "Failed to log idea", description: err.message });
    }
  };

  return (
    <AnimatePresence>
      {isAICreativeDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAICreativeDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-full max-w-2xl bg-slate-900/95 border-l border-slate-700/80 shadow-2xl flex flex-col z-10 glass-panel"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    EventGenius AI Creative Studio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generative Event Architect & Creative Brainstorming
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAICreativeDrawerOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center px-6 pt-3 border-b border-slate-800 gap-4 shrink-0 bg-slate-950/20">
              <button
                onClick={() => setActiveTab("blueprint")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === "blueprint"
                    ? "border-brand-500 text-brand-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Event Architect Blueprint
              </button>
              <button
                onClick={() => setActiveTab("ideas")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === "ideas"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Creative Idea Vault ({event.aiIdeas?.length || 0})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === "blueprint" ? (
                <div className="space-y-6">
                  {/* Parameter Config Form */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Configure Blueprint Generation
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Event Type
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value as any)}
                          className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          <option value="WEDDING">Wedding Celebration</option>
                          <option value="BIRTHDAY">Birthday Milestone</option>
                          <option value="COMMUNITY">Community Gathering</option>
                        </select>
                      </div>

                      <Input
                        label="Guest Count"
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Total Budget ($)"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="h-9 text-xs"
                      />
                      <Input
                        label="Venue / Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>

                    <Textarea
                      label="Style / Vibe Keywords & Theme Concept"
                      value={styleKeywords}
                      onChange={(e) => setStyleKeywords(e.target.value)}
                      className="min-h-[60px] text-xs"
                      placeholder="e.g., Rustic Tuscan romance, organic florals, warm ambient candle glow..."
                    />

                    <Button
                      variant="luxury"
                      onClick={handleGenerateBlueprint}
                      isLoading={isGenerating}
                      className="w-full h-10 text-xs font-bold"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
                      {isGenerating ? "Synthesizing Blueprint..." : "Generate Master Blueprint"}
                    </Button>
                  </div>

                  {/* Generated Results View */}
                  {generatedBlueprint && (
                    <div className="space-y-6 pt-2 animate-in fade-in duration-500">
                      {/* Summary Quote */}
                      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200">
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                          Architect Summary
                        </p>
                        <p className="text-sm italic leading-relaxed text-slate-200">
                          &ldquo;{generatedBlueprint.blueprintSummary}&rdquo;
                        </p>
                      </div>

                      {/* Section 1: Suggested Budget Breakdown */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-brand-400" />
                            Suggested Budget Breakdown
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            {generatedBlueprint.budgetBreakdown.length} Categories
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {generatedBlueprint.budgetBreakdown.map((item, idx) => {
                            const isAdded = addedBudgetIndices.has(idx);
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors gap-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" size="sm" className="text-[10px]">
                                      {item.category}
                                    </Badge>
                                    <p className="text-xs font-bold text-white truncate">
                                      {item.suggestedName}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                                    {item.rationale}
                                  </p>
                                  <p className="text-[11px] text-brand-300 font-mono mt-0.5">
                                    Est: {formatCurrency(item.estimatedCostMin, event.currency)} -{" "}
                                    {formatCurrency(item.estimatedCostMax, event.currency)} ({item.recommendedPercentage}%)
                                  </p>
                                </div>

                                <Button
                                  variant={isAdded ? "secondary" : "luxury"}
                                  size="sm"
                                  onClick={() => handleOneClickAddBudget(item, idx)}
                                  disabled={isAdded}
                                  className="shrink-0 text-xs h-8"
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                                      Added
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5 mr-1" />
                                      Add to Budget
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 2: Timeline Milestones */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <CalendarCheck className="w-3.5 h-3.5 text-purple-400" />
                            Timeline Milestones
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            {generatedBlueprint.timelineMilestones.length} Milestones
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {generatedBlueprint.timelineMilestones.map((item, idx) => {
                            const isAdded = addedTimelineIndices.has(idx);
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors gap-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="purple" size="sm" className="text-[10px]">
                                      {item.phase}
                                    </Badge>
                                    <p className="text-xs font-bold text-white truncate">
                                      {item.title}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                                    {item.description}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    Timing: {item.offsetDaysFromEvent === 0 ? "Day-of execution" : `${Math.abs(item.offsetDaysFromEvent)} days ${item.offsetDaysFromEvent < 0 ? "prior" : "after"}`} {item.timeOfDay && `· ${item.timeOfDay}`}
                                  </p>
                                </div>

                                <Button
                                  variant={isAdded ? "secondary" : "luxury"}
                                  size="sm"
                                  onClick={() => handleOneClickAddTimeline(item, idx)}
                                  disabled={isAdded}
                                  className="shrink-0 text-xs h-8"
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                                      Scheduled
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5 mr-1" />
                                      Add to Timeline
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 3: Vendor Checklist */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            Curated Vendor Checklist
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            {generatedBlueprint.vendorChecklist.length} Recommended
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {generatedBlueprint.vendorChecklist.map((item, idx) => {
                            const isAdded = addedVendorIndices.has(idx);
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors gap-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="cyan" size="sm" className="text-[10px]">
                                      {item.category}
                                    </Badge>
                                    <p className="text-xs font-bold text-white truncate">
                                      {item.vendorRole}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                                    Key inquiry: {item.keyQuestionToAsk}
                                  </p>
                                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                    Timeline: {item.procurementTimeline} · Budget: {formatCurrency(item.estimatedBudgetAllocation, event.currency)}
                                  </p>
                                </div>

                                <Button
                                  variant={isAdded ? "secondary" : "luxury"}
                                  size="sm"
                                  onClick={() => handleOneClickAddVendor(item, idx)}
                                  disabled={isAdded}
                                  className="shrink-0 text-xs h-8"
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                                      Added
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5 mr-1" />
                                      Add to Checklist
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 4: 5 Personalized Creative Ideas */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            5 Personalized Creative Ideas
                          </h5>
                          <span className="text-[11px] text-slate-500">Bespoke Experiences</span>
                        </div>

                        <div className="space-y-3">
                          {generatedBlueprint.creativeIdeas.map((item, idx) => {
                            const isAdded = addedIdeaIndices.has(idx);
                            return (
                              <div
                                key={idx}
                                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 transition-colors space-y-2"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="warning" size="sm" className="text-[10px]">
                                        {item.category}
                                      </Badge>
                                      <h6 className="text-xs font-bold text-white">
                                        {item.title}
                                      </h6>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>

                                  <Button
                                    variant={isAdded ? "secondary" : "luxury"}
                                    size="sm"
                                    onClick={() => handleOneClickSaveIdea(item, idx)}
                                    disabled={isAdded}
                                    className="shrink-0 text-xs h-7"
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400 mr-1" />
                                        Saved
                                      </>
                                    ) : (
                                      <>
                                        <Star className="w-3 h-3 mr-1 text-amber-300" />
                                        Save
                                      </>
                                    )}
                                  </Button>
                                </div>

                                <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 font-mono">
                                  <span>
                                    Cost Impact:{" "}
                                    <strong className="text-slate-200">
                                      {item.budgetImpact}
                                    </strong>
                                  </span>
                                  <span>
                                    Delight Score:{" "}
                                    <strong className="text-amber-300">
                                      {item.guestDelightScore}/10 ⭐
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab 2: Creative Idea Vault */
                <div className="space-y-6">
                  {/* Create Custom Idea Form */}
                  <form
                    onSubmit={handleCreateCustomIdea}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Record New Creative Spark
                      </span>
                      <select
                        value={customIdeaCategory}
                        onChange={(e) => setCustomIdeaCategory(e.target.value as IdeaCategory)}
                        className="h-7 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs text-slate-200"
                      >
                        <option value="THEME">THEME</option>
                        <option value="ACTIVITY">ACTIVITY</option>
                        <option value="MENU">MENU</option>
                        <option value="DECOR">DECOR</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g., Midnight Churros & Spiced Hot Chocolate Station..."
                        value={customIdeaText}
                        onChange={(e) => setCustomIdeaText(e.target.value)}
                        className="flex-1 h-9 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <Button type="submit" variant="luxury" size="sm" className="h-9 px-3">
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </form>

                  {/* List of saved event ideas */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Saved Event Ideas ({event.aiIdeas?.length || 0})
                    </h5>

                    {event.aiIdeas?.map((idea) => (
                      <div
                        key={idea.id}
                        className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <Badge variant="purple" size="sm" className="text-[10px]">
                            {idea.category}
                          </Badge>
                          <p className="text-xs text-slate-200 leading-relaxed pt-1">
                            {idea.content}
                          </p>
                        </div>

                        <button
                          onClick={() => onToggleIdeaFavorite(idea.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 transition-colors"
                          title="Favorite this concept"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              idea.isFavorite
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-500"
                            }`}
                          />
                        </button>
                      </div>
                    ))}

                    {(!event.aiIdeas || event.aiIdeas.length === 0) && (
                      <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                        No ideas saved in your vault yet. Generate a blueprint to save ideas!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
