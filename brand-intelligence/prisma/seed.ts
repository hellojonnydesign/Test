import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create agency
  const agency = await prisma.agency.upsert({
    where: { slug: "jkr-global" },
    update: {},
    create: {
      name: "JKR Global",
      slug: "jkr-global",
    },
  });
  console.log(`Agency: ${agency.name} (${agency.id})`);

  // Create admin user
  const passwordHash = await bcrypt.hash("changeme123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@jkr.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@jkr.com",
      passwordHash,
      role: "AGENCY_ADMIN",
      agencyId: agency.id,
    },
  });
  console.log(`Admin user: ${admin.email}`);
  console.log(`Password: changeme123  ← change this after first login`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
