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
  try {
    const { brandId } = await params;
    const data = await prisma.logoSystem.findUnique({ where: { brandId }, include: { assets: true } });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
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

    const logoSystem = await prisma.logoSystem.upsert({
      where: { brandId },
      create: { brandId, clearSpaceRule: body.clearSpaceRule ?? null, minimumSizePx: body.minimumSizePx ? parseInt(body.minimumSizePx) : null, minimumSizeMm: body.minimumSizeMm ? parseFloat(body.minimumSizeMm) : null, usageRules: body.usageRules ?? null, restrictions: body.restrictions ?? null, backgroundUsage: body.backgroundUsage ?? null },
      update: { clearSpaceRule: body.clearSpaceRule ?? null, minimumSizePx: body.minimumSizePx ? parseInt(body.minimumSizePx) : null, minimumSizeMm: body.minimumSizeMm ? parseFloat(body.minimumSizeMm) : null, usageRules: body.usageRules ?? null, restrictions: body.restrictions ?? null, backgroundUsage: body.backgroundUsage ?? null },
    });

    await prisma.logoAsset.deleteMany({ where: { logoSystemId: logoSystem.id } });

    for (const asset of body.assets ?? []) {
      await prisma.logoAsset.create({
        data: { logoSystemId: logoSystem.id, name: asset.name ?? "", type: asset.type ?? "PRIMARY", variant: asset.variant ?? "FULL_COLOUR", fileUrl: asset.fileUrl ?? "", format: asset.format ?? "SVG", usageNote: asset.usageNote ?? null },
      });
    }

    const result = await prisma.logoSystem.findUnique({ where: { id: logoSystem.id }, include: { assets: true } });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
