import {
  Event,
  User,
  BudgetItem,
  TimelineItem,
  VendorChecklist,
  AIIdeaLog,
  CollaboratorRole,
  CreateEventInput,
  BudgetItemInput,
  TimelineItemInput,
  VendorChecklistInput,
} from "@/types";
import { INITIAL_EVENTS, SEED_USERS } from "./seed-data";
import { prisma } from "./prisma";

// In-memory persistent state initialized with rich seed data
let memEvents: Event[] = JSON.parse(JSON.stringify(INITIAL_EVENTS));
let memUsers: (User & { passwordHash: string })[] = JSON.parse(JSON.stringify(SEED_USERS));

/**
 * Checks whether PostgreSQL database is reachable
 */
let isDbAvailable: boolean | null = null;
async function checkDbConnection(): Promise<boolean> {
  if (isDbAvailable !== null) return isDbAvailable;
  try {
    // Quick test query
    await prisma.$queryRaw`SELECT 1`;
    isDbAvailable = true;
    return true;
  } catch (e) {
    isDbAvailable = false;
    return false;
  }
}

// ==========================================
// USER OPERATIONS
// ==========================================

export async function findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const dbConnected = await checkDbConnection();

  if (dbConnected) {
    try {
      const u = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (u) {
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("DB findUser error, using memory fallback", e);
    }
  }

  const user = memUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  return user || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const dbConnected = await checkDbConnection();
  if (dbConnected) {
    try {
      const u = await prisma.user.findUnique({ where: { id } });
      if (u) {
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          createdAt: u.createdAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("DB findUserById error, using memory fallback", e);
    }
  }

  const user = memUsers.find((u) => u.id === id);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

// ==========================================
// RBAC & ACCESS CONTROL
// ==========================================

export async function getUserRoleForEvent(eventId: string, userId: string): Promise<CollaboratorRole | null> {
  const event = await getEventById(eventId, userId);
  if (!event) return null;

  if (event.userId === userId) {
    return "OWNER";
  }

  const collab = event.collaborators?.find((c) => c.userId === userId);
  if (collab) {
    return collab.role;
  }

  return null;
}

export async function canUserAccessEvent(
  eventId: string,
  userId: string,
  requiredRole: CollaboratorRole = "VIEWER"
): Promise<boolean> {
  const role = await getUserRoleForEvent(eventId, userId);
  if (!role) return false;

  if (requiredRole === "VIEWER") {
    return true; // Any role (OWNER, COLLABORATOR, VIEWER) can view
  }
  if (requiredRole === "COLLABORATOR") {
    return role === "OWNER" || role === "COLLABORATOR";
  }
  if (requiredRole === "OWNER") {
    return role === "OWNER";
  }
  return false;
}

// ==========================================
// EVENT OPERATIONS
// ==========================================

export async function getUserEvents(userId: string): Promise<Event[]> {
  const dbConnected = await checkDbConnection();
  if (dbConnected) {
    try {
      const events = await prisma.event.findMany({
        where: {
          OR: [
            { userId },
            { collaborators: { some: { userId } } },
          ],
        },
        include: {
          collaborators: { include: { user: true } },
          budgetItems: true,
          timelineItems: true,
          vendors: true,
          aiIdeas: true,
        },
        orderBy: { targetDate: "asc" },
      });

      return events.map((e) => ({
        id: e.id,
        userId: e.userId,
        title: e.title,
        eventType: e.eventType,
        targetDate: e.targetDate.toISOString(),
        location: e.location,
        totalBudget: Number(e.totalBudget),
        currency: e.currency,
        guestCount: e.guestCount,
        themeNotes: e.themeNotes,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        userRole: e.userId === userId ? "OWNER" : (e.collaborators.find((c) => c.userId === userId)?.role || "VIEWER"),
        budgetItems: e.budgetItems.map((b) => ({
          ...b,
          estimatedCost: Number(b.estimatedCost),
          actualCost: Number(b.actualCost),
          paidAmount: Number(b.paidAmount),
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
        timelineItems: e.timelineItems.map((t) => ({
          ...t,
          startTime: t.startTime.toISOString(),
          endTime: t.endTime.toISOString(),
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
        vendors: e.vendors.map((v) => ({
          ...v,
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        })),
        aiIdeas: e.aiIdeas.map((i) => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
        })),
      }));
    } catch (e) {
      console.warn("DB getUserEvents failed, using memory store", e);
    }
  }

  // Memory fallback
  return memEvents
    .filter((e) => e.userId === userId || e.collaborators?.some((c) => c.userId === userId))
    .map((e) => ({
      ...e,
      userRole: e.userId === userId ? "OWNER" : (e.collaborators?.find((c) => c.userId === userId)?.role || "VIEWER"),
    }));
}

export async function getEventById(eventId: string, userId?: string): Promise<Event | null> {
  const dbConnected = await checkDbConnection();
  if (dbConnected) {
    try {
      const e = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          collaborators: { include: { user: true } },
          budgetItems: { orderBy: { createdAt: "desc" } },
          timelineItems: { orderBy: { startTime: "asc" } },
          vendors: { orderBy: { createdAt: "desc" } },
          aiIdeas: { orderBy: { createdAt: "desc" } },
        },
      });

      if (!e) return null;

      let role: CollaboratorRole = "VIEWER";
      if (userId) {
        if (e.userId === userId) role = "OWNER";
        else {
          const c = e.collaborators.find((col) => col.userId === userId);
          if (c) role = c.role;
        }
      }

      return {
        id: e.id,
        userId: e.userId,
        title: e.title,
        eventType: e.eventType,
        targetDate: e.targetDate.toISOString(),
        location: e.location,
        totalBudget: Number(e.totalBudget),
        currency: e.currency,
        guestCount: e.guestCount,
        themeNotes: e.themeNotes,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        userRole: role,
        collaborators: e.collaborators.map((c) => ({
          id: c.id,
          eventId: c.eventId,
          userId: c.userId,
          role: c.role,
          user: { id: c.user.id, name: c.user.name, email: c.user.email },
        })),
        budgetItems: e.budgetItems.map((b) => ({
          ...b,
          estimatedCost: Number(b.estimatedCost),
          actualCost: Number(b.actualCost),
          paidAmount: Number(b.paidAmount),
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
        timelineItems: e.timelineItems.map((t) => ({
          ...t,
          startTime: t.startTime.toISOString(),
          endTime: t.endTime.toISOString(),
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
        vendors: e.vendors.map((v) => ({
          ...v,
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        })),
        aiIdeas: e.aiIdeas.map((i) => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
        })),
      };
    } catch (e) {
      console.warn("DB getEventById failed, using memory store", e);
    }
  }

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev) return null;

  let role: CollaboratorRole = "VIEWER";
  if (userId) {
    if (ev.userId === userId) role = "OWNER";
    else {
      const c = ev.collaborators?.find((col) => col.userId === userId);
      if (c) role = c.role;
    }
  }

  return { ...ev, userRole: role };
}

export async function createEvent(userId: string, input: CreateEventInput): Promise<Event> {
  const newId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newEvent: Event = {
    id: newId,
    userId,
    title: input.title,
    eventType: input.eventType,
    targetDate: new Date(input.targetDate).toISOString(),
    location: input.location,
    totalBudget: input.totalBudget,
    currency: input.currency || "USD",
    guestCount: input.guestCount,
    themeNotes: input.themeNotes || "",
    createdAt: now,
    updatedAt: now,
    userRole: "OWNER",
    collaborators: [
      {
        id: `col_${Date.now()}`,
        eventId: newId,
        userId,
        role: "OWNER",
      },
    ],
    budgetItems: [],
    timelineItems: [],
    vendors: [],
    aiIdeas: [],
  };

  memEvents.unshift(newEvent);
  return newEvent;
}

export async function updateEvent(
  eventId: string,
  userId: string,
  updates: Partial<CreateEventInput>
): Promise<Event | null> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized to edit event");

  const evIndex = memEvents.findIndex((e) => e.id === eventId);
  if (evIndex === -1) return null;

  memEvents[evIndex] = {
    ...memEvents[evIndex],
    ...updates,
    targetDate: updates.targetDate ? new Date(updates.targetDate).toISOString() : memEvents[evIndex].targetDate,
    updatedAt: new Date().toISOString(),
  };

  return memEvents[evIndex];
}

export async function deleteEvent(eventId: string, userId: string): Promise<boolean> {
  const canDelete = await canUserAccessEvent(eventId, userId, "OWNER");
  if (!canDelete) throw new Error("Only event owners can delete this event");

  memEvents = memEvents.filter((e) => e.id !== eventId);
  return true;
}

// ==========================================
// BUDGET OPERATIONS
// ==========================================

export async function addBudgetItem(
  eventId: string,
  userId: string,
  input: BudgetItemInput
): Promise<BudgetItem> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev) throw new Error("Event not found");

  const newItem: BudgetItem = {
    id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    eventId,
    category: input.category,
    name: input.name,
    estimatedCost: input.estimatedCost,
    actualCost: input.actualCost || 0,
    paidAmount: input.paidAmount || 0,
    status: input.status,
    notes: input.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ev.budgetItems = [newItem, ...(ev.budgetItems || [])];
  return newItem;
}

export async function updateBudgetItem(
  itemId: string,
  eventId: string,
  userId: string,
  input: Partial<BudgetItemInput>
): Promise<BudgetItem | null> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev || !ev.budgetItems) return null;

  const itemIndex = ev.budgetItems.findIndex((b) => b.id === itemId);
  if (itemIndex === -1) return null;

  ev.budgetItems[itemIndex] = {
    ...ev.budgetItems[itemIndex],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  return ev.budgetItems[itemIndex];
}

export async function deleteBudgetItem(itemId: string, eventId: string, userId: string): Promise<boolean> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev || !ev.budgetItems) return false;

  ev.budgetItems = ev.budgetItems.filter((b) => b.id !== itemId);
  return true;
}

// ==========================================
// TIMELINE OPERATIONS
// ==========================================

export async function addTimelineItem(
  eventId: string,
  userId: string,
  input: TimelineItemInput
): Promise<TimelineItem> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev) throw new Error("Event not found");

  const newItem: TimelineItem = {
    id: `tml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    eventId,
    title: input.title,
    description: input.description,
    startTime: new Date(input.startTime).toISOString(),
    endTime: new Date(input.endTime).toISOString(),
    phase: input.phase,
    isCompleted: input.isCompleted || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ev.timelineItems = [...(ev.timelineItems || []), newItem].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  return newItem;
}

export async function updateTimelineItem(
  itemId: string,
  eventId: string,
  userId: string,
  input: Partial<TimelineItemInput>
): Promise<TimelineItem | null> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev || !ev.timelineItems) return null;

  const itemIndex = ev.timelineItems.findIndex((t) => t.id === itemId);
  if (itemIndex === -1) return null;

  ev.timelineItems[itemIndex] = {
    ...ev.timelineItems[itemIndex],
    ...input,
    startTime: input.startTime ? new Date(input.startTime).toISOString() : ev.timelineItems[itemIndex].startTime,
    endTime: input.endTime ? new Date(input.endTime).toISOString() : ev.timelineItems[itemIndex].endTime,
    updatedAt: new Date().toISOString(),
  };

  return ev.timelineItems[itemIndex];
}

export async function deleteTimelineItem(itemId: string, eventId: string, userId: string): Promise<boolean> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev || !ev.timelineItems) return false;

  ev.timelineItems = ev.timelineItems.filter((t) => t.id !== itemId);
  return true;
}

// ==========================================
// VENDOR OPERATIONS
// ==========================================

export async function addVendorItem(
  eventId: string,
  userId: string,
  input: VendorChecklistInput
): Promise<VendorChecklist> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev) throw new Error("Event not found");

  const newVendor: VendorChecklist = {
    id: `vnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    eventId,
    category: input.category,
    vendorName: input.vendorName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    contractUrl: input.contractUrl,
    notes: input.notes,
    status: input.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ev.vendors = [newVendor, ...(ev.vendors || [])];
  return newVendor;
}

