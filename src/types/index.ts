import { z } from "zod";

// ==========================================
// ENUMS & CONSTANTS
// ==========================================

export type EventType = "WEDDING" | "BIRTHDAY" | "COMMUNITY";
export type CollaboratorRole = "OWNER" | "COLLABORATOR" | "VIEWER";
export type BudgetCategory =
  | "CATERING"
  | "VENUE"
  | "DECOR"
  | "ENTERTAINMENT"
  | "PHOTO_VIDEO"
  | "ATTIRE"
  | "MISC";
export type BudgetStatus = "ESTIMATED" | "RESERVED" | "PAID";
export type TimelinePhase = "PLANNING" | "SETUP" | "EVENT_DAY" | "WRAP_UP";
export type VendorStatus =
  | "RESEARCHING"
  | "CONTACTED"
  | "QUOTE_RECEIVED"
  | "HIRED"
  | "REJECTED";
export type IdeaCategory = "THEME" | "ACTIVITY" | "MENU" | "DECOR";

export const EVENT_TYPES: { label: string; value: EventType; icon: string }[] = [
  { label: "Wedding Celebration", value: "WEDDING", icon: "HeartHandshake" },
  { label: "Birthday Milestone", value: "BIRTHDAY", icon: "Cake" },
  { label: "Community Gathering", value: "COMMUNITY", icon: "Users" },
];

export const BUDGET_CATEGORIES: { label: string; value: BudgetCategory; color: string }[] = [
  { label: "Catering & Bar", value: "CATERING", color: "#f97316" },
  { label: "Venue & Hospitality", value: "VENUE", color: "#8b5cf6" },
  { label: "Decor & Floral", value: "DECOR", color: "#ec4899" },
  { label: "Music & Entertainment", value: "ENTERTAINMENT", color: "#06b6d4" },
  { label: "Photo & Video", value: "PHOTO_VIDEO", color: "#3b82f6" },
  { label: "Attire & Styling", value: "ATTIRE", color: "#eab308" },
  { label: "Miscellaneous & Permits", value: "MISC", color: "#64748b" },
];

