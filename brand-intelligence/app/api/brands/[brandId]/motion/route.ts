import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.motion.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const body = await req.json();

  const data = await prisma.motion.upsert({
    where: { brandId },
    create: {
      brandId,
      principles: body.principles ?? null,
      character: body.character ?? null,
      easingCurves: body.easingCurves ?? null,
      durationTokens: body.durationTokens ?? null,
      transitionTypes: body.transitionTypes ?? null,
      logoAnimation: body.logoAnimation ?? null,
      typographyAnim: body.typographyAnim ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
    },
    update: {
      principles: body.principles ?? null,
      character: body.character ?? null,
      easingCurves: body.easingCurves ?? null,
      durationTokens: body.durationTokens ?? null,
      transitionTypes: body.transitionTypes ?? null,
      logoAnimation: body.logoAnimation ?? null,
      typographyAnim: body.typographyAnim ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
    },
  });

  return NextResponse.json(data);
}
