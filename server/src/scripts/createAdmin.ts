
import "dotenv/config";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { prisma } from "../lib/prisma.js";

const rl = createInterface({ input, output });

try {
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = await rl.question("Admin password: ");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
    throw new Error("Enter a valid email and a password of 12–128 characters.");
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) throw new Error("This admin email already exists.");

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: { email, passwordHash },
  });

  console.log("Admin account created successfully!");
} catch (error) {
  console.error("Admin creation failed:", error);
  process.exitCode = 1;
} finally {
  rl.close();
  await prisma.$disconnect();
}
