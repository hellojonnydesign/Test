import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Public API endpoint — returns the universal brand config JSON
// Authenticate via API key in Authorization header: Bearer <api-key>
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;

  // API key auth (simplified — use a proper auth solution in production)
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        name: true,
        brandConfig: true,
        configVersion: true,
        updatedAt: true,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    if (!brand.brandConfig) {
      return NextResponse.json(
        { error: "No brand config generated yet. Run the Brand Intelligence Engine first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      brand: brand.name,
      version: brand.configVersion,
      generatedAt: brand.updatedAt,
      config: brand.brandConfig,
    });
  } catch (error) {
    console.error("Config API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
