"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUIStore, ActiveTab } from "@/stores/uiStore";
import { useEventStore } from "@/stores/eventStore";
import { Event } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  Calendar,
  Wallet,
  Clock,
  Building2,
  Plus,
  ChevronDown,
  LayoutDashboard,
  Check,
  User as UserIcon,
} from "lucide-react";

interface NavbarProps {
  events: Event[];
  currentEvent: Event | null;
  onSelectEvent: (eventId: string) => void;
  currentUser?: { name: string; email: string };
}

export function Navbar({
  events,
  currentEvent,
  onSelectEvent,
  currentUser,
}: NavbarProps) {
  const { activeTab, setActiveTab, setCreateEventModalOpen, setAICreativeDrawerOpen } =
    useUIStore();
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "budget",
      label: "Budget Planner",
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: "timeline",
      label: "Interactive Timeline",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: "vendors",
      label: "Vendor Directory",
      icon: <Building2 className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Event Selector Dropdown */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  EventGenius
                  <Badge variant="indigo" size="sm" className="text-[9px] py-0 px-1.5">
                    AI Enterprise
                  </Badge>
                </span>
                <p className="text-[10px] text-slate-400 font-medium -mt-0.5">
                  Next-Gen Event Planning
                </p>
              </div>
            </Link>

            {/* Event Dropdown Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isEventDropdownOpen}
                aria-label="Switch active event workspace"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-slate-600 transition-all max-w-[190px] sm:max-w-[240px]"
              >
                <span className="truncate">
                  {currentEvent ? currentEvent.title : "Select Event"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isEventDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsEventDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl glass-dropdown p-2 z-30 shadow-2xl border border-slate-700 animate-in fade-in duration-200">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Switch Event Workspace
                    </div>
                    <div className="space-y-1 py-1 max-h-60 overflow-y-auto">
                      {events.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => {
                            onSelectEvent(ev.id);
                            setIsEventDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                            currentEvent?.id === ev.id
                              ? "bg-brand-500/10 text-brand-300 font-semibold"
                              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          }`}
                        >
                          <div className="truncate mr-2">
                            <p className="truncate font-medium">{ev.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {ev.eventType} · {ev.guestCount} guests
                            </p>
                          </div>
                          {currentEvent?.id === ev.id && (
                            <Check className="w-4 h-4 text-brand-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEventDropdownOpen(false);
                          setCreateEventModalOpen(true);
                        }}
                        className="w-full text-xs justify-start h-8 text-brand-400 hover:text-brand-300"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        New Event Workspace
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center: Main View Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/60 border border-slate-800/80" role="tablist" aria-label="Event Dashboard Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Controls: AI Launcher & User Avatar */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="luxury"
              size="sm"
              onClick={() => setAICreativeDrawerOpen(true)}
              aria-label="Open AI Creative Studio"
              className="hidden sm:inline-flex text-xs h-9 px-3.5"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300 animate-spin-slow" />
              AI Studio
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateEventModalOpen(true)}
              aria-label="Create New Event Workspace"
              className="text-xs h-9 px-3"
            >
              <Plus className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">New Event</span>
            </Button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-purple-500/20">
                {currentUser?.name ? currentUser.name[0] : "E"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {currentUser?.name || "Elena Rostova"}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Lead Producer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View Tab Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/80 gap-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
