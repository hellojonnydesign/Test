import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateBrandConfig } from "@/lib/ai/claude";
import { requireSession } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession(req);
  if (error) return error;

  const { brandId } = await params;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key") {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured. Add your key to .env to enable AI generation." },
      { status: 503 }
    );
  }

  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        logoSystem: { include: { assets: true } },
        colourSystem: { include: { palettes: { include: { colours: true } } } },
        typography: { include: { typefaces: true } },
        photography: true,
        illustration: true,
        motion: true,
        iconography: true,
        gridLayout: true,
        pattern: true,
        brandVoice: true,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const config = await generateBrandConfig({
      name: brand.name,
      logoSystem: brand.logoSystem as Record<string, unknown> | null,
      colourSystem: brand.colourSystem as Record<string, unknown> | null,
      typography: brand.typography as Record<string, unknown> | null,
      photography: brand.photography as Record<string, unknown> | null,
      illustration: brand.illustration as Record<string, unknown> | null,
      motion: brand.motion as Record<string, unknown> | null,
      iconography: brand.iconography as Record<string, unknown> | null,
      gridLayout: brand.gridLayout as Record<string, unknown> | null,
      pattern: brand.pattern as Record<string, unknown> | null,
      brandVoice: brand.brandVoice as Record<string, unknown> | null,
    });

    await prisma.brand.update({
      where: { id: brandId },
      data: {
        brandConfig: config as object,
        configVersion: { increment: 1 },
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Brand config generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate brand config" },
      { status: 500 }
    );
  }
}
