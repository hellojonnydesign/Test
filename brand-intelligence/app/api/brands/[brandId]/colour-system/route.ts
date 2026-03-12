import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const data = await prisma.colourSystem.findUnique({
    where: { brandId },
    include: { palettes: { include: { colours: true }, orderBy: { order: "asc" } } },
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
    const cs = await tx.colourSystem.upsert({
      where: { brandId },
      create: {
        brandId,
        usageRules: body.usageRules ?? null,
        accessibilityNotes: body.accessibilityNotes ?? null,
        darkModeGuidance: body.darkModeGuidance ?? null,
      },
      update: {
        usageRules: body.usageRules ?? null,
        accessibilityNotes: body.accessibilityNotes ?? null,
        darkModeGuidance: body.darkModeGuidance ?? null,
      },
    });

    // Delete existing colours first, then palettes
    const existingPalettes = await tx.palette.findMany({
      where: { colourSystemId: cs.id },
      select: { id: true },
    });
    if (existingPalettes.length > 0) {
      await tx.colour.deleteMany({
        where: { paletteId: { in: existingPalettes.map((p) => p.id) } },
      });
      await tx.palette.deleteMany({ where: { colourSystemId: cs.id } });
    }

    // Recreate palettes with colours
    for (let i = 0; i < (body.palettes ?? []).length; i++) {
      const pal = body.palettes[i];
      await tx.palette.create({
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

    return tx.colourSystem.findUnique({
      where: { id: cs.id },
      include: { palettes: { include: { colours: true }, orderBy: { order: "asc" } } },
    });
  });

  return NextResponse.json(result);
}