export async function updateVendorItem(
  vendorId: string,
  eventId: string,
  userId: string,
  input: Partial<VendorChecklistInput>
): Promise<VendorChecklist | null> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev || !ev.vendors) return null;

  const itemIndex = ev.vendors.findIndex((v) => v.id === vendorId);
  if (itemIndex === -1) return null;

  ev.vendors[itemIndex] = {
    ...ev.vendors[itemIndex],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  return ev.vendors[itemIndex];
}

export async function deleteVendorItem(vendorId: string, eventId: string, userId: string): Promise<boolean> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev || !ev.vendors) return false;

  ev.vendors = ev.vendors.filter((v) => v.id !== vendorId);
  return true;
}

// ==========================================
// AI IDEA LOG OPERATIONS
// ==========================================

export async function addAIIdea(
  eventId: string,
  userId: string,
  category: AIIdeaLog["category"],
  content: string
): Promise<AIIdeaLog> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev) throw new Error("Event not found");

  const newIdea: AIIdeaLog = {
    id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    eventId,
    category,
    content,
    isFavorite: false,
    createdAt: new Date().toISOString(),
  };

  ev.aiIdeas = [newIdea, ...(ev.aiIdeas || [])];
  return newIdea;
}

export async function toggleFavoriteIdea(ideaId: string, eventId: string, userId: string): Promise<AIIdeaLog | null> {
  const canEdit = await canUserAccessEvent(eventId, userId, "COLLABORATOR");
  if (!canEdit) throw new Error("Unauthorized: collaborator or owner role required");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev || !ev.aiIdeas) return null;

  const idea = ev.aiIdeas.find((i) => i.id === ideaId);
  if (!idea) return null;

  idea.isFavorite = !idea.isFavorite;
  return idea;
}

