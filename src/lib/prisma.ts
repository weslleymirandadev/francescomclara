import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: any };

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL || "";
  const isAccelerate = url.startsWith("prisma://");

  if (isAccelerate) {
    return new PrismaClient({
      // @ts-ignore
      datasources: {
        db: {
          url: url,
        },
      },
    }).$extends(withAccelerate());
  }

  const pool = new pg.Pool({ 
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;