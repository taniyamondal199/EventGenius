"use client";

import React, { useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";
import { Event } from "@/types";
import { formatDate, formatDateTime, formatTimeOnly, formatCurrency } from "@/lib/utils";
import { Printer, Download, FileDown, CheckCircle, Clock, Building2, Shield } from "lucide-react";

interface EventExportModalProps {
  event: Event;
}

export function EventExportModal({ event }: EventExportModalProps) {
  const { isExportModalOpen, setExportModalOpen, addToast } = useUIStore();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    addToast({
      type: "success",
      message: "Print Job Dispatched",
      description: "Generated clean branded PDF view for Day-of Coordinators.",
    });
  };

  const dayOfItems = (event.timelineItems || []).filter(
    (item) => item.phase === "EVENT_DAY" || item.phase === "SETUP" || item.phase === "WRAP_UP"
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const hiredVendors = (event.vendors || []).filter(
    (v) => v.status === "HIRED" || v.status === "QUOTE_RECEIVED" || v.status === "CONTACTED"
  );

  return (
    <Modal
      isOpen={isExportModalOpen}
      onClose={() => setExportModalOpen(false)}
      title="Export Day-of Coordinator Packet & Vendor Sheet"
      description="Export clean, branded PDF summaries of timelines and vendor contact sheets for day-of coordinators."
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Action bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-300">
            Formatted specifically for print and PDF export with full high-contrast tables.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="luxury" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </Button>
          </div>
        </div>

        {/* Printable Packet Container */}
        <div
          ref={printAreaRef}
          className="p-8 rounded-2xl bg-white text-slate-900 shadow-2xl space-y-8 print:p-0 print:shadow-none print:m-0"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black tracking-widest text-indigo-700 uppercase">
                  EventGenius Enterprise
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-bold text-slate-600 uppercase">
                  Day-of Run of Show & Operations Packet
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {event.title}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                {event.location} · {formatDate(event.targetDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            <div className="text-right text-xs font-mono text-slate-600 space-y-0.5">
              <p>Type: <strong>{event.eventType}</strong></p>
              <p>Guests: <strong>{event.guestCount}</strong></p>
              <p>Budget: <strong>{formatCurrency(event.totalBudget, event.currency)}</strong></p>
            </div>
          </div>

          {/* Section 1: Day-of Run of Show */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                1. Chronological Day-of Execution Schedule
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {dayOfItems.length} Key Milestones
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2 px-3 w-28">Time</th>
                  <th className="py-2 px-3 w-24">Phase</th>
                  <th className="py-2 px-3">Milestone Activity & Coordination Notes</th>
                  <th className="py-2 px-3 w-20 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dayOfItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {formatTimeOnly(item.startTime)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {item.phase}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      {item.description && (
                        <p className="text-slate-600 mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block w-4 h-4 rounded-full border ${
                          item.isCompleted
                            ? "bg-emerald-500 border-emerald-600"
                            : "border-slate-400"
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Vendor Contact Sheet */}
          <div className="space-y-4 pt-4 border-t-2 border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                2. Master On-Site Vendor Contact Directory
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {hiredVendors.length} Verified Partners
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2 px-3 w-32">Service Category</th>
                  <th className="py-2 px-3">Vendor / Business</th>
                  <th className="py-2 px-3">Contact Phone</th>
                  <th className="py-2 px-3">Contact Email</th>
                  <th className="py-2 px-3 w-28 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hiredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {vendor.category}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {vendor.vendorName}
                      {vendor.notes && (
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {vendor.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {vendor.contactPhone || "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 truncate max-w-xs">
                      {vendor.contactEmail || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                        {vendor.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-8 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <p>Generated by EventGenius Enterprise Platform</p>
              <p>Confidential & Proprietary to Event Planning Team</p>
            </div>
            <div className="text-right">
              <p>Lead Coordinator Sign-Off: ____________________</p>
              <p className="mt-1">Date: ____________________</p>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={() => setExportModalOpen(false)}>
            Close
          </Button>
          <Button variant="luxury" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            <span>Print or Export PDF</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
