import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required to initialize Prisma.");
}

// pg currently treats these modes as verify-full and warns that their meaning
// will change in the next major version. Make the intended behavior explicit.
const connectionString = databaseUrl.replace(
  /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/i,
  "$1verify-full",
);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
