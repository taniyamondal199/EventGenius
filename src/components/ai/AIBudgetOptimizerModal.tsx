"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";
import { Event, AIRebalanceOutput } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Sliders,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface AIBudgetOptimizerModalProps {
  event: Event;
}

export function AIBudgetOptimizerModal({ event }: AIBudgetOptimizerModalProps) {
  const { isRebalanceModalOpen, setRebalanceModalOpen, addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIRebalanceOutput | null>(null);

  const runOptimizer = async () => {
    setIsLoading(true);
    try {
      const itemsPayload = (event.budgetItems || []).map((it) => ({
        id: it.id,
        category: it.category,
        name: it.name,
        estimatedCost: it.estimatedCost,
        actualCost: it.actualCost,
        paidAmount: it.paidAmount,
      }));

      const res = await fetch("/api/ai/rebalance-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          totalBudget: event.totalBudget,
          currency: event.currency,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");

      setAnalysis(data.data);
      addToast({
        type: "success",
        message: "Budget Analysis Complete",
        description: "AI Budget Optimizer evaluated financial health and cost trade-offs.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Budget analysis failed";
      addToast({
        type: "error",
        message: "Optimization Failed",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isRebalanceModalOpen && !analysis) {
      runOptimizer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRebalanceModalOpen]);

  return (
    <Modal
      isOpen={isRebalanceModalOpen}
      onClose={() => setRebalanceModalOpen(false)}
      title="AI Budget Optimizer & Trade-Off Engine"
      description={`Financial health analysis for ${event.title}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-white">
              Evaluating line item variances and analyzing trade-offs...
            </p>
            <p className="text-xs text-slate-400">
              Applying heuristic and machine learning budget optimization models
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Health Score Metric Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/30 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Financial Health Assessment
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-black text-white font-mono">
                    {analysis.healthScore}/100
                  </span>
                  <Badge
                    variant={
                      analysis.healthStatus === "CRITICAL_DEFICIT"
                        ? "destructive"
                        : analysis.healthStatus === "WARNING"
                        ? "warning"
                        : "success"
                    }
                  >
                    {analysis.healthStatus.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1 font-mono sm:text-right">
                <p>
                  Committed:{" "}
                  <strong className="text-white">
                    {formatCurrency(analysis.totalActual, event.currency)}
                  </strong>
                </p>
                <p>
                  Variance:{" "}
                  <strong
                    className={
                      analysis.projectedVariance < 0 ? "text-rose-400" : "text-emerald-400"
                    }
                  >
                    {formatCurrency(analysis.projectedVariance, event.currency)}
                  </strong>
                </p>
              </div>
            </div>

            {/* Overages Warning Flag (>15%) */}
            {analysis.overageWarnings.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Category Overages Exceeding 15% Threshold ({analysis.overageWarnings.length})
                </h4>
                <div className="space-y-2">
                  {analysis.overageWarnings.map((warn, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-200"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" size="sm">
                            {warn.category}
                          </Badge>
                          <span className="font-bold text-white">{warn.name}</span>
                        </div>
                        <p className="text-[11px] text-rose-300 mt-1">
                          Exceeds budget baseline by +{warn.percentageOverBudget}%
                        </p>
                      </div>
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        +{formatCurrency(warn.excessAmount, event.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rebalancing Recommendations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-brand-400" />
                Strategic Reallocation Recommendations
              </h4>
              <div className="space-y-2.5">
                {analysis.rebalancingRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold text-white leading-snug">
                        {rec.action}
                      </p>
                      <Badge variant="success" size="sm" className="shrink-0 font-mono">
                        Save ~{formatCurrency(rec.estimatedSavings, event.currency)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Source: {rec.sourceCategory}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span>Reallocate To: {rec.targetCategory}</span>
                    </div>
                    <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800/80">
                      Rationale: {rec.tradeOffRationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Cutting Tactics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                Practical Cost-Cutting Tactics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.costCuttingOpportunities.map((opp, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-300">
                        {opp.area}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ~{formatCurrency(opp.potentialSavingsAmount, event.currency)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {opp.practicalTactic}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            No optimization results available. Click below to evaluate budget health.
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={runOptimizer}
            disabled={isLoading}
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-400" />
            Re-run Analysis
          </Button>
          <Button
            variant="luxury"
            size="sm"
            onClick={() => setRebalanceModalOpen(false)}
            className="text-xs"
          >
            Close Optimizer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
