import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.logoSystem.findUnique({
    where: { brandId },
    include: { assets: true },
  });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const body = await req.json();

  const result = await prisma.$transaction(async (tx) => {
    const logoSystem = await tx.logoSystem.upsert({
      where: { brandId },
      create: {
        brandId,
        clearSpaceRule: body.clearSpaceRule ?? null,
        minimumSizePx: body.minimumSizePx ? parseInt(body.minimumSizePx) : null,
        minimumSizeMm: body.minimumSizeMm ? parseFloat(body.minimumSizeMm) : null,
        usageRules: body.usageRules ?? null,
        restrictions: body.restrictions ?? null,
        backgroundUsage: body.backgroundUsage ?? null,
      },
      update: {
        clearSpaceRule: body.clearSpaceRule ?? null,
        minimumSizePx: body.minimumSizePx ? parseInt(body.minimumSizePx) : null,
        minimumSizeMm: body.minimumSizeMm ? parseFloat(body.minimumSizeMm) : null,
        usageRules: body.usageRules ?? null,
        restrictions: body.restrictions ?? null,
        backgroundUsage: body.backgroundUsage ?? null,
      },
    });

    // Delete existing assets (metadata only — no actual files stored yet)
    await tx.logoAsset.deleteMany({ where: { logoSystemId: logoSystem.id } });

    // Recreate asset metadata
    for (const asset of body.assets ?? []) {
      await tx.logoAsset.create({
        data: {
          logoSystemId: logoSystem.id,
          name: asset.name ?? "",
          type: asset.type ?? "PRIMARY",
          variant: asset.variant ?? "FULL_COLOUR",
          fileUrl: asset.fileUrl ?? "",
          format: asset.format ?? "SVG",
          usageNote: asset.usageNote ?? null,
        },
      });
    }

    return tx.logoSystem.findUnique({
      where: { id: logoSystem.id },
      include: { assets: true },
    });
  });

  return NextResponse.json(result);
}
