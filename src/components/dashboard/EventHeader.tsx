"use client";

import React from "react";
import { Event } from "@/types";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Sliders,
  Share2,
  FileDown,
  ShieldCheck,
  HeartHandshake,
  Cake,
  Users2,
} from "lucide-react";

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  const {
    setAICreativeDrawerOpen,
    setRebalanceModalOpen,
    setCollaboratorModalOpen,
    setExportModalOpen,
  } = useUIStore();

  const eventTypeIcons = {
    WEDDING: <HeartHandshake className="w-4 h-4 text-pink-400" />,
    BIRTHDAY: <Cake className="w-4 h-4 text-amber-400" />,
    COMMUNITY: <Users2 className="w-4 h-4 text-cyan-400" />,
  };

  const roleBadgeVariants: Record<string, "success" | "indigo" | "secondary"> = {
    OWNER: "success",
    COLLABORATOR: "indigo",
    VIEWER: "secondary",
  };

  return (
    <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Event Details */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="purple" className="flex items-center gap-1.5 py-1 px-3">
              {eventTypeIcons[event.eventType]}
              <span className="font-semibold">{event.eventType}</span>
            </Badge>

            <Badge
              variant={roleBadgeVariants[event.userRole || "VIEWER"]}
              className="flex items-center gap-1 py-1 px-2.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role: {event.userRole || "VIEWER"}</span>
            </Badge>

            <span className="text-xs text-slate-400">
              Budget:{" "}
              <strong className="text-emerald-400 font-mono">
                {formatCurrency(event.totalBudget, event.currency)}
              </strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
              <span>{formatDate(event.targetDate, "EEEE, MMMM d, yyyy")}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate max-w-[260px]">{event.location}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{event.guestCount} Confirmed Guests</span>
            </div>
          </div>

          {event.themeNotes && (
            <p className="text-xs text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-800/80">
              &ldquo;{event.themeNotes}&rdquo;
            </p>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="luxury"
            onClick={() => setAICreativeDrawerOpen(true)}
            className="group relative overflow-hidden"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow group-hover:rotate-12 transition-transform" />
            <span>AI Creative Studio</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => setRebalanceModalOpen(true)}
            className="gap-2"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>AI Rebalance</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setCollaboratorModalOpen(true)}
            className="gap-2"
          >
            <Share2 className="w-4 h-4 text-slate-300" />
            <span>Team ({event.collaborators?.length || 1})</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setExportModalOpen(true)}
            className="gap-2 hover:border-brand-500/50"
          >
            <FileDown className="w-4 h-4 text-brand-400" />
            <span>Export & PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
