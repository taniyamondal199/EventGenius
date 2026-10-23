import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BudgetPlannerView } from "@/components/budget/BudgetPlannerView";
import { VendorKanbanView } from "@/components/vendors/VendorKanbanView";
import { Event } from "@/types";

const mockEvent: Event = {
  id: "test-event-1",
  userId: "user-1",
  title: "Liam & Chloe's Coastal Wedding",
  eventType: "WEDDING",
  targetDate: "2026-09-18T16:00:00.000Z",
  location: "Meadowood Estate, Napa Valley, CA",
  totalBudget: 50000,
  currency: "USD",
  guestCount: 130,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  budgetItems: [
    {
      id: "b-1",
      eventId: "test-event-1",
      category: "VENUE",
      name: "Vineyard Estate Rental",
      estimatedCost: 10000,
      actualCost: 13500, // 35% overage -> triggers >15% warning banner
      paidAmount: 13500,
      status: "PAID",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "b-2",
      eventId: "test-event-1",
      category: "CATERING",
      name: "Farm-to-Table Plated Dinner",
      estimatedCost: 15000,
      actualCost: 15000, // On track
      paidAmount: 7500,
      status: "RESERVED",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ],
  vendors: [
    {
      id: "v-1",
      eventId: "test-event-1",
      category: "Catering",
      vendorName: "Heritage Culinary Group",
      contactEmail: "info@heritageculinary.com",
      contactPhone: "+1 (415) 555-7201",
      contractUrl: "https://contracts.eventgenius.app/v1",
      notes: "Tasting confirmed for next month",
      status: "QUOTE_RECEIVED",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "v-2",
      eventId: "test-event-1",
      category: "Photography",
      vendorName: "Lumiere Fine Art Wedding Studios",
      contactEmail: "hello@lumiere.photo",
      status: "HIRED",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ],
};

describe("Component Tests - Budget Planner & Vendor Kanban", () => {
  describe("BudgetPlannerView", () => {
    it("should render budget category progress bars with role='progressbar' and aria attributes", () => {
      const handleUpdate = vi.fn().mockResolvedValue(undefined);
      const handleDelete = vi.fn().mockResolvedValue(undefined);

      render(
        <BudgetPlannerView
          event={mockEvent}
          onUpdateItemStatus={handleUpdate}
          onDeleteItem={handleDelete}
        />
      );

      // Verify progressbars are present with aria attributes
      const progressBars = screen.getAllByRole("progressbar");
      expect(progressBars.length).toBeGreaterThan(0);

      const venueProgressBar = progressBars.find(
        (el) => el.getAttribute("aria-label")?.includes("Venue & Hospitality")
      );
      expect(venueProgressBar).toBeDefined();
      expect(venueProgressBar).toHaveAttribute("aria-valuenow");
      expect(venueProgressBar).toHaveAttribute("aria-valuemin", "0");
      expect(venueProgressBar).toHaveAttribute("aria-valuemax", "100");
    });

    it("should display critical >15% overage alert banner when actual costs exceed threshold", () => {
      const handleUpdate = vi.fn().mockResolvedValue(undefined);
      const handleDelete = vi.fn().mockResolvedValue(undefined);

      render(
        <BudgetPlannerView
          event={mockEvent}
          onUpdateItemStatus={handleUpdate}
          onDeleteItem={handleDelete}
        />
      );

      // Banner text should highlight the 15% threshold violation
      expect(
        screen.getByText(/Budget Warning: 1 Categories Exceed 15% Target Threshold/i)
      ).toBeInTheDocument();
      const itemElements = screen.getAllByText(/Vineyard Estate Rental/i);
      expect(itemElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("VendorKanbanView", () => {
    it("should render vendor cards across pipeline columns with accessible actions", () => {
      const handleUpdateStatus = vi.fn().mockResolvedValue(undefined);
      const handleDeleteVendor = vi.fn().mockResolvedValue(undefined);

      render(
        <VendorKanbanView
          event={mockEvent}
          onUpdateVendorStatus={handleUpdateStatus}
          onDeleteVendor={handleDeleteVendor}
        />
      );

      expect(screen.getByText("Heritage Culinary Group")).toBeInTheDocument();
      expect(screen.getByText("Lumiere Fine Art Wedding Studios")).toBeInTheDocument();

      // Check accessible edit & delete buttons
      expect(screen.getByLabelText("Edit Heritage Culinary Group")).toBeInTheDocument();
      expect(screen.getByLabelText("Delete Heritage Culinary Group")).toBeInTheDocument();
    });

    it("should advance vendor status when next stage button is clicked", () => {
      const handleUpdateStatus = vi.fn().mockResolvedValue(undefined);
      const handleDeleteVendor = vi.fn().mockResolvedValue(undefined);

      render(
        <VendorKanbanView
          event={mockEvent}
          onUpdateVendorStatus={handleUpdateStatus}
          onDeleteVendor={handleDeleteVendor}
        />
      );

      // Status of v-1 is QUOTE_RECEIVED (index 2). Next should be HIRED (index 3).
      const nextBtn = screen.getByLabelText("Advance Heritage Culinary Group to next stage");
      fireEvent.click(nextBtn);

      expect(handleUpdateStatus).toHaveBeenCalledWith("v-1", "HIRED");
    });

    it("should regress vendor status when previous stage button is clicked", () => {
      const handleUpdateStatus = vi.fn().mockResolvedValue(undefined);
      const handleDeleteVendor = vi.fn().mockResolvedValue(undefined);

      render(
        <VendorKanbanView
          event={mockEvent}
          onUpdateVendorStatus={handleUpdateStatus}
          onDeleteVendor={handleDeleteVendor}
        />
      );

      // Status of v-1 is QUOTE_RECEIVED (index 2). Prev should be CONTACTED (index 1).
      const prevBtn = screen.getByLabelText("Move Heritage Culinary Group back a stage");
      fireEvent.click(prevBtn);

      expect(handleUpdateStatus).toHaveBeenCalledWith("v-1", "CONTACTED");
    });
  });
});
