import "dotenv/config";
import { prisma } from "./lib/prisma.js";

try {
  await prisma.$connect();
  const result = await prisma.$queryRaw`SELECT 1`;

  console.log("Database connected successfully!");
  console.log(result);
} catch (error) {
  console.error("Database connection failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}