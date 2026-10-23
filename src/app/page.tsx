"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/stores/uiStore";
import { useEventStore } from "@/stores/eventStore";
import {
  Event,
  CreateEventInput,
  BudgetItemInput,
  BudgetItem,
  TimelineItemInput,
  TimelineItem,
  VendorChecklistInput,
  VendorChecklist,
  VendorStatus,
  CollaboratorRole,
  IdeaCategory,
} from "@/types";

// Navigation & Dashboard Components
import { Navbar } from "@/components/navigation/Navbar";
import { EventHeader } from "@/components/dashboard/EventHeader";
import { OverviewHub } from "@/components/dashboard/OverviewHub";
import { BudgetPlannerView } from "@/components/budget/BudgetPlannerView";
import { InteractiveTimelineView } from "@/components/timeline/InteractiveTimelineView";
import { VendorKanbanView } from "@/components/vendors/VendorKanbanView";

// Modals & Drawers
import { AICreativeStudioDrawer } from "@/components/ai/AICreativeStudioDrawer";
import { AIBudgetOptimizerModal } from "@/components/ai/AIBudgetOptimizerModal";
import { AIVendorBriefModal } from "@/components/ai/AIVendorBriefModal";
import { CollaboratorManagerModal } from "@/components/collaborators/CollaboratorManagerModal";
import { EventExportModal } from "@/components/export/EventExportModal";
import { CreateEventModal } from "@/components/dashboard/CreateEventModal";
import { BudgetItemModal } from "@/components/budget/BudgetItemModal";
import { TimelineItemModal } from "@/components/timeline/TimelineItemModal";
import { VendorModal } from "@/components/vendors/VendorModal";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const queryClient = useQueryClient();
  const { activeTab, addToast } = useUIStore();
  const { currentEvent, setCurrentEvent } = useEventStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // 1. Fetch Events Query
  const { data: eventsData, isLoading: isEventsLoading } = useQuery<{ events: Event[] }>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  const events = useMemo(() => eventsData?.events || [], [eventsData?.events]);

  // Initialize selected event
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // 2. Fetch Single Event with Details
  const activeEventId = selectedEventId || events[0]?.id;
  const { data: eventDetailData, isLoading: isEventDetailLoading } = useQuery<{ event: Event } | null>({
    queryKey: ["event", activeEventId],
    queryFn: async () => {
      if (!activeEventId) return null;
      const res = await fetch(`/api/events/${activeEventId}`);
      if (!res.ok) throw new Error("Failed to fetch event detail");
      return res.json();
    },
    enabled: !!activeEventId,
  });

  const activeEvent = eventDetailData?.event || events.find((e) => e.id === activeEventId) || null;

  useEffect(() => {
    if (activeEvent) {
      setCurrentEvent(activeEvent);
    }
  }, [activeEvent, setCurrentEvent]);

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Create Event
  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventInput) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setSelectedEventId(data.event.id);
      addToast({
        type: "success",
        message: "Event Created",
        description: `Workspace initialized for ${data.event.title}.`,
      });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Creation Failed";
      addToast({ type: "error", message: "Creation Failed", description: msg });
    },
  });

  // Save Budget Item (Add or Update)
  const saveBudgetItemMutation = useMutation({
    mutationFn: async ({ data, itemId }: { data: BudgetItemInput; itemId?: string }) => {
      const method = itemId ? "PUT" : "POST";
      const body = itemId ? { ...data, itemId } : data;
      const res = await fetch(`/api/events/${activeEvent?.id}/budget`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save budget item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      addToast({
        type: "success",
        message: "Budget Item Saved",
        description: "Financial allocations updated.",
      });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Save Failed";
      addToast({ type: "error", message: "Save Failed", description: msg });
    },
  });

  // Update Budget Status Inline
  const updateBudgetStatusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: BudgetItem["status"] }) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/budget`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Update Failed";
      addToast({ type: "error", message: "Update Failed", description: msg });
    },
  });

  // Delete Budget Item
  const deleteBudgetItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/budget?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete budget item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      addToast({ type: "success", message: "Line Item Deleted" });
    },
  });

  // Save Timeline Item (Add or Update)
  const saveTimelineItemMutation = useMutation({
    mutationFn: async ({ data, itemId }: { data: TimelineItemInput; itemId?: string }) => {
      const method = itemId ? "PUT" : "POST";
      const body = itemId ? { ...data, itemId } : data;
      const res = await fetch(`/api/events/${activeEvent?.id}/timeline`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save timeline item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
      addToast({
        type: "success",
        message: "Timeline Updated",
        description: "Itinerary schedule synchronized.",
      });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Save Failed";
      addToast({ type: "error", message: "Save Failed", description: msg });
    },
  });

  // Toggle Timeline Completion
  const toggleTimelineCompletionMutation = useMutation({
    mutationFn: async ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/timeline`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isCompleted }),
      });
      if (!res.ok) throw new Error("Failed to update completion");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
    },
  });

  // Delete Timeline Item
  const deleteTimelineItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/timeline?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete timeline milestone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
      addToast({ type: "success", message: "Milestone Deleted" });
    },
  });

  // Save Vendor Item (Add or Update)
  const saveVendorMutation = useMutation({
    mutationFn: async ({ data, vendorId }: { data: VendorChecklistInput; vendorId?: string }) => {
      const method = vendorId ? "PUT" : "POST";
      const body = vendorId ? { ...data, vendorId } : data;
      const res = await fetch(`/api/events/${activeEvent?.id}/vendors`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save vendor");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
      addToast({
        type: "success",
        message: "Vendor Saved",
        description: "Directory records updated.",
      });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Save Failed";
      addToast({ type: "error", message: "Save Failed", description: msg });
    },
  });

  // Update Vendor Status (Kanban Stage)
  const updateVendorStatusMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: string; status: VendorStatus }) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/vendors`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, status }),
      });
      if (!res.ok) throw new Error("Failed to advance vendor status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
    },
  });

  // Delete Vendor Item
  const deleteVendorMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/vendors?vendorId=${vendorId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete vendor");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
      addToast({ type: "success", message: "Vendor Removed" });
    },
  });

  // Add AI Idea
  const addAIIdeaMutation = useMutation({
    mutationFn: async ({ category, content }: { category: IdeaCategory; content: string }) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, content }),
      });
      if (!res.ok) throw new Error("Failed to save idea");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
    },
  });

  // Toggle Idea Favorite
  const toggleIdeaFavoriteMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/ideas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId }),
      });
      if (!res.ok) throw new Error("Failed to toggle favorite");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
    },
  });

  // Add Collaborator
  const addCollaboratorMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: CollaboratorRole }) => {
      const res = await fetch(`/api/events/${activeEvent?.id}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add collaborator");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
    },
  });

  // Remove Collaborator
  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const res = await fetch(
        `/api/events/${activeEvent?.id}/collaborators?collaboratorId=${collaboratorId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove collaborator");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", activeEvent?.id] });
    },
  });

  if (isEventsLoading || (!activeEvent && isEventDetailLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">
          Loading EventGenius Workspaces...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <Navbar
        events={events}
        currentEvent={activeEvent}
        onSelectEvent={(id) => setSelectedEventId(id)}
        currentUser={{ name: "Elena Rostova", email: "elena@eventgenius.io" }}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {activeEvent ? (
          <>
            {/* Event Header Banner */}
            <EventHeader event={activeEvent} />

            {/* Active Tab View Rendering */}
            <div className="transition-all duration-300">
              {activeTab === "overview" && <OverviewHub event={activeEvent} />}

              {activeTab === "budget" && (
                <BudgetPlannerView
                  event={activeEvent}
                  onUpdateItemStatus={async (itemId, status) => {
                    await updateBudgetStatusMutation.mutateAsync({ itemId, status });
                  }}
                  onDeleteItem={async (itemId) => {
                    await deleteBudgetItemMutation.mutateAsync(itemId);
                  }}
                />
              )}

              {activeTab === "timeline" && (
                <InteractiveTimelineView
                  event={activeEvent}
                  onToggleComplete={async (itemId, isCompleted) => {
                    await toggleTimelineCompletionMutation.mutateAsync({ itemId, isCompleted });
                  }}
                  onDeleteItem={async (itemId) => {
                    await deleteTimelineItemMutation.mutateAsync(itemId);
                  }}
                />
              )}

              {activeTab === "vendors" && (
                <VendorKanbanView
                  event={activeEvent}
                  onUpdateVendorStatus={async (vendorId, status) => {
                    await updateVendorStatusMutation.mutateAsync({ vendorId, status });
                  }}
                  onDeleteVendor={async (vendorId) => {
                    await deleteVendorMutation.mutateAsync(vendorId);
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 space-y-4 max-w-md mx-auto my-12">
            <h3 className="text-lg font-bold text-white">No Event Workspace Found</h3>
            <p className="text-xs text-slate-400">
              Create your first event workspace to start planning with EventGenius AI.
            </p>
          </div>
        )}
      </main>

      {/* Modals & Slide-over Drawers */}
      {activeEvent && (
        <>
          <AICreativeStudioDrawer
            event={activeEvent}
            onAddBudgetItem={async (data) => {
              await saveBudgetItemMutation.mutateAsync({ data });
            }}
            onAddTimelineItem={async (data) => {
              await saveTimelineItemMutation.mutateAsync({ data });
            }}
            onAddVendorItem={async (data) => {
              await saveVendorMutation.mutateAsync({ data });
            }}
            onAddAIIdea={async (category, content) => {
              await addAIIdeaMutation.mutateAsync({ category, content });
            }}
            onToggleIdeaFavorite={async (ideaId) => {
              await toggleIdeaFavoriteMutation.mutateAsync(ideaId);
            }}
          />

          <AIBudgetOptimizerModal event={activeEvent} />

          <AIVendorBriefModal event={activeEvent} />

          <CollaboratorManagerModal
            event={activeEvent}
            onAddCollaborator={async (email, role) => {
              await addCollaboratorMutation.mutateAsync({ email, role });
            }}
            onRemoveCollaborator={async (collabId) => {
              await removeCollaboratorMutation.mutateAsync(collabId);
            }}
          />

          <EventExportModal event={activeEvent} />

          <BudgetItemModal
            event={activeEvent}
            onSave={async (data, itemId) => {
              await saveBudgetItemMutation.mutateAsync({ data, itemId });
            }}
            isLoading={saveBudgetItemMutation.isPending}
          />

          <TimelineItemModal
            event={activeEvent}
            onSave={async (data, itemId) => {
              await saveTimelineItemMutation.mutateAsync({ data, itemId });
            }}
            isLoading={saveTimelineItemMutation.isPending}
          />

          <VendorModal
            event={activeEvent}
            onSave={async (data, vendorId) => {
              await saveVendorMutation.mutateAsync({ data, vendorId });
            }}
            isLoading={saveVendorMutation.isPending}
          />
        </>
      )}

      <CreateEventModal
        onCreate={async (data) => {
          await createEventMutation.mutateAsync(data);
        }}
        isLoading={createEventMutation.isPending}
      />
    </div>
  );
}
