import { cookies, headers } from "next/headers";
import { verifyJwtToken, TokenPayload } from "./jwt";
import { findUserById } from "../db/repository";
import { User } from "@/types";

export const COOKIE_NAME = "eventgenius_session";

// Default demo session user for seamless zero-setup testing
const DEFAULT_DEMO_USER: User = {
  id: "usr_elena_001",
  name: "Elena Rostova",
  email: "elena@eventgenius.io",
  createdAt: "2025-01-10T10:00:00.000Z",
};

export async function getCurrentUser(): Promise<User> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      const decoded = verifyJwtToken(token);
      if (decoded) {
        const dbUser = await findUserById(decoded.userId);
        if (dbUser) return dbUser;
      }
    }

    // Check Authorization header as well
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearerToken = authHeader.substring(7);
      const decoded = verifyJwtToken(bearerToken);
      if (decoded) {
        const dbUser = await findUserById(decoded.userId);
        if (dbUser) return dbUser;
      }
    }
  } catch (error) {
    // Return default demo user if reading cookies fails in static or SSR environments
  }

  return DEFAULT_DEMO_USER;
}
