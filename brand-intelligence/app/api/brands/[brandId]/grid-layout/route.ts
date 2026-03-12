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
  const data = await prisma.gridLayout.findUnique({ where: { brandId } });
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
      spacingScale: body.spacingScale ?? undefined,
      layoutPrinciples: body.layoutPrinciples ?? null,
      composition: body.composition ?? null,
      safeZones: body.safeZones ?? null,
    },
    update: {
      gridSystem,
      spacingScale: body.spacingScale ?? undefined,
      layoutPrinciples: body.layoutPrinciples ?? null,
      composition: body.composition ?? null,
      safeZones: body.safeZones ?? null,
    },
  });

  return NextResponse.json(data);
}
