import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fungsi helper untuk dapetin env dari platform
function getDatabaseUrl(): string {
  // Try different ways to get env
  // @ts-ignore - Cloudflare env binding
  if (typeof DATABASE_URL !== "undefined") return DATABASE_URL;

  // Fallback ke process.env (untuk local dev)
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  throw new Error("DATABASE_URL not found in environment");
}

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const connectionString = getDatabaseUrl();
    const pool = new Pool({ connectionString });
    // @ts-ignore
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
