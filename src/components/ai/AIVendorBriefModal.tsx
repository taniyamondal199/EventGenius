"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";
import { Event, AIVendorBriefOutput } from "@/types";
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from "lucide-react";

interface AIVendorBriefModalProps {
  event: Event;
}

export function AIVendorBriefModal({ event }: AIVendorBriefModalProps) {
  const {
    isVendorBriefModalOpen,
    closeVendorBriefModal,
    vendorBriefInitialCategory,
    addToast,
  } = useUIStore();

  const [category, setCategory] = useState(vendorBriefInitialCategory || "Catering");
  const [style, setStyle] = useState(
    event.themeNotes || "Organic modern elegance, botanical greenery, ambient candlelight"
  );
  const [budgetLimit, setBudgetLimit] = useState(
    Math.round((event.totalBudget || 50000) * 0.25)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [briefOutput, setBriefOutput] = useState<AIVendorBriefOutput | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (vendorBriefInitialCategory) {
      setCategory(vendorBriefInitialCategory);
    }
  }, [vendorBriefInitialCategory]);

  const handleGenerateBrief = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/vendor-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          style,
          budgetLimit,
          guestCount: event.guestCount,
          eventDate: event.targetDate,
          location: event.location,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate vendor brief");

      setBriefOutput(data.data);
      addToast({
        type: "success",
        message: "Vendor RFP & Scope Generated",
        description: `Professional RFP message ready for ${category}.`,
      });
    } catch (err: any) {
      addToast({
        type: "error",
        message: "Generation Failed",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRfp = () => {
    if (!briefOutput) return;
    navigator.clipboard.writeText(briefOutput.readyToSendRfpMessage);
    setHasCopied(true);
    addToast({
      type: "success",
      message: "Copied to Clipboard",
      description: "RFP message copied and ready to send via email.",
    });
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isVendorBriefModalOpen}
      onClose={closeVendorBriefModal}
      title="AI Vendor Scope & RFP Generator"
      description={`Curate tailored proposals and vetting parameters for ${event.title}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Input Parameters Box */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Vendor Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Floral & Stage Decor"
            />
            <Input
              label="Target Budget Allocation ($)"
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
            />
          </div>

          <Textarea
            label="Aesthetic Style & Expectations"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="e.g., Tuscan olive branches, gold candleholders, warm romantic lighting"
            className="min-h-[50px] text-xs"
          />

          <Button
            variant="luxury"
            onClick={handleGenerateBrief}
            isLoading={isLoading}
            className="w-full text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            {isLoading ? "Generating RFP & Scope..." : "Generate Vendor Brief & RFP"}
          </Button>
        </div>

        {/* Results */}
        {briefOutput && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Ready to send message */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-400" />
                  Ready-to-Send RFP Email Draft
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRfp}
                  className="text-xs h-7 gap-1"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy RFP
                    </>
                  )}
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 text-xs font-mono text-slate-200 whitespace-pre-line border border-slate-800/80 leading-relaxed max-h-48 overflow-y-auto">
                {briefOutput.readyToSendRfpMessage}
              </div>
            </div>

            {/* Questions to Ask & Red Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Questions */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Essential Questions to Ask
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {briefOutput.essentialQuestionsToAsk.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold shrink-0">·</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags */}
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Red Flags to Watch Out For
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {briefOutput.redFlagsToWatchOutFor.map((rf, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold shrink-0">⚠</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Negotiation Tips */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Contract Negotiation Tips
              </h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {briefOutput.contractNegotiationTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={closeVendorBriefModal}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
