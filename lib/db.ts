import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  console.log("=== Checking DATABASE_URL ===");

  // Check process.env
  console.log(
    "process.env.DATABASE_URL:",
    process.env.DATABASE_URL ? "FOUND" : "NOT FOUND"
  );
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // Debug: log all available env keys
  console.log("Available env keys:", Object.keys(process.env));

  // Check globalThis
  const allKeys = Object.keys(globalThis);
  console.log(
    "globalThis DATABASE keys:",
    allKeys.filter((k) => k.toUpperCase().includes("DATABASE"))
  );

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
