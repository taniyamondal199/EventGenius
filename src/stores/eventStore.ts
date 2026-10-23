import { create } from "zustand";
import { Event, BudgetCategory, TimelinePhase, VendorStatus } from "@/types";

interface EventStoreState {
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;

  // Filters
  budgetCategoryFilter: BudgetCategory | "ALL";
  setBudgetCategoryFilter: (cat: BudgetCategory | "ALL") => void;

  timelinePhaseFilter: TimelinePhase | "ALL";
  setTimelinePhaseFilter: (phase: TimelinePhase | "ALL") => void;

  vendorStatusFilter: VendorStatus | "ALL";
  setVendorStatusFilter: (status: VendorStatus | "ALL") => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useEventStore = create<EventStoreState>((set) => ({
  currentEvent: null,
  setCurrentEvent: (event) => set({ currentEvent: event }),

  budgetCategoryFilter: "ALL",
  setBudgetCategoryFilter: (cat) => set({ budgetCategoryFilter: cat }),

  timelinePhaseFilter: "ALL",
  setTimelinePhaseFilter: (phase) => set({ timelinePhaseFilter: phase }),

  vendorStatusFilter: "ALL",
  setVendorStatusFilter: (status) => set({ vendorStatusFilter: status }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
