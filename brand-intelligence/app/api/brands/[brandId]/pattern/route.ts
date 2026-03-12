import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { brandId } = await params;
  const data = await prisma.pattern.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;


  try {

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
      colourVariants: body.colourVariants ?? undefined,
    },
    update: {
      graphicDevices: body.graphicDevices ?? null,
      patternStyle: body.patternStyle ?? null,
      textureNotes: body.textureNotes ?? null,
      usageRules: body.usageRules ?? null,
      colourVariants: body.colourVariants ?? undefined,
    },
  });

  return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
