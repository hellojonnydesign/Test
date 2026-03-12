import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.typography.findUnique({
    where: { brandId },
    include: { typefaces: { orderBy: { order: "asc" } } },
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
    const typography = await tx.typography.upsert({
      where: { brandId },
      create: {
        brandId,
        hierarchyRules: body.hierarchyRules ?? null,
        usageGuidelines: body.usageGuidelines ?? null,
        pairingRules: body.pairingRules ?? null,
      },
      update: {
        hierarchyRules: body.hierarchyRules ?? null,
        usageGuidelines: body.usageGuidelines ?? null,
        pairingRules: body.pairingRules ?? null,
      },
    });

    // Delete existing typefaces
    await tx.typeface.deleteMany({ where: { typographyId: typography.id } });

    // Recreate typefaces
    for (let i = 0; i < (body.typefaces ?? []).length; i++) {
      const tf = body.typefaces[i];
      await tx.typeface.create({
        data: {
          typographyId: typography.id,
          name: tf.name ?? "",
          role: tf.role ?? "PRIMARY",
          weights: tf.weights ?? [],
          source: tf.source ?? null,
          fontFileUrl: tf.fontFileUrl ?? null,
          licenseNote: tf.licenseNote ?? null,
          usageRules: tf.usageRules ?? null,
          fallbackStack: tf.fallbackStack ?? null,
          order: i,
        },
      });
    }

    return tx.typography.findUnique({
      where: { id: typography.id },
      include: { typefaces: { orderBy: { order: "asc" } } },
    });
  });

  return NextResponse.json(result);
}
