import { PrismaClient } from "@prisma/client";

let prisma;

async function init() {
  if (process.env.VERCEL) {
    const { NeonHTTPAdapter } = await import("@prisma/adapter-neon");
    const { Pool } = await import("neon-serverless");

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new NeonHTTPAdapter({ pool });

    prisma = new PrismaClient({
      adapter,
    });
  } else {
    prisma = new PrismaClient();
  }
}

await init();

export { prisma };
