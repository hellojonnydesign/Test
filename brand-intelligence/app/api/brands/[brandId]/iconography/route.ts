import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.iconography.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const body = await req.json();

  const data = await prisma.iconography.upsert({
    where: { brandId },
    create: {
      brandId,
      style: body.style ?? null,
      gridSize: body.gridSize ? parseInt(body.gridSize) : null,
      strokeWeight: body.strokeWeight ?? null,
      cornerRadius: body.cornerRadius ?? null,
      colourUsage: body.colourUsage ?? null,
      opticalSizing: body.opticalSizing ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
    },
    update: {
      style: body.style ?? null,
      gridSize: body.gridSize ? parseInt(body.gridSize) : null,
      strokeWeight: body.strokeWeight ?? null,
      cornerRadius: body.cornerRadius ?? null,
      colourUsage: body.colourUsage ?? null,
      opticalSizing: body.opticalSizing ?? null,
      doList: body.doList ?? [],
      dontList: body.dontList ?? [],
    },
  });

  return NextResponse.json(data);
}
