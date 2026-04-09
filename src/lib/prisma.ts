import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as {
  prisma: any;
  pgPool: pg.Pool;
};

const url = process.env.DATABASE_URL || "";
const isAccelerate = url.startsWith("prisma://");

const createPrismaClient = () => {
  if (isAccelerate) {
    return new PrismaClient({
      // @ts-ignore
      datasources: { db: { url } },
    }).$extends(withAccelerate());
  }

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new pg.Pool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  const adapter = new PrismaPg(globalForPrisma.pgPool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;