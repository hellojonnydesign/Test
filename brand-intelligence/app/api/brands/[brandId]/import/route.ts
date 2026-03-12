import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { extractBrandGuidelinesFromText } from "@/lib/ai/claude";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET — quick health check so we can confirm the route loads
export async function GET() {
  return NextResponse.json({ ok: true, step: "route-reachable" });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  // Single outer try/catch — everything inside so no silent crashes
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

    // Timeout on formData — large files on slow connections can hang the function
    const formData = await Promise.race([
      req.formData(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("File upload timed out — PDF may be too large for your connection speed")),
          8000
        )
      ),
    ]);

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Synchronous text extraction — no async libs, instant
    const raw = buffer.toString("latin1");
    const sequences = raw.match(/[ -~\n\r\t]{5,}/g) ?? [];
    const text = sequences.join(" ").replace(/\s+/g, " ").trim().slice(0, 4000);

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Make sure the file contains selectable text (not a scanned image)." },
        { status: 422 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    const brands = await sql`SELECT name FROM "Brand" WHERE id = ${brandId} LIMIT 1`;
    const brandName = (brands[0]?.name as string) ?? "Unknown Brand";

    const extracted = await Promise.race([
      extractBrandGuidelinesFromText(text, brandName),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Claude API timed out — ANTHROPIC_API_KEY may be invalid, or upgrade to Vercel Pro for longer execution.")),
          7000
        )
      ),
    ]);

    // Return immediately — no additional async work to stay within Hobby plan's 10s limit
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
