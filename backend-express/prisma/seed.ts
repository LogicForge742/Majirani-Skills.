import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      password,
      name: "John Mwangi",
      role: "ARTISAN",
      artisan: {
        create: {
          skill: "Master Carpenter",
          location: "Nairobi East",
          experience: "15 years",
          verified: true,
          rating: 4.9,
        },
      },
    },
  });
  console.log("Seeded user:", user.email);
}

main().finally(() => prisma.$disconnect());
