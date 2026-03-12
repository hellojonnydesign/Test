import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.pattern.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const body = await req.json();

  const data = await prisma.pattern.upsert({
    where: { brandId },
    create: {
      brandId,
      graphicDevices: body.graphicDevices ?? null,
      patternStyle: body.patternStyle ?? null,
      textureNotes: body.textureNotes ?? null,
      usageRules: body.usageRules ?? null,
      colourVariants: body.colourVariants ?? null,
    },
    update: {
      graphicDevices: body.graphicDevices ?? null,
      patternStyle: body.patternStyle ?? null,
      textureNotes: body.textureNotes ?? null,
      usageRules: body.usageRules ?? null,
      colourVariants: body.colourVariants ?? null,
    },
  });

  return NextResponse.json(data);
}
