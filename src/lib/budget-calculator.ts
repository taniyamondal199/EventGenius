import { BudgetItem, BudgetCategory, BUDGET_CATEGORIES } from "@/types";

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  remainingBudget: number;
  variance: number;
  isOverBudget: boolean;
  overagePercentage: number;
}

export interface CategoryCalculation {
  label: string;
  value: BudgetCategory;
  color: string;
  items: BudgetItem[];
  estimated: number;
  actual: number;
  paid: number;
  isOverTarget: boolean;
  overagePercentage: number;
  hasCriticalOverage: boolean;
  percentOfTotal: number;
  remainingCategoryBudget: number;
}

/**
 * Calculates aggregate budget figures across all line items.
 */
export function calculateBudgetTotals(
  items: BudgetItem[] = [],
  totalBudget: number = 0
): BudgetSummary {
  const totalEstimated = items.reduce((acc, it) => acc + (it.estimatedCost || 0), 0);
  const totalActual = items.reduce((acc, it) => acc + (it.actualCost || 0), 0);
  const totalPaid = items.reduce((acc, it) => acc + (it.paidAmount || 0), 0);

  const baselineExpense = totalActual > 0 ? totalActual : totalEstimated;
  const remainingBudget = totalBudget - baselineExpense;
  const variance = totalEstimated - totalActual;
  const isOverBudget = totalActual > totalBudget && totalBudget > 0;
  const overagePercentage =
    totalBudget > 0 && totalActual > totalBudget
      ? Math.round(((totalActual - totalBudget) / totalBudget) * 100)
      : 0;

  return {
    totalBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    remainingBudget,
    variance,
    isOverBudget,
    overagePercentage,
  };
}

/**
 * Calculates percentage by which actual exceeds estimated cost.
 */
export function calculateOveragePercentage(estimated: number, actual: number): number {
  if (estimated <= 0) return 0;
  if (actual <= estimated) return 0;
  return Math.round(((actual - estimated) / estimated) * 100);
}

/**
 * Evaluates whether an item or category exceeds estimated cost by more than the critical threshold (default 15%).
 */
export function isCriticalOverage(
  estimated: number,
  actual: number,
  thresholdPercent: number = 15
): boolean {
  if (estimated <= 0) return false;
  return actual > estimated * (1 + thresholdPercent / 100);
}

/**
 * Detects all items that exceed the specified overage percentage (default 15%).
 */
export function detectBudgetOverages(
  items: BudgetItem[] = [],
  thresholdPercent: number = 15
): BudgetItem[] {
  return items.filter((item) =>
    isCriticalOverage(item.estimatedCost, item.actualCost, thresholdPercent)
  );
}

/**
 * Groups items by budget category and computes category statistics,
 * including critical >15% overage alerts.
 */
export function calculateCategoryBreakdown(
  items: BudgetItem[] = [],
  totalBudget: number = 0,
  criticalThreshold: number = 15
): CategoryCalculation[] {
  return BUDGET_CATEGORIES.map((cat) => {
    const catItems = items.filter((it) => it.category === cat.value);
    const estimated = catItems.reduce((acc, it) => acc + (it.estimatedCost || 0), 0);
    const actual = catItems.reduce((acc, it) => acc + (it.actualCost || 0), 0);
    const paid = catItems.reduce((acc, it) => acc + (it.paidAmount || 0), 0);

    const isOverTarget = estimated > 0 && actual > estimated;
    const overagePercentage = calculateOveragePercentage(estimated, actual);
    const hasCriticalOverage = isCriticalOverage(estimated, actual, criticalThreshold);
    const percentOfTotal = totalBudget > 0 ? Math.round((actual / totalBudget) * 100) : 0;
    const remainingCategoryBudget = estimated - actual;

    return {
      ...cat,
      items: catItems,
      estimated,
      actual,
      paid,
      isOverTarget,
      overagePercentage,
      hasCriticalOverage,
      percentOfTotal,
      remainingCategoryBudget,
    };
  });
}

/**
 * Validates budget allocation percentages to ensure they sum to exactly 100%
 * and contain valid, non-negative values.
 */
export function validateBudgetAllocations(
  allocations: { category: string; percentage: number }[]
): { valid: boolean; total: number; error?: string } {
  if (!allocations || allocations.length === 0) {
    return { valid: false, total: 0, error: "Allocation list cannot be empty" };
  }

  for (const alloc of allocations) {
    if (alloc.percentage < 0) {
      return {
        valid: false,
        total: 0,
        error: `Category ${alloc.category} has negative allocation (${alloc.percentage}%)`,
      };
    }
  }

  const total = allocations.reduce((sum, a) => sum + a.percentage, 0);

  if (Math.abs(total - 100) > 0.01) {
    return {
      valid: false,
      total,
      error: `Total allocation must equal 100%. Current sum: ${total}%`,
    };
  }

  return { valid: true, total: 100 };
}
