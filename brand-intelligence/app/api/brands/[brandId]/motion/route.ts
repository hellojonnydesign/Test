import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession(req);
  if (error) return error;

  const { brandId } = await params;
  const data = await prisma.motion.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession(req);
  if (error) return error;


  try {

  const { brandId } = await params;
  const body = await req.json();

  const jsonFields = {
    easingCurves: body.easingCurves != null ? (body.easingCurves as Prisma.InputJsonValue) : Prisma.JsonNull,
    durationTokens: body.durationTokens != null ? (body.durationTokens as Prisma.InputJsonValue) : Prisma.JsonNull,
    transitionTypes: body.transitionTypes != null ? (body.transitionTypes as Prisma.InputJsonValue) : Prisma.JsonNull,
  };

  const data = await prisma.motion.upsert({
    where: { brandId },
    create: {
      brandId,
      principles: body.principles ?? null,
      character: body.character ?? null,
      ...jsonFields,
      logoAnimation: body.logoAnimation ?? null,
      typographyAnim: body.typographyAnim ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
      referenceUrls: body.referenceUrls ?? [],
    },
    update: {
      principles: body.principles ?? null,
      character: body.character ?? null,
      ...jsonFields,
      logoAnimation: body.logoAnimation ?? null,
      typographyAnim: body.typographyAnim ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
      referenceUrls: body.referenceUrls ?? [],
    },
  });

  return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
