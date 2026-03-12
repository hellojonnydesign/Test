import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { brands: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.agencyId) {
    return NextResponse.json({ error: "name and agencyId are required" }, { status: 400 });
  }

  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const uniqueSlug = `${slug}-${Date.now()}`;

  const client = await prisma.client.create({
    data: {
      name: body.name,
      slug: uniqueSlug,
      agencyId: body.agencyId,
    },
    include: { _count: { select: { brands: true } } },
  });

  return NextResponse.json(client, { status: 201 });
}
