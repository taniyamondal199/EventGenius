import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 EventGenius Database Seeder Starting...");

  // Check connection
  try {
    await prisma.$connect();
    console.log("✅ Database connection established.");
  } catch (error) {
    console.warn("⚠️ Database connection skipped (PostgreSQL not reachable or not running). Memory store remains active.");
    return;
  }

  // 1. Create Users
  const user1 = await prisma.user.upsert({
    where: { email: "elena@eventgenius.io" },
    update: {},
    create: {
      id: "usr_elena_001",
      email: "elena@eventgenius.io",
      name: "Elena Rostova",
      passwordHash: "$2a$10$7hXn4p7Q/m1bV3X1k7x6O.c8mQ8bH4tY3qWbLw8.n8.eX5n.KqH.m",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "marcus@eventgenius.io" },
    update: {},
    create: {
      id: "usr_marcus_002",
      email: "marcus@eventgenius.io",
      name: "Marcus Vance",
      passwordHash: "$2a$10$7hXn4p7Q/m1bV3X1k7x6O.c8mQ8bH4tY3qWbLw8.n8.eX5n.KqH.m",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "sophie@eventgenius.io" },
    update: {},
    create: {
      id: "usr_sophie_003",
      email: "sophie@eventgenius.io",
      name: "Sophie Chen",
      passwordHash: "$2a$10$7hXn4p7Q/m1bV3X1k7x6O.c8mQ8bH4tY3qWbLw8.n8.eX5n.KqH.m",
    },
  });

  console.log("✅ Seeded users:", [user1.email, user2.email, user3.email]);

  // 2. Create Wedding Event
  const wedding = await prisma.event.upsert({
    where: { id: "evt_wedding_001" },
    update: {},
    create: {
      id: "evt_wedding_001",
      userId: user1.id,
      title: "Elena & Marcus's Vineyard Wedding",
      eventType: "WEDDING",
      targetDate: new Date("2026-06-20T16:00:00.000Z"),
      location: "Meadowood Estate & Vineyards, St. Helena, Napa Valley, CA",
      totalBudget: 65000,
      currency: "USD",
      guestCount: 140,
      themeNotes: "Warm Tuscan botanical romance with olive branches, terracotta tones, and candlelight.",
    },
  });

  console.log("✅ Seeded event:", wedding.title);
  console.log("🎉 Seeding complete successfully.");
}

main()
  .catch((e) => {
    console.error("Seed script error:", e);
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
