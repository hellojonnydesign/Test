import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.brandVoice.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const body = await req.json();

  const data = await prisma.brandVoice.upsert({
    where: { brandId },
    create: {
      brandId,
      personality: body.personality ?? null,
      toneVariants: body.toneVariants ?? null,
      messagingHierarchy: body.messagingHierarchy ?? null,
      languageRules: body.languageRules ?? null,
      vocabulary: body.vocabulary ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
      exampleCopy: body.exampleCopy ?? null,
    },
    update: {
      personality: body.personality ?? null,
      toneVariants: body.toneVariants ?? null,
      messagingHierarchy: body.messagingHierarchy ?? null,
      languageRules: body.languageRules ?? null,
      vocabulary: body.vocabulary ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
      exampleCopy: body.exampleCopy ?? null,
    },
  });

  return NextResponse.json(data);
}
