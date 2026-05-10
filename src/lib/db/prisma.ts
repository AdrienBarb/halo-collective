import { isProduction } from "@/utils/environments";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const createPrismaClient = () => {
  if (typeof window !== "undefined") {
    throw new Error(
      "PrismaClient is unable to run in this browser environment",
    );
  }

  const url = process.env.DATABASE_URL ?? "";
  const needsRelaxedTls = /[?&]sslmode=(require|no-verify)/i.test(url);
  const adapter = new PrismaPg({
    connectionString: url,
    ...(needsRelaxedTls ? { ssl: { rejectUnauthorized: false } } : {}),
  });
  return new PrismaClient({ adapter });
};

const prisma = globalForPrisma.prisma || createPrismaClient();

if (!isProduction && typeof window === "undefined") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
