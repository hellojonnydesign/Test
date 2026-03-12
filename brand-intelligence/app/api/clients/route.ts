import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const clients = await sql`
      SELECT c.id, c.name, c.slug, c."agencyId", c."createdAt",
             COUNT(b.id)::int AS "brandCount"
      FROM "Client" c
      LEFT JOIN "Brand" b ON b."clientId" = c.id
      GROUP BY c.id
      ORDER BY c."createdAt" DESC
    `;
    return NextResponse.json(
      clients.map((c) => ({ ...c, _count: { brands: c.brandCount } }))
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();

    if (!body.name || !body.agencyId) {
      return NextResponse.json(
        { error: "name and agencyId are required" },
        { status: 400 }
      );
    }

    const slug =
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      `-${Date.now()}`;

    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      INSERT INTO "Client" (id, name, slug, "agencyId", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        ${body.name},
        ${slug},
        ${body.agencyId},
        NOW(),
        NOW()
      )
      RETURNING id, name, slug, "agencyId", "createdAt"
    `;

    const client = { ...rows[0], _count: { brands: 0 } };
    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
