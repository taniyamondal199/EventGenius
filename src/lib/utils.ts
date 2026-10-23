import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, formatDistanceToNow, isAfter } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency: string = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateString: string | Date, pattern: string = "PPP"): string {
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(d, pattern);
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString: string | Date): string {
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(d, "MMM d, yyyy · h:mm a");
  } catch {
    return String(dateString);
  }
}

export function formatTimeOnly(dateString: string | Date): string {
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(d, "h:mm a");
  } catch {
    return String(dateString);
  }
}

export function getDaysRemaining(targetDate: string | Date): { days: number; isPast: boolean; label: string } {
  try {
    const d = typeof targetDate === "string" ? parseISO(targetDate) : targetDate;
    const now = new Date();
    const isPast = !isAfter(d, now);
    const diffTime = d.getTime() - now.getTime();
    const days = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));

    if (isPast) {
      return { days, isPast: true, label: `${days} day${days === 1 ? "" : "s"} ago` };
    }
    return { days, isPast: false, label: `${days} day${days === 1 ? "" : "s"} to go` };
  } catch {
    return { days: 0, isPast: false, label: "TBD" };
  }
}

/**
 * Type-safe error message extractor replacing 'any' in catch blocks
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unexpected error occurred";
}

export * from "./budget-calculator";
