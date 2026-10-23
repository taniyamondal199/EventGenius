"use client";

import React from "react";
import { Event, BUDGET_CATEGORIES } from "@/types";
import { RadialProgress } from "@/components/ui/RadialProgress";
import { CountdownClock } from "./CountdownClock";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Wallet,
  CalendarCheck,
  Building2,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface OverviewHubProps {
  event: Event;
}

export function OverviewHub({ event }: OverviewHubProps) {
  const { setActiveTab, setAICreativeDrawerOpen } = useUIStore();

  const budgetItems = event.budgetItems || [];
  const timelineItems = event.timelineItems || [];
  const vendors = event.vendors || [];
  const aiIdeas = event.aiIdeas || [];

  // Calculations
  const totalBudget = event.totalBudget || 1;
  const totalSpent = budgetItems.reduce((acc, it) => acc + (it.actualCost || 0), 0);
  const totalEstimated = budgetItems.reduce((acc, it) => acc + (it.estimatedCost || 0), 0);
  const totalPaid = budgetItems.reduce((acc, it) => acc + (it.paidAmount || 0), 0);

  const budgetConsumptionPercent = Math.round((totalSpent / totalBudget) * 100);
  const remainingBudget = totalBudget - totalSpent;

  const totalTimelineCount = timelineItems.length;
  const completedTimelineCount = timelineItems.filter((t) => t.isCompleted).length;
  const timelineProgressPercent =
    totalTimelineCount > 0 ? Math.round((completedTimelineCount / totalTimelineCount) * 100) : 0;

  const hiredVendorsCount = vendors.filter((v) => v.status === "HIRED").length;

  // Category breakdown for miniature preview
  const categorySpendMap: Record<string, number> = {};
  budgetItems.forEach((it) => {
    categorySpendMap[it.category] = (categorySpendMap[it.category] || 0) + (it.actualCost || it.estimatedCost || 0);
  });

  return (
    <div className="space-y-6">
      {/* Top Hero Grid: 3 Interactive Radials / Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Widget 1: Budget Consumption Radial */}
        <Card className="flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-900/90 to-slate-900/40 border-indigo-500/20">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Budget Consumption
            </span>
            <Badge
              variant={
                budgetConsumptionPercent > 100
                  ? "destructive"
                  : budgetConsumptionPercent > 85
                  ? "warning"
                  : "success"
              }
            >
              {budgetConsumptionPercent > 100 ? "Over Budget" : "On Track"}
            </Badge>
          </div>

          <RadialProgress
            value={budgetConsumptionPercent}
            size={150}
            strokeWidth={12}
            gradientId="budgetGrad"
            gradientFrom={
              budgetConsumptionPercent > 100
                ? "#f43f5e"
                : budgetConsumptionPercent > 85
                ? "#f59e0b"
                : "#10b981"
            }
            gradientTo={
              budgetConsumptionPercent > 100
                ? "#be123c"
                : budgetConsumptionPercent > 85
                ? "#d97706"
                : "#059669"
            }
            label="SPENT"
            sublabel={formatCurrency(totalSpent, event.currency)}
          />

          <div className="flex items-center justify-between w-full pt-4 border-t border-slate-800 text-xs">
            <div>
              <p className="text-slate-400">Remaining</p>
              <p
                className={`font-mono font-bold ${
                  remainingBudget < 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {formatCurrency(remainingBudget, event.currency)}
              </p>
            </div>
            <button
              onClick={() => setActiveTab("budget")}
              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* Widget 2: Timeline Completion Radial */}
        <Card className="flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-900/90 to-slate-900/40 border-purple-500/20">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Timeline Execution
            </span>
            <Badge variant="purple">
              {completedTimelineCount} / {totalTimelineCount} Done
            </Badge>
          </div>

          <RadialProgress
            value={timelineProgressPercent}
            size={150}
            strokeWidth={12}
            gradientId="timelineGrad"
            gradientFrom="#a855f7"
            gradientTo="#3b82f6"
            label="COMPLETED"
            sublabel={`${completedTimelineCount} items`}
          />

          <div className="flex items-center justify-between w-full pt-4 border-t border-slate-800 text-xs">
            <div>
              <p className="text-slate-400">Pending Actions</p>
              <p className="font-mono font-bold text-slate-200">
                {totalTimelineCount - completedTimelineCount} Milestones
              </p>
            </div>
            <button
              onClick={() => setActiveTab("timeline")}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Itinerary <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* Widget 3: Live Countdown Flip Clock */}
        <CountdownClock targetDate={event.targetDate} />
      </div>

      {/* Metric Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Estimated Budget</p>
              <p className="text-lg font-bold text-white font-mono">
                {formatCurrency(totalEstimated, event.currency)}
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Paid deposits: <span className="text-emerald-400 font-mono">{formatCurrency(totalPaid, event.currency)}</span>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Milestones</p>
              <p className="text-lg font-bold text-white font-mono">
                {totalTimelineCount} Total
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="text-purple-400 font-bold">{completedTimelineCount}</span> marked completed
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Vendors Tracked</p>
              <p className="text-lg font-bold text-white font-mono">
                {vendors.length} Partners
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-bold">{hiredVendorsCount}</span> hired and contracted
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">AI Creative Log</p>
              <p className="text-lg font-bold text-white font-mono">
                {aiIdeas.length} Concepts
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="text-amber-400 font-bold">{aiIdeas.filter((i) => i.isFavorite).length}</span> favorited by team
          </div>
        </Card>
      </div>

      {/* Secondary Dual Column: Upcoming Timeline & Category Budget Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Timeline Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <CardTitle>Upcoming Itinerary Milestones</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("timeline")}
              className="text-xs"
            >
              View Full Timeline
            </Button>
          </div>

          <div className="space-y-3 mt-4">
            {timelineItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="mt-0.5">
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </p>
                    <Badge variant="outline" size="sm">
                      {item.phase}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {item.description || "No notes"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatDateTime(item.startTime)}
                  </p>
                </div>
              </div>
            ))}

            {timelineItems.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No timeline milestones added yet. Launch the AI Creative Studio to generate your starter itinerary!
              </div>
            )}
          </div>
        </Card>

        {/* Right: Budget Category Allocation Bar */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <CardTitle>Budget Category Allocation</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("budget")}
              className="text-xs"
            >
              Open Budget Planner
            </Button>
          </div>

          <div className="space-y-4 mt-4">
            {BUDGET_CATEGORIES.map((cat) => {
              const spent = categorySpendMap[cat.value] || 0;
              const percent = totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;

              return (
                <div key={cat.value} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-slate-300">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">
                        {formatCurrency(spent, event.currency)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({percent}%)
                      </span>
                    </div>
                  </div>

                  <div
                    className="w-full h-2 rounded-full bg-slate-800 overflow-hidden"
                    role="progressbar"
                    aria-label={`${cat.label} budget allocation`}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
