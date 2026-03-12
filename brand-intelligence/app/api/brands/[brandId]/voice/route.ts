import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { brandId } = await params;
  const data = await prisma.brandVoice.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { brandId } = await params;
  const body = await req.json();

  // Json? fields require undefined (not null) in Prisma 7
  const jsonFields = {
    personality: body.personality ?? undefined,
    toneVariants: body.toneVariants ?? undefined,
    messagingHierarchy: body.messagingHierarchy ?? undefined,
    languageRules: body.languageRules ?? undefined,
    vocabulary: body.vocabulary ?? undefined,
    exampleCopy: body.exampleCopy ?? undefined,
  };

  const data = await prisma.brandVoice.upsert({
    where: { brandId },
    create: {
      brandId,
      ...jsonFields,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
    },
    update: {
      ...jsonFields,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
    },
  });

  return NextResponse.json(data);
}
