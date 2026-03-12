import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { extractBrandGuidelinesFromText } from "@/lib/ai/claude";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Pro — 60s limit

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { error } = await requireSession(req);
    if (error) return error;

    const { brandId } = await params;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your-anthropic-api-key") {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured in Vercel environment variables." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Synchronous text extraction from PDF binary
    const raw = buffer.toString("latin1");
    const sequences = raw.match(/[ -~\n\r\t]{5,}/g) ?? [];
    const text = sequences.join(" ").replace(/\s+/g, " ").trim().slice(0, 20000);

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Make sure the file contains selectable text (not a scanned image)." },
        { status: 422 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    const brands = await sql`SELECT name FROM "Brand" WHERE id = ${brandId} LIMIT 1`;
    const brandName = (brands[0]?.name as string) ?? "Unknown Brand";

    const extracted = await extractBrandGuidelinesFromText(text, brandName);

    // Record the import (best-effort)
    try {
      await sql`
        INSERT INTO "GuidelineImport" (id, "brandId", "fileName", "fileSize", "fileUrl", status, "extractedData", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${brandId}, ${file.name}, ${file.size}, '', 'COMPLETE', ${JSON.stringify(extracted)}::jsonb, NOW(), NOW())
      `;
    } catch {
      // non-critical
    }

    return NextResponse.json({
      extracted,
      sectionsFound: Object.entries(extracted)
        .filter(([, v]) => v !== null)
        .map(([k]) => k),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
