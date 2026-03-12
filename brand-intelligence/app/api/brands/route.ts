import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const brands = await sql`
      SELECT b.id, b.name, b.slug, b.description, b."clientId", b."createdAt", b."updatedAt",
             row_to_json(c) AS client
      FROM "Brand" b
      JOIN "Client" c ON c.id = b."clientId"
      ORDER BY b."updatedAt" DESC
    `;
    return NextResponse.json(brands);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();

    if (!body.name || !body.clientId) {
      return NextResponse.json(
        { error: "name and clientId are required" },
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
      INSERT INTO "Brand" (id, name, slug, description, "clientId", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        ${body.name},
        ${slug},
        ${body.description ?? null},
        ${body.clientId},
        NOW(),
        NOW()
      )
      RETURNING id, name, slug, description, "clientId", "createdAt", "updatedAt"
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
