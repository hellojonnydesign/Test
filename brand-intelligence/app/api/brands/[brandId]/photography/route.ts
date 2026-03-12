import { NextRequest, NextResponse } from "next/server";
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
  const data = await prisma.photography.findUnique({ where: { brandId } });
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
    composition: body.composition ? { value: body.composition } : undefined,
    colourTreatment: body.colourTreatment ? { value: body.colourTreatment } : undefined,
    lighting: body.lighting ? { value: body.lighting } : undefined,
    subjects: body.subjects ? { value: body.subjects } : undefined,
  };

  const data = await prisma.photography.upsert({
    where: { brandId },
    create: {
      brandId,
      style: body.style ?? null,
      mood: body.mood ?? null,
      ...jsonFields,
      postProcessing: body.postProcessing ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
      moodboardUrls: body.moodboardUrls ?? [],
    },
    update: {
      style: body.style ?? null,
      mood: body.mood ?? null,
      ...jsonFields,
      postProcessing: body.postProcessing ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
      moodboardUrls: body.moodboardUrls ?? [],
    },
  });

  return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