export const TIMELINE_PHASES: { label: string; value: TimelinePhase; badge: string }[] = [
  { label: "Pre-Event Planning", value: "PLANNING", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { label: "On-Site Setup & Staging", value: "SETUP", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { label: "Live Event Day Execution", value: "EVENT_DAY", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { label: "Strike & Post-Event Wrap-up", value: "WRAP_UP", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
];

export const VENDOR_STATUSES: { label: string; value: VendorStatus; badge: string; color: string }[] = [
  { label: "Researching", value: "RESEARCHING", badge: "bg-slate-500/10 text-slate-300 border-slate-500/30", color: "#94a3b8" },
  { label: "Contacted", value: "CONTACTED", badge: "bg-blue-500/10 text-blue-400 border-blue-500/30", color: "#60a5fa" },
  { label: "Quote Received", value: "QUOTE_RECEIVED", badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", color: "#fbbf24" },
  { label: "Hired & Contracted", value: "HIRED", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", color: "#34d399" },
  { label: "Rejected / Passed", value: "REJECTED", badge: "bg-rose-500/10 text-rose-400 border-rose-500/30", color: "#f87171" },
];

// ==========================================
// CORE DATA ENTITIES
// ==========================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface EventCollaborator {
  id: string;
  eventId: string;
  userId: string;
  role: CollaboratorRole;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  status: BudgetStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineItem {
  id: string;
  eventId: string;
  title: string;
  description?: string | null;
  startTime: string; // ISO
  endTime: string;   // ISO
  phase: TimelinePhase;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorChecklist {
  id: string;
  eventId: string;
  category: string;
  vendorName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contractUrl?: string | null;
  notes?: string | null;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AIIdeaLog {
  id: string;
  eventId: string;
  category: IdeaCategory;
  content: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  eventType: EventType;
  targetDate: string; // ISO
  location: string;
  totalBudget: number;
  currency: string;
  guestCount: number;
  themeNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  collaborators?: EventCollaborator[];
  budgetItems?: BudgetItem[];
  timelineItems?: TimelineItem[];
  vendors?: VendorChecklist[];
  aiIdeas?: AIIdeaLog[];
  userRole?: CollaboratorRole;
}

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

export const CreateEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  eventType: z.enum(["WEDDING", "BIRTHDAY", "COMMUNITY"]),
  targetDate: z.string().min(1, "Target date is required"),
  location: z.string().min(2, "Location is required").max(150),
  totalBudget: z.number().min(0, "Budget must be positive"),
  currency: z.string().default("USD"),
  guestCount: z.number().int().min(1, "Guest count must be at least 1"),
  themeNotes: z.string().max(1000).optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const BudgetItemSchema = z.object({
  category: z.enum(["CATERING", "VENUE", "DECOR", "ENTERTAINMENT", "PHOTO_VIDEO", "ATTIRE", "MISC"]),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  status: z.enum(["ESTIMATED", "RESERVED", "PAID"]).default("ESTIMATED"),
  notes: z.string().max(500).optional(),
});

export type BudgetItemInput = z.infer<typeof BudgetItemSchema>;

export const TimelineItemSchema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().max(500).optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  phase: z.enum(["PLANNING", "SETUP", "EVENT_DAY", "WRAP_UP"]),
  isCompleted: z.boolean().default(false),
});

export type TimelineItemInput = z.infer<typeof TimelineItemSchema>;

export const VendorChecklistSchema = z.object({
  category: z.string().min(2).max(60),
  vendorName: z.string().min(2, "Vendor name is required").max(100),
  contactEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional().or(z.literal("")),
  contractUrl: z.string().url("Valid URL required").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  status: z.enum(["RESEARCHING", "CONTACTED", "QUOTE_RECEIVED", "HIRED", "REJECTED"]).default("RESEARCHING"),
});

export type VendorChecklistInput = z.infer<typeof VendorChecklistSchema>;

// ==========================================
// AI REQUEST & STRUCTURED OUTPUT SCHEMAS
// ==========================================

export const AIPlanRequestSchema = z.object({
  eventType: z.enum(["WEDDING", "BIRTHDAY", "COMMUNITY"]),
  date: z.string(),
  budget: z.number().min(500),
  guestCount: z.number().min(1),
  location: z.string().min(2),
  styleKeywords: z.string().min(2).max(300),
});

export type AIPlanRequest = z.infer<typeof AIPlanRequestSchema>;

export const AIPlanOutputSchema = z.object({
  blueprintSummary: z.string(),
  budgetBreakdown: z.array(
    z.object({
      category: z.enum(["CATERING", "VENUE", "DECOR", "ENTERTAINMENT", "PHOTO_VIDEO", "ATTIRE", "MISC"]),
      suggestedName: z.string(),
      recommendedPercentage: z.number(),
      estimatedCostMin: z.number(),
      estimatedCostMax: z.number(),
      rationale: z.string(),
    })
  ),
  timelineMilestones: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      phase: z.enum(["PLANNING", "SETUP", "EVENT_DAY", "WRAP_UP"]),
      offsetDaysFromEvent: z.number(), // negative for planning, 0 for day of, positive for wrap up
      timeOfDay: z.string().optional(),
    })
  ),
  vendorChecklist: z.array(
    z.object({
      category: z.string(),
      vendorRole: z.string(),
      priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "OPTIONAL"]),
      procurementTimeline: z.string(),
      estimatedBudgetAllocation: z.number(),
      keyQuestionToAsk: z.string(),
    })
  ),
  creativeIdeas: z.array(
    z.object({
      category: z.enum(["THEME", "ACTIVITY", "MENU", "DECOR"]),
      title: z.string(),
      description: z.string(),
      budgetImpact: z.enum(["LOW", "MEDIUM", "HIGH"]),
      guestDelightScore: z.number().min(1).max(10),
    })
  ),
});

export type AIPlanOutput = z.infer<typeof AIPlanOutputSchema>;

export const AIRebalanceRequestSchema = z.object({
  eventId: z.string(),
  totalBudget: z.number(),
  currency: z.string().default("USD"),
  items: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      name: z.string(),
      estimatedCost: z.number(),
      actualCost: z.number(),
      paidAmount: z.number(),
    })
  ),
});

export type AIRebalanceRequest = z.infer<typeof AIRebalanceRequestSchema>;

export const AIRebalanceOutputSchema = z.object({
  healthScore: z.number().min(0).max(100),
  healthStatus: z.enum(["HEALTHY", "WARNING", "CRITICAL_DEFICIT", "SURPLUS"]),
  totalEstimated: z.number(),
  totalActual: z.number(),
  projectedVariance: z.number(),
  overageWarnings: z.array(
    z.object({
      category: z.string(),
      name: z.string(),
      percentageOverBudget: z.number(),
      excessAmount: z.number(),
      urgency: z.enum(["CRITICAL", "MODERATE"]),
    })
  ),
  rebalancingRecommendations: z.array(
    z.object({
      action: z.string(),
      sourceCategory: z.string(),
      targetCategory: z.string(),
      estimatedSavings: z.number(),
      tradeOffRationale: z.string(),
    })
  ),
  costCuttingOpportunities: z.array(
    z.object({
      area: z.string(),
      practicalTactic: z.string(),
      potentialSavingsAmount: z.number(),
    })
  ),
});

export type AIRebalanceOutput = z.infer<typeof AIRebalanceOutputSchema>;

export const AIVendorBriefRequestSchema = z.object({
  category: z.string().min(2),
  style: z.string().min(2),
  budgetLimit: z.number().min(0),
  guestCount: z.number().optional(),
  eventDate: z.string().optional(),
  location: z.string().optional(),
});

export type AIVendorBriefRequest = z.infer<typeof AIVendorBriefRequestSchema>;

export const AIVendorBriefOutputSchema = z.object({
  category: z.string(),
  rfpTitle: z.string(),
  readyToSendRfpMessage: z.string(),
  scopeOfWorkDeliverables: z.array(z.string()),
  essentialQuestionsToAsk: z.array(z.string()),
  redFlagsToWatchOutFor: z.array(z.string()),
  contractNegotiationTips: z.array(z.string()),
});

export type AIVendorBriefOutput = z.infer<typeof AIVendorBriefOutputSchema>;