// ==========================================
// COLLABORATOR OPERATIONS
// ==========================================

export async function addCollaborator(
  eventId: string,
  userId: string,
  collaboratorEmail: string,
  role: CollaboratorRole
) {
  const canManage = await canUserAccessEvent(eventId, userId, "OWNER");
  if (!canManage) throw new Error("Only the event owner can invite or update collaborators");

  const targetUser = await findUserByEmail(collaboratorEmail);
  if (!targetUser) throw new Error("No user found with this email");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev) throw new Error("Event not found");

  if (!ev.collaborators) ev.collaborators = [];

  const existingIndex = ev.collaborators.findIndex((c) => c.userId === targetUser.id);
  if (existingIndex !== -1) {
    ev.collaborators[existingIndex].role = role;
    return ev.collaborators[existingIndex];
  }

  const newCollab = {
    id: `col_${Date.now()}`,
    eventId,
    userId: targetUser.id,
    role,
    user: { id: targetUser.id, name: targetUser.name, email: targetUser.email },
  };

  ev.collaborators.push(newCollab);
  return newCollab;
}

export async function removeCollaborator(
  collaboratorId: string,
  eventId: string,
  userId: string
): Promise<boolean> {
  const canManage = await canUserAccessEvent(eventId, userId, "OWNER");
  if (!canManage) throw new Error("Only the event owner can remove collaborators");

  const ev = memEvents.find((e) => e.id === eventId);
  if (!ev || !ev.collaborators) return false;

  ev.collaborators = ev.collaborators.filter((c) => c.id !== collaboratorId);
  return true;
}
