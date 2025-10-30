import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  console.log("=== DATABASE_URL Check ===");
  const dbUrl = process.env.DATABASE_URL;
  console.log("Type:", typeof dbUrl);
  console.log("Value length:", dbUrl?.length);
  console.log("Value preview:", dbUrl?.substring(0, 30)); // First 30 chars only

  if (!dbUrl || dbUrl.trim() === "") {
    throw new Error("DATABASE_URL is empty or undefined");
  }

  return dbUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const connectionString = getDatabaseUrl();
    console.log(
      "Creating Pool with connection string length:",
      connectionString.length
    );

    const pool = new Pool({ connectionString });
    console.log("Pool created successfully");

    // @ts-ignore
    const adapter = new PrismaNeon(pool);
    console.log("Adapter created successfully");

    const client = new PrismaClient({ adapter });
    console.log("PrismaClient created successfully");

    return client;
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
