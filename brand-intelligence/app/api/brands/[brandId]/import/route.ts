import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { extractBrandGuidelinesFromPDF, extractBrandGuidelinesFromText } from "@/lib/ai/claude";
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

    // 20MB limit to avoid Anthropic API payload limits
    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF is too large. Please use a file under 20MB." },
        { status: 413 }
      );
    }

    const pdfBase64 = buffer.toString("base64");

    // Fetch brand name for context
    const sql = neon(process.env.DATABASE_URL!);
    const brands = await sql`SELECT name FROM "Brand" WHERE id = ${brandId} LIMIT 1`;
    const brandName = (brands[0]?.name as string) ?? "Unknown Brand";

    // Use Claude's native PDF support — no pdf-parse needed
    let extracted: Record<string, unknown>;
    try {
      extracted = await extractBrandGuidelinesFromPDF(pdfBase64, brandName);
    } catch (pdfErr) {
      // Fallback: extract text manually and use text-based extraction
      let text = buffer.toString("utf-8").slice(0, 15000);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParse = await import("pdf-parse") as any;
        const pdfData = await (pdfParse.default ?? pdfParse)(buffer);
        text = pdfData.text.slice(0, 15000);
      } catch {
        // keep utf-8 fallback
      }
      if (!text || text.trim().length < 50) {
        throw pdfErr; // re-throw original error
      }
      extracted = await extractBrandGuidelinesFromText(text, brandName);
    }

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
