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
  const data = await prisma.illustration.findUnique({ where: { brandId } });
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

  const data = await prisma.illustration.upsert({
    where: { brandId },
    create: {
      brandId,
      style: body.style ?? null,
      technique: body.technique ?? null,
      lineWeight: body.lineWeight ?? null,
      colourPalette: body.colourPalette ?? null,
      colourApplication: body.colourApplication ? { value: body.colourApplication } : null,
      subjects: body.subjects ? { value: body.subjects } : null,
      perspective: body.perspective ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
      referenceUrls: body.referenceUrls ?? [],
    },
    update: {
      style: body.style ?? null,
      technique: body.technique ?? null,
      lineWeight: body.lineWeight ?? null,
      colourPalette: body.colourPalette ?? null,
      colourApplication: body.colourApplication ? { value: body.colourApplication } : null,
      subjects: body.subjects ? { value: body.subjects } : null,
      perspective: body.perspective ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
      referenceUrls: body.referenceUrls ?? [],
    },
  });

  return NextResponse.json(data);
}
