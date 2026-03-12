import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  const withProgress = brands.map((brand) => {
    const modules = [
      brand.logoSystem,
      brand.colourSystem,
      brand.typography,
      brand.photography,
      brand.illustration,
      brand.motion,
      brand.iconography,
      brand.gridLayout,
      brand.pattern,
      brand.brandVoice,
    ];
    const completedModules = modules.filter(Boolean).length;
    return { ...brand, completedModules, totalModules: 10 };
  });

  return NextResponse.json(withProgress);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.clientId) {
    return NextResponse.json({ error: "name and clientId are required" }, { status: 400 });
  }

  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const uniqueSlug = `${slug}-${Date.now()}`;

  const brand = await prisma.brand.create({
    data: {
      name: body.name,
      slug: uniqueSlug,
      description: body.description ?? null,
      clientId: body.clientId,
    },
    include: { client: true },
  });

  return NextResponse.json(brand, { status: 201 });
}
