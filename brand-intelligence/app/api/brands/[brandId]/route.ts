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

  const { brandId } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: { client: true },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }
  return NextResponse.json(brand);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { error } = await requireSession(req);
  if (error) return error;

  try {
    const { brandId } = await params;
    const body = await req.json();

    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
      },
      include: { client: true },
    });

    return NextResponse.json(brand);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
