import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { extractBrandGuidelinesFromText } from "@/lib/ai/claude";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const maxDuration = 60; // allow up to 60s for Claude processing (Vercel Pro)

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
      { error: "ANTHROPIC_API_KEY is not configured in Vercel environment variables." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF — fast path for serverless (10s limit on Hobby plan)
    let text = "";
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = await import("pdf-parse") as any;
      const pdfData = await (pdfParse.default ?? pdfParse)(buffer);
      text = pdfData.text ?? "";
    } catch {
      // pdf-parse failed; fall back to raw buffer (will be low quality but won't crash)
      text = buffer.toString("latin1");
    }

    // Trim to 4000 chars — keeps Claude call under ~2s on Haiku
    text = text.replace(/\s+/g, " ").trim().slice(0, 4000);

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Make sure the file contains selectable text (not a scanned image)." },
        { status: 422 }
      );
    }

    // Fetch brand name for context
    const sql = neon(process.env.DATABASE_URL!);
    const brands = await sql`SELECT name FROM "Brand" WHERE id = ${brandId} LIMIT 1`;
    const brandName = (brands[0]?.name as string) ?? "Unknown Brand";

    const extracted = await extractBrandGuidelinesFromText(text, brandName);

    // Record the import (best-effort — don't fail if this errors)
    try {
      await sql`
        INSERT INTO "GuidelineImport" (id, "brandId", "fileName", "fileSize", "fileUrl", status, "extractedData", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${brandId}, ${file.name}, ${file.size}, '', 'COMPLETE', ${JSON.stringify(extracted)}::jsonb, NOW(), NOW())
      `;
    } catch {
      // non-critical — ignore
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
