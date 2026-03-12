import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.gridLayout.findUnique({ where: { brandId } });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const body = await req.json();

  const gridSystem = {
    columns: body.columns ?? "12",
    gutter: body.gutter ?? "24",
    margin: body.margin ?? "32",
    baseUnit: body.baseUnit ?? "8",
  };

  const data = await prisma.gridLayout.upsert({
    where: { brandId },
    create: {
      brandId,
      gridSystem,
      spacingScale: body.spacingScale ?? null,
      layoutPrinciples: body.layoutPrinciples ?? null,
      composition: body.composition ?? null,
      safeZones: body.safeZones ?? null,
    },
    update: {
      gridSystem,
      spacingScale: body.spacingScale ?? null,
      layoutPrinciples: body.layoutPrinciples ?? null,
      composition: body.composition ?? null,
      safeZones: body.safeZones ?? null,
    },
  });

  return NextResponse.json(data);
}
