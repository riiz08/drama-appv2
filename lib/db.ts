import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

export function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL not found");
  }

  console.log("Creating fresh Prisma client...");
  const pool = new Pool({ connectionString });
  // @ts-ignore
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Export instance for convenience (tapi bisa gak reliable)
export const prisma = createPrismaClient();
