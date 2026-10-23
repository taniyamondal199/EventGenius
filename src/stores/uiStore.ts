import { create } from "zustand";

export type ActiveTab = "overview" | "budget" | "timeline" | "vendors" | "creative_studio";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  description?: string;
}

interface UIState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Modals state
  isCreateEventModalOpen: boolean;
  setCreateEventModalOpen: (open: boolean) => void;

  isBudgetItemModalOpen: boolean;
  editingBudgetItemId: string | null;
  openBudgetItemModal: (itemId?: string | null) => void;
  closeBudgetItemModal: () => void;

  isTimelineModalOpen: boolean;
  editingTimelineItemId: string | null;
  openTimelineModal: (itemId?: string | null) => void;
  closeTimelineModal: () => void;

  isVendorModalOpen: boolean;
  editingVendorId: string | null;
  openVendorModal: (vendorId?: string | null) => void;
  closeVendorModal: () => void;

  isCollaboratorModalOpen: boolean;
  setCollaboratorModalOpen: (open: boolean) => void;

  isExportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;

  isRebalanceModalOpen: boolean;
  setRebalanceModalOpen: (open: boolean) => void;

  isVendorBriefModalOpen: boolean;
  vendorBriefInitialCategory: string;
  openVendorBriefModal: (category?: string) => void;
  closeVendorBriefModal: () => void;

  isAICreativeDrawerOpen: boolean;
  setAICreativeDrawerOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),

  isCreateEventModalOpen: false,
  setCreateEventModalOpen: (open) => set({ isCreateEventModalOpen: open }),

  isBudgetItemModalOpen: false,
  editingBudgetItemId: null,
  openBudgetItemModal: (itemId = null) =>
    set({ isBudgetItemModalOpen: true, editingBudgetItemId: itemId }),
  closeBudgetItemModal: () =>
    set({ isBudgetItemModalOpen: false, editingBudgetItemId: null }),

  isTimelineModalOpen: false,
  editingTimelineItemId: null,
  openTimelineModal: (itemId = null) =>
    set({ isTimelineModalOpen: true, editingTimelineItemId: itemId }),
  closeTimelineModal: () =>
    set({ isTimelineModalOpen: false, editingTimelineItemId: null }),

  isVendorModalOpen: false,
  editingVendorId: null,
  openVendorModal: (vendorId = null) =>
    set({ isVendorModalOpen: true, editingVendorId: vendorId }),
  closeVendorModal: () =>
    set({ isVendorModalOpen: false, editingVendorId: null }),

  isCollaboratorModalOpen: false,
  setCollaboratorModalOpen: (open) => set({ isCollaboratorModalOpen: open }),

  isExportModalOpen: false,
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),

  isRebalanceModalOpen: false,
  setRebalanceModalOpen: (open) => set({ isRebalanceModalOpen: open }),

  isVendorBriefModalOpen: false,
  vendorBriefInitialCategory: "Catering",
  openVendorBriefModal: (category = "Catering") =>
    set({ isVendorBriefModalOpen: true, vendorBriefInitialCategory: category }),
  closeVendorBriefModal: () =>
    set({ isVendorBriefModalOpen: false }),

  isAICreativeDrawerOpen: false,
  setAICreativeDrawerOpen: (open) => set({ isAICreativeDrawerOpen: open }),

  toasts: [],
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
