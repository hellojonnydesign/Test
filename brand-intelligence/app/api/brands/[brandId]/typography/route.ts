import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;
  try {
    const { brandId } = await params;
    const data = await prisma.typography.findUnique({ where: { brandId }, include: { typefaces: { orderBy: { order: "asc" } } } });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;
  try {
    const { brandId } = await params;
    const body = await req.json();

    const typography = await prisma.typography.upsert({
      where: { brandId },
      create: { brandId, hierarchyRules: body.hierarchyRules ?? null, usageGuidelines: body.usageGuidelines ?? null, pairingRules: body.pairingRules ?? null },
      update: { hierarchyRules: body.hierarchyRules ?? null, usageGuidelines: body.usageGuidelines ?? null, pairingRules: body.pairingRules ?? null },
    });

    await prisma.typeface.deleteMany({ where: { typographyId: typography.id } });

    for (let i = 0; i < (body.typefaces ?? []).length; i++) {
      const tf = body.typefaces[i];
      await prisma.typeface.create({
        data: { typographyId: typography.id, name: tf.name ?? "", role: tf.role ?? "PRIMARY", weights: tf.weights ?? [], source: tf.source ?? null, fontFileUrl: tf.fontFileUrl ?? null, licenseNote: tf.licenseNote ?? null, usageRules: tf.usageRules ?? null, fallbackStack: tf.fallbackStack ?? null, order: i },
      });
    }

    const result = await prisma.typography.findUnique({ where: { id: typography.id }, include: { typefaces: { orderBy: { order: "asc" } } } });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
