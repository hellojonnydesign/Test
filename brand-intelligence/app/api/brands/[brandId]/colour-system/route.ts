import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession(req);
  if (error) return error;
  try {
    const { brandId } = await params;
    const data = await prisma.colourSystem.findUnique({
      where: { brandId },
      include: { palettes: { include: { colours: true }, orderBy: { order: "asc" } } },
    });
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

    const cs = await prisma.colourSystem.upsert({
      where: { brandId },
      create: { brandId, usageRules: body.usageRules ?? null, accessibilityNotes: body.accessibilityNotes ?? null, darkModeGuidance: body.darkModeGuidance ?? null },
      update: { usageRules: body.usageRules ?? null, accessibilityNotes: body.accessibilityNotes ?? null, darkModeGuidance: body.darkModeGuidance ?? null },
    });

    const existingPalettes = await prisma.palette.findMany({ where: { colourSystemId: cs.id }, select: { id: true } });
    if (existingPalettes.length > 0) {
      await prisma.colour.deleteMany({ where: { paletteId: { in: existingPalettes.map((p) => p.id) } } });
      await prisma.palette.deleteMany({ where: { colourSystemId: cs.id } });
    }

    for (let i = 0; i < (body.palettes ?? []).length; i++) {
      const pal = body.palettes[i];
      await prisma.palette.create({
        data: {
          colourSystemId: cs.id,
          name: pal.name ?? "",
          role: pal.role ?? null,
          order: i,
          colours: {
            create: (pal.colours ?? []).map(
              (c: { name: string; hex: string; pantone?: string; cmyk?: string; usageNote?: string; isPrimary?: boolean }, j: number) => ({
                name: c.name ?? "",
                hex: c.hex ?? "#000000",
                rgb: hexToRgb(c.hex ?? "#000000"),
                pantone: c.pantone ?? null,
                cmyk: c.cmyk ? { value: c.cmyk } : null,
                usageNote: c.usageNote ?? null,
                isPrimary: c.isPrimary ?? false,
                order: j,
              })
            ),
          },
        },
      });
    }

    const result = await prisma.colourSystem.findUnique({
      where: { id: cs.id },
      include: { palettes: { include: { colours: true }, orderBy: { order: "asc" } } },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
