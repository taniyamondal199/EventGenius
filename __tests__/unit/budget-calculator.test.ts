import { describe, it, expect } from "vitest";
import {
  calculateBudgetTotals,
  calculateOveragePercentage,
  isCriticalOverage,
  detectBudgetOverages,
  calculateCategoryBreakdown,
  validateBudgetAllocations,
} from "@/lib/budget-calculator";
import { BudgetItem } from "@/types";

const mockBudgetItems: BudgetItem[] = [
  {
    id: "item-1",
    eventId: "ev-1",
    category: "VENUE",
    name: "Ballroom & Lawn Rental",
    estimatedCost: 10000,
    actualCost: 12000, // 20% overage -> triggers >15% alert
    paidAmount: 5000,
    status: "RESERVED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-2",
    eventId: "ev-1",
    category: "CATERING",
    name: "Buffet & Wine Service",
    estimatedCost: 8000,
    actualCost: 8800, // 10% overage -> under 15% threshold
    paidAmount: 8800,
    status: "PAID",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-3",
    eventId: "ev-1",
    category: "ENTERTAINMENT",
    name: "Live String Quartet",
    estimatedCost: 2000,
    actualCost: 1800, // Under budget
    paidAmount: 0,
    status: "ESTIMATED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("Budget Calculator & Overage Alert Engine", () => {
  describe("calculateBudgetTotals", () => {
    it("should aggregate total estimated, actual, paid, and remaining budget", () => {
      const summary = calculateBudgetTotals(mockBudgetItems, 25000);

      expect(summary.totalEstimated).toBe(20000);
      expect(summary.totalActual).toBe(22600);
      expect(summary.totalPaid).toBe(13800);
      expect(summary.remainingBudget).toBe(25000 - 22600);
      expect(summary.isOverBudget).toBe(false);
    });

    it("should flag when total actual spend exceeds budget cap", () => {
      const summary = calculateBudgetTotals(mockBudgetItems, 20000);

      expect(summary.isOverBudget).toBe(true);
      expect(summary.overagePercentage).toBe(13); // (22600 - 20000) / 20000 = 13%
    });

    it("should handle empty budget items cleanly", () => {
      const summary = calculateBudgetTotals([], 15000);

      expect(summary.totalEstimated).toBe(0);
      expect(summary.totalActual).toBe(0);
      expect(summary.totalPaid).toBe(0);
      expect(summary.remainingBudget).toBe(15000);
      expect(summary.isOverBudget).toBe(false);
    });
  });

  describe("Overage Calculations (>15% Threshold)", () => {
    it("should calculate exact overage percentages above estimated baseline", () => {
      expect(calculateOveragePercentage(1000, 1200)).toBe(20);
      expect(calculateOveragePercentage(1000, 1100)).toBe(10);
      expect(calculateOveragePercentage(1000, 900)).toBe(0);
      expect(calculateOveragePercentage(0, 500)).toBe(0);
    });

    it("should trigger critical overage boolean only when exceeding 15%", () => {
      // 10% over -> false
      expect(isCriticalOverage(1000, 1100, 15)).toBe(false);

      // Exact 15% -> false (> 15%)
      expect(isCriticalOverage(1000, 1150, 15)).toBe(false);

      // 15.1% over -> true
      expect(isCriticalOverage(1000, 1151, 15)).toBe(true);

      // 20% over -> true
      expect(isCriticalOverage(10000, 12000, 15)).toBe(true);
    });

    it("should filter and detect all items with >15% overage", () => {
      const overages = detectBudgetOverages(mockBudgetItems, 15);

      expect(overages).toHaveLength(1);
      expect(overages[0].name).toBe("Ballroom & Lawn Rental");
      expect(overages[0].actualCost).toBe(12000);
    });
  });

  describe("calculateCategoryBreakdown", () => {
    it("should group items by budget categories and mark critical category overages", () => {
      const breakdown = calculateCategoryBreakdown(mockBudgetItems, 30000);

      const venueCat = breakdown.find((c) => c.value === "VENUE");
      expect(venueCat).toBeDefined();
      expect(venueCat?.estimated).toBe(10000);
      expect(venueCat?.actual).toBe(12000);
      expect(venueCat?.hasCriticalOverage).toBe(true);
      expect(venueCat?.overagePercentage).toBe(20);

      const cateringCat = breakdown.find((c) => c.value === "CATERING");
      expect(cateringCat).toBeDefined();
      expect(cateringCat?.estimated).toBe(8000);
      expect(cateringCat?.actual).toBe(8800);
      expect(cateringCat?.hasCriticalOverage).toBe(false); // 10% is not >15%
    });
  });

  describe("validateBudgetAllocations", () => {
    it("should accept valid allocations that sum to 100%", () => {
      const allocations = [
        { category: "VENUE", percentage: 40 },
        { category: "CATERING", percentage: 30 },
        { category: "ENTERTAINMENT", percentage: 15 },
        { category: "PHOTO_VIDEO", percentage: 10 },
        { category: "MISC", percentage: 5 },
      ];

      const result = validateBudgetAllocations(allocations);
      expect(result.valid).toBe(true);
      expect(result.total).toBe(100);
    });

    it("should reject allocations that sum to less than 100%", () => {
      const allocations = [
        { category: "VENUE", percentage: 40 },
        { category: "CATERING", percentage: 30 },
      ];

      const result = validateBudgetAllocations(allocations);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must equal 100%");
      expect(result.total).toBe(70);
    });

    it("should reject allocations that exceed 100%", () => {
      const allocations = [
        { category: "VENUE", percentage: 70 },
        { category: "CATERING", percentage: 50 },
      ];

      const result = validateBudgetAllocations(allocations);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must equal 100%");
    });

    it("should reject negative percentage values", () => {
      const allocations = [
        { category: "VENUE", percentage: 110 },
        { category: "CATERING", percentage: -10 },
      ];

      const result = validateBudgetAllocations(allocations);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("negative allocation");
    });
  });
});
