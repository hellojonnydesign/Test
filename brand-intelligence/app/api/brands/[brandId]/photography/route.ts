import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.photography.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const body = await req.json();

  const data = await prisma.photography.upsert({
    where: { brandId },
    create: {
      brandId,
      style: body.style ?? null,
      mood: body.mood ?? null,
      composition: body.composition ? { value: body.composition } : null,
      colourTreatment: body.colourTreatment ? { value: body.colourTreatment } : null,
      lighting: body.lighting ? { value: body.lighting } : null,
      subjects: body.subjects ? { value: body.subjects } : null,
      postProcessing: body.postProcessing ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
    },
    update: {
      style: body.style ?? null,
      mood: body.mood ?? null,
      composition: body.composition ? { value: body.composition } : null,
      colourTreatment: body.colourTreatment ? { value: body.colourTreatment } : null,
      lighting: body.lighting ? { value: body.lighting } : null,
      subjects: body.subjects ? { value: body.subjects } : null,
      postProcessing: body.postProcessing ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
    },
  });

  return NextResponse.json(data);
}
