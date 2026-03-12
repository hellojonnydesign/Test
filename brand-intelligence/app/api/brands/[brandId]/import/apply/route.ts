import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

type Extracted = Record<string, unknown>;

function str(val: unknown): string | undefined {
  return typeof val === "string" ? val : undefined;
}

function strArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string");
  return [];
}

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { brandId } = await params;
  const { extracted } = (await req.json()) as { extracted: Extracted };

  if (!extracted || typeof extracted !== "object") {
    return NextResponse.json({ error: "No extracted data provided" }, { status: 400 });
  }

  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { id: true },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const applied: string[] = [];

  await prisma.$transaction(async (tx) => {
    // ── Logo System ──────────────────────────────────────────────────────────
    if (extracted.logoSystem && typeof extracted.logoSystem === "object") {
      const ls = extracted.logoSystem as Record<string, unknown>;
      await tx.logoSystem.upsert({
        where: { brandId },
        create: {
          brandId,
          clearSpaceRule: str(ls.clearSpaceRule),
          usageRules: str(ls.usageRules),
          restrictions: str(ls.restrictions),
          backgroundUsage: str(ls.backgroundUsage),
        },
        update: {
          ...(ls.clearSpaceRule !== undefined && { clearSpaceRule: str(ls.clearSpaceRule) }),
          ...(ls.usageRules !== undefined && { usageRules: str(ls.usageRules) }),
          ...(ls.restrictions !== undefined && { restrictions: str(ls.restrictions) }),
          ...(ls.backgroundUsage !== undefined && { backgroundUsage: str(ls.backgroundUsage) }),
        },
      });
      applied.push("logoSystem");
    }

    // ── Colour System ────────────────────────────────────────────────────────
    if (extracted.colourSystem && typeof extracted.colourSystem === "object") {
      const cs = extracted.colourSystem as Record<string, unknown>;
      const palettes = Array.isArray(cs.palettes) ? cs.palettes : [];

      // Delete existing colours and palettes
      const existingSystem = await tx.colourSystem.findUnique({
        where: { brandId },
        include: { palettes: { include: { colours: true } } },
      });
      if (existingSystem) {
        for (const p of existingSystem.palettes) {
          await tx.colour.deleteMany({ where: { paletteId: p.id } });
        }
        await tx.palette.deleteMany({ where: { colourSystemId: existingSystem.id } });
      }

      const colourSystem = await tx.colourSystem.upsert({
        where: { brandId },
        create: {
          brandId,
          usageRules: str(cs.usageRules),
          accessibilityNotes: str(cs.accessibilityNotes),
        },
        update: {
          ...(cs.usageRules !== undefined && { usageRules: str(cs.usageRules) }),
          ...(cs.accessibilityNotes !== undefined && { accessibilityNotes: str(cs.accessibilityNotes) }),
        },
      });

      for (let pi = 0; pi < palettes.length; pi++) {
        const p = palettes[pi] as Record<string, unknown>;
        const colours = Array.isArray(p.colours) ? p.colours : [];
        const palette = await tx.palette.create({
          data: {
            colourSystemId: colourSystem.id,
            name: str(p.name) || `Palette ${pi + 1}`,
            role: str(p.role),
            order: pi,
          },
        });
        for (let ci = 0; ci < colours.length; ci++) {
          const c = colours[ci] as Record<string, unknown>;
          const hex = str(c.hex) || "#000000";
          await tx.colour.create({
            data: {
              paletteId: palette.id,
              name: str(c.name) || `Colour ${ci + 1}`,
              hex,
              rgb: hexToRgb(hex),
              pantone: str(c.pantone),
              usageNote: str(c.usageNote),
              isPrimary: Boolean(c.isPrimary),
              order: ci,
            },
          });
        }
      }
      applied.push("colourSystem");
    }

    // ── Typography ───────────────────────────────────────────────────────────
    if (extracted.typography && typeof extracted.typography === "object") {
      const ty = extracted.typography as Record<string, unknown>;
      const typefaces = Array.isArray(ty.typefaces) ? ty.typefaces : [];

      const existingTyp = await tx.typography.findUnique({
        where: { brandId },
        include: { typefaces: true },
      });
      if (existingTyp) {
        await tx.typeface.deleteMany({ where: { typographyId: existingTyp.id } });
      }

      const validRoles = ["PRIMARY", "SECONDARY", "DISPLAY", "BODY", "ACCENT", "MONOSPACE", "EDITORIAL"];
      const typography = await tx.typography.upsert({
        where: { brandId },
        create: {
          brandId,
          hierarchyRules: str(ty.hierarchyRules),
          usageGuidelines: str(ty.usageGuidelines),
          pairingRules: str(ty.pairingRules),
        },
        update: {
          ...(ty.hierarchyRules !== undefined && { hierarchyRules: str(ty.hierarchyRules) }),
          ...(ty.usageGuidelines !== undefined && { usageGuidelines: str(ty.usageGuidelines) }),
          ...(ty.pairingRules !== undefined && { pairingRules: str(ty.pairingRules) }),
        },
      });

      for (let ti = 0; ti < typefaces.length; ti++) {
        const tf = typefaces[ti] as Record<string, unknown>;
        const role = validRoles.includes(String(tf.role).toUpperCase())
          ? (String(tf.role).toUpperCase() as "PRIMARY" | "SECONDARY" | "DISPLAY" | "BODY" | "ACCENT" | "MONOSPACE" | "EDITORIAL")
          : "PRIMARY";
        await tx.typeface.create({
          data: {
            typographyId: typography.id,
            name: str(tf.name) || `Typeface ${ti + 1}`,
            role,
            weights: strArray(tf.weights),
            source: str(tf.source),
            fallbackStack: str(tf.fallbackStack),
            usageRules: str(tf.usageRules),
            licenseNote: str(tf.licenseNote),
            order: ti,
          },
        });
      }
      applied.push("typography");
    }

    // ── Photography ──────────────────────────────────────────────────────────
    if (extracted.photography && typeof extracted.photography === "object") {
      const ph = extracted.photography as Record<string, unknown>;
      await tx.photography.upsert({
        where: { brandId },
        create: {
          brandId,
          style: str(ph.style),
          mood: str(ph.mood),
          postProcessing: str(ph.postProcessing),
          doList: strArray(ph.doList),
          dontList: strArray(ph.dontList),
        },
        update: {
          ...(ph.style !== undefined && { style: str(ph.style) }),
          ...(ph.mood !== undefined && { mood: str(ph.mood) }),
          ...(ph.postProcessing !== undefined && { postProcessing: str(ph.postProcessing) }),
          ...(ph.doList !== undefined && { doList: strArray(ph.doList) }),
          ...(ph.dontList !== undefined && { dontList: strArray(ph.dontList) }),
        },
      });
      applied.push("photography");
    }

    // ── Illustration ─────────────────────────────────────────────────────────
    if (extracted.illustration && typeof extracted.illustration === "object") {
      const il = extracted.illustration as Record<string, unknown>;
      await tx.illustration.upsert({
        where: { brandId },
        create: {
          brandId,
          style: str(il.style),
          technique: str(il.technique),
          lineWeight: str(il.lineWeight),
          colourPalette: str(il.colourPalette),
          perspective: str(il.perspective),
          doList: strArray(il.doList),
          dontList: strArray(il.dontList),
        },
        update: {
          ...(il.style !== undefined && { style: str(il.style) }),
          ...(il.technique !== undefined && { technique: str(il.technique) }),
          ...(il.lineWeight !== undefined && { lineWeight: str(il.lineWeight) }),
          ...(il.colourPalette !== undefined && { colourPalette: str(il.colourPalette) }),
          ...(il.perspective !== undefined && { perspective: str(il.perspective) }),
          ...(il.doList !== undefined && { doList: strArray(il.doList) }),
          ...(il.dontList !== undefined && { dontList: strArray(il.dontList) }),
        },
      });
      applied.push("illustration");
    }

    // ── Motion ───────────────────────────────────────────────────────────────
    if (extracted.motion && typeof extracted.motion === "object") {
      const mo = extracted.motion as Record<string, unknown>;
      await tx.motion.upsert({
        where: { brandId },
        create: {
          brandId,
          principles: str(mo.principles),
          character: str(mo.character),
          easingCurves: mo.easingCurves as Prisma.InputJsonValue ?? undefined,
          durationTokens: mo.durationTokens as Prisma.InputJsonValue ?? undefined,
          transitionTypes: mo.transitionTypes as Prisma.InputJsonValue ?? undefined,
          doList: strArray(mo.doList),
          dontList: strArray(mo.dontList),
        },
        update: {
          ...(mo.principles !== undefined && { principles: str(mo.principles) }),
          ...(mo.character !== undefined && { character: str(mo.character) }),
          ...(mo.easingCurves !== undefined && { easingCurves: mo.easingCurves as Prisma.InputJsonValue }),
          ...(mo.durationTokens !== undefined && { durationTokens: mo.durationTokens as Prisma.InputJsonValue }),
          ...(mo.transitionTypes !== undefined && { transitionTypes: mo.transitionTypes as Prisma.InputJsonValue }),
          ...(mo.doList !== undefined && { doList: strArray(mo.doList) }),
          ...(mo.dontList !== undefined && { dontList: strArray(mo.dontList) }),
        },
      });
      applied.push("motion");
    }

    // ── Iconography ──────────────────────────────────────────────────────────
    if (extracted.iconography && typeof extracted.iconography === "object") {
      const ic = extracted.iconography as Record<string, unknown>;
      const gridSize = ic.gridSize != null ? parseInt(String(ic.gridSize), 10) : undefined;
      await tx.iconography.upsert({
        where: { brandId },
        create: {
          brandId,
          style: str(ic.style),
          gridSize: Number.isNaN(gridSize) ? undefined : gridSize,
          strokeWeight: str(ic.strokeWeight),
          cornerRadius: str(ic.cornerRadius),
          colourUsage: str(ic.colourUsage),
          doList: strArray(ic.doList),
          dontList: strArray(ic.dontList),
        },
        update: {
          ...(ic.style !== undefined && { style: str(ic.style) }),
          ...(gridSize !== undefined && !Number.isNaN(gridSize) && { gridSize }),
          ...(ic.strokeWeight !== undefined && { strokeWeight: str(ic.strokeWeight) }),
          ...(ic.cornerRadius !== undefined && { cornerRadius: str(ic.cornerRadius) }),
          ...(ic.colourUsage !== undefined && { colourUsage: str(ic.colourUsage) }),
          ...(ic.doList !== undefined && { doList: strArray(ic.doList) }),
          ...(ic.dontList !== undefined && { dontList: strArray(ic.dontList) }),
        },
      });
      applied.push("iconography");
    }

    // ── Grid Layout ──────────────────────────────────────────────────────────
    if (extracted.gridLayout && typeof extracted.gridLayout === "object") {
      const gl = extracted.gridLayout as Record<string, unknown>;
      await tx.gridLayout.upsert({
        where: { brandId },
        create: {
          brandId,
          gridSystem: (gl.gridSystem ?? gl) as Prisma.InputJsonValue,
          layoutPrinciples: str(gl.layoutPrinciples),
          composition: str(gl.composition),
          safeZones: str(gl.safeZones),
        },
        update: {
          ...(gl.gridSystem !== undefined && { gridSystem: gl.gridSystem as Prisma.InputJsonValue }),
          ...(gl.layoutPrinciples !== undefined && { layoutPrinciples: str(gl.layoutPrinciples) }),
          ...(gl.composition !== undefined && { composition: str(gl.composition) }),
          ...(gl.safeZones !== undefined && { safeZones: str(gl.safeZones) }),
        },
      });
      applied.push("gridLayout");
    }

    // ── Pattern ──────────────────────────────────────────────────────────────
    if (extracted.pattern && typeof extracted.pattern === "object") {
      const pt = extracted.pattern as Record<string, unknown>;
      await tx.pattern.upsert({
        where: { brandId },
        create: {
          brandId,
          patternStyle: str(pt.patternStyle),
          graphicDevices: str(pt.graphicDevices),
          textureNotes: str(pt.textureNotes),
          usageRules: str(pt.usageRules),
        },
        update: {
          ...(pt.patternStyle !== undefined && { patternStyle: str(pt.patternStyle) }),
          ...(pt.graphicDevices !== undefined && { graphicDevices: str(pt.graphicDevices) }),
          ...(pt.textureNotes !== undefined && { textureNotes: str(pt.textureNotes) }),
          ...(pt.usageRules !== undefined && { usageRules: str(pt.usageRules) }),
        },
      });
      applied.push("pattern");
    }

    // ── Brand Voice ──────────────────────────────────────────────────────────
    if (extracted.brandVoice && typeof extracted.brandVoice === "object") {
      const bv = extracted.brandVoice as Record<string, unknown>;
      await tx.brandVoice.upsert({
        where: { brandId },
        create: {
          brandId,
          personality: bv.personality as Prisma.InputJsonValue ?? undefined,
          toneVariants: bv.toneVariants as Prisma.InputJsonValue ?? undefined,
          vocabulary: bv.vocabulary as Prisma.InputJsonValue ?? undefined,
          exampleCopy: bv.exampleCopy as Prisma.InputJsonValue ?? undefined,
          doList: strArray(bv.doList),
          dontList: strArray(bv.dontList),
          audienceNotes: str(bv.audienceNotes),
        },
        update: {
          ...(bv.personality !== undefined && { personality: bv.personality as Prisma.InputJsonValue }),
          ...(bv.toneVariants !== undefined && { toneVariants: bv.toneVariants as Prisma.InputJsonValue }),
          ...(bv.vocabulary !== undefined && { vocabulary: bv.vocabulary as Prisma.InputJsonValue }),
          ...(bv.exampleCopy !== undefined && { exampleCopy: bv.exampleCopy as Prisma.InputJsonValue }),
          ...(bv.doList !== undefined && { doList: strArray(bv.doList) }),
          ...(bv.dontList !== undefined && { dontList: strArray(bv.dontList) }),
          ...(bv.audienceNotes !== undefined && { audienceNotes: str(bv.audienceNotes) }),
        },
      });
      applied.push("brandVoice");
    }

    // Update brand status to IN_PROGRESS if DRAFT
    await tx.brand.updateMany({
      where: { id: brandId, status: "DRAFT" },
      data: { status: "IN_PROGRESS" },
    });
  });

  return NextResponse.json({ applied });
}
