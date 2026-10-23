import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateEventModal } from "@/components/dashboard/CreateEventModal";
import { useUIStore } from "@/stores/uiStore";

describe("Component Tests - Event Creation & Domain Presets", () => {
  beforeEach(() => {
    // Open modal in store for test
    useUIStore.getState().setCreateEventModalOpen(true);
  });

  it("should render event creation form with domain options and inputs", () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateEventModal onCreate={handleCreate} />);

    expect(screen.getByText("Create New Event Plan")).toBeInTheDocument();
    expect(screen.getByLabelText("Event Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Apply Wedding Preset")).toBeInTheDocument();
    expect(screen.getByLabelText("Apply Birthday Preset")).toBeInTheDocument();
    expect(screen.getByLabelText("Apply Community Preset")).toBeInTheDocument();
  });

  it("should populate form fields with Wedding preset data when Wedding preset is clicked", async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateEventModal onCreate={handleCreate} />);

    const weddingBtn = screen.getByLabelText("Apply Wedding Preset");
    fireEvent.click(weddingBtn);

    const titleInput = screen.getByLabelText("Event Title") as HTMLInputElement;
    expect(titleInput.value).toContain("Coastal Vineyard Wedding");

    const budgetInput = screen.getByLabelText("Total Budget Cap") as HTMLInputElement;
    expect(budgetInput.value).toBe("55000");

    const guestInput = screen.getByLabelText("Guest Count") as HTMLInputElement;
    expect(guestInput.value).toBe("130");
  });

  it("should populate form fields with Birthday milestone preset data", async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateEventModal onCreate={handleCreate} />);

    const bdayBtn = screen.getByLabelText("Apply Birthday Preset");
    fireEvent.click(bdayBtn);

    const titleInput = screen.getByLabelText("Event Title") as HTMLInputElement;
    expect(titleInput.value).toContain("Marcus's 30th Rooftop Milestone");

    const budgetInput = screen.getByLabelText("Total Budget Cap") as HTMLInputElement;
    expect(budgetInput.value).toBe("12000");

    const guestInput = screen.getByLabelText("Guest Count") as HTMLInputElement;
    expect(guestInput.value).toBe("65");
  });

  it("should populate form fields with Community gathering preset data", async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateEventModal onCreate={handleCreate} />);

    const communityBtn = screen.getByLabelText("Apply Community Preset");
    fireEvent.click(communityBtn);

    const titleInput = screen.getByLabelText("Event Title") as HTMLInputElement;
    expect(titleInput.value).toContain("Summer Green Fair");

    const budgetInput = screen.getByLabelText("Total Budget Cap") as HTMLInputElement;
    expect(budgetInput.value).toBe("25000");

    const guestInput = screen.getByLabelText("Guest Count") as HTMLInputElement;
    expect(guestInput.value).toBe("450");
  });

  it("should trigger onCreate with submitted event payload upon form submission", async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateEventModal onCreate={handleCreate} />);

    // Apply wedding preset and submit
    fireEvent.click(screen.getByLabelText("Apply Wedding Preset"));

    const submitBtn = screen.getByLabelText("Initialize Event");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "WEDDING",
          totalBudget: 55000,
          guestCount: 130,
        })
      );
    });
  });
});
