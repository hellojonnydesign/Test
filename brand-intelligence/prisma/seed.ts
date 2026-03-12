import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

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
