"use client";

import React, { useState } from "react";
import { Event, BudgetItem, BudgetCategory, BUDGET_CATEGORIES } from "@/types";
import { useUIStore } from "@/stores/uiStore";
import { useEventStore } from "@/stores/eventStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import {
  calculateBudgetTotals,
  calculateCategoryBreakdown,
  detectBudgetOverages,
} from "@/lib/budget-calculator";
import {
  Plus,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  Filter,
} from "lucide-react";

interface BudgetPlannerViewProps {
  event: Event;
  onUpdateItemStatus: (itemId: string, status: BudgetItem["status"]) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

export function BudgetPlannerView({
  event,
  onUpdateItemStatus,
  onDeleteItem,
}: BudgetPlannerViewProps) {
  const { openBudgetItemModal, setRebalanceModalOpen } = useUIStore();
  const { budgetCategoryFilter, setBudgetCategoryFilter } = useEventStore();
  const [searchTerm, setSearchTerm] = useState("");

  const budgetItems = event.budgetItems || [];
  const totalBudget = event.totalBudget || 1;

  // Use modular calculations
  const { totalEstimated, totalActual, totalPaid, remainingBudget } = calculateBudgetTotals(
    budgetItems,
    totalBudget
  );

  // Group by category for progress bars and overage calculation
  const categoryStats = calculateCategoryBreakdown(budgetItems, totalBudget, 15);

  // Filter items
  const filteredItems = budgetItems.filter((item) => {
    const matchesCategory =
      budgetCategoryFilter === "ALL" || item.category === budgetCategoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Check any item overage > 15% using modular detector
  const globalOverageItems = detectBudgetOverages(budgetItems, 15);

  return (
    <div className="space-y-6">
      {/* Overage Warning Banner if items exceed >15% */}
      {globalOverageItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Budget Warning: {globalOverageItems.length} Categories Exceed 15% Target Threshold
            </h4>
            <p className="text-xs text-amber-300/90 mt-1">
              Items such as{" "}
              <strong>{globalOverageItems.map((i) => i.name).join(", ")}</strong> are
              running significantly over estimated projections.
            </p>
          </div>
          <Button
            variant="luxury"
            size="sm"
            onClick={() => setRebalanceModalOpen(true)}
            className="shrink-0 text-xs"
          >
            <Sliders className="w-3.5 h-3.5 mr-1" />
            Optimize with AI
          </Button>
        </div>
      )}

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Cap Budget</p>
          <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(totalBudget, event.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total allocated cap</p>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Committed / Actual Spend</p>
          <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(totalActual, event.currency)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            {totalActual > totalBudget ? (
              <span className="text-rose-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Over budget
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                Within target
              </span>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Paid To Date</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
            {formatCurrency(totalPaid, event.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalActual > 0 ? Math.round((totalPaid / totalActual) * 100) : 0}% of committed
            settled
          </p>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Projected Balance</p>
          <p
            className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
              remainingBudget < 0 ? "text-rose-400" : "text-brand-400"
            }`}
          >
            {formatCurrency(remainingBudget, event.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {remainingBudget < 0 ? "Deficit requiring rebalancing" : "Available surplus"}
          </p>
        </Card>
      </div>

      {/* Category Progress Bars Grid */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <CardTitle>Category Financial Allocation</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Live consumption against projected estimates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRebalanceModalOpen(true)}
              className="text-xs"
            >
              <Sliders className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Rebalance Engine
            </Button>
            <Button
              variant="luxury"
              size="sm"
              onClick={() => openBudgetItemModal(null)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Line Item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {categoryStats.map((cat) => {
            const progressRatio =
              cat.estimated > 0 ? Math.min(150, Math.round((cat.actual / cat.estimated) * 100)) : 0;

            return (
              <div
                key={cat.value}
                role="button"
                tabIndex={0}
                aria-pressed={budgetCategoryFilter === cat.value}
                aria-label={`Filter by ${cat.label} category`}
                onClick={() =>
                  setBudgetCategoryFilter(
                    budgetCategoryFilter === cat.value ? "ALL" : cat.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setBudgetCategoryFilter(
                      budgetCategoryFilter === cat.value ? "ALL" : cat.value
                    );
                  }
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
                  budgetCategoryFilter === cat.value
                    ? "bg-slate-800/90 border-brand-500 shadow-md"
                    : "bg-slate-900/60 border-slate-800/90 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-white">
                      {cat.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({cat.items.length})
                    </span>
                  </div>

                  {cat.hasCriticalOverage && (
                    <Badge variant="destructive" size="sm" className="gap-1 animate-pulse" aria-label={`Critical overage: ${cat.overagePercentage} percent over budget`}>
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      +{cat.overagePercentage}% Over
                    </Badge>
                  )}
                </div>

                {/* Accessible Progress Bar */}
                <div
                  className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden my-2"
                  role="progressbar"
                  aria-label={`${cat.label} budget utilization`}
                  aria-valuenow={progressRatio}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.hasCriticalOverage
                        ? "bg-rose-500"
                        : cat.isOverTarget
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, progressRatio)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1">
                  <span>
                    Actual:{" "}
                    <strong className="text-white">
                      {formatCurrency(cat.actual, event.currency)}
                    </strong>
                  </span>
                  <span>Est: {formatCurrency(cat.estimated, event.currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Items Filter & Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" /> Filter Category:
            </span>
            <Button
              variant={budgetCategoryFilter === "ALL" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setBudgetCategoryFilter("ALL")}
              className="text-xs h-7 px-2.5"
            >
              All ({budgetItems.length})
            </Button>
            {BUDGET_CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={budgetCategoryFilter === cat.value ? "primary" : "ghost"}
                size="sm"
                onClick={() => setBudgetCategoryFilter(cat.value)}
                className="text-xs h-7 px-2.5"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search line items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 max-w-xs"
          />
        </div>

        {/* Table List */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-medium tracking-wider">
                <th className="py-3 px-4">Line Item / Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 font-mono text-right">Estimated</th>
                <th className="py-3 px-4 font-mono text-right">Actual</th>
                <th className="py-3 px-4 font-mono text-right">Paid</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const isOver = item.estimatedCost > 0 && item.actualCost > item.estimatedCost;
                const isCriticalOver =
                  item.estimatedCost > 0 && item.actualCost > item.estimatedCost * 1.15;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <p className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400">
                              {item.category}
                            </span>
                            {item.notes && (
                              <span className="text-[11px] text-slate-500 italic max-w-sm truncate">
                                · {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {/* Interactive status toggler */}
                      <button
                        onClick={() => {
                          const nextStatus: Record<
                            BudgetItem["status"],
                            BudgetItem["status"]
                          > = {
                            ESTIMATED: "RESERVED",
                            RESERVED: "PAID",
                            PAID: "ESTIMATED",
                          };
                          onUpdateItemStatus(item.id, nextStatus[item.status]);
                        }}
                        title="Click to toggle payment status"
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        <Badge
                          variant={
                            item.status === "PAID"
                              ? "success"
                              : item.status === "RESERVED"
                              ? "warning"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-right text-slate-300">
                      {formatCurrency(item.estimatedCost, event.currency)}
                    </td>

                    <td
                      className={`py-3.5 px-4 font-mono text-right font-bold ${
                        isCriticalOver
                          ? "text-rose-400"
                          : isOver
                          ? "text-amber-400"
                          : "text-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {isCriticalOver && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{formatCurrency(item.actualCost, event.currency)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-right text-emerald-400">
                      {formatCurrency(item.paidAmount, event.currency)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openBudgetItemModal(item.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(item.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    No budget items found matching criteria. Click &ldquo;Add Line Item&rdquo; to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
