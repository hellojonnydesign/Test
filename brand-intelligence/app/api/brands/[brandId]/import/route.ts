import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { extractBrandGuidelinesFromText } from "@/lib/ai/claude";
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
      { error: "ANTHROPIC_API_KEY is not configured. Add your key to .env to enable AI import." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true, name: true },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Create import record
    const importRecord = await prisma.guidelineImport.create({
      data: {
        brandId,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: "",
        status: "PROCESSING",
      },
    });

    // Extract text from PDF
    // In production: use pdf-parse or a service like Adobe PDF Extract API
    // For now, we read the file as text (works for text-based PDFs)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";
    try {
      // Dynamic import to avoid build issues in environments without native modules
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = await import("pdf-parse") as any;
      const pdfData = await (pdfParse.default ?? pdfParse)(buffer);
      extractedText = pdfData.text;
    } catch {
      // Fallback: treat as plain text if pdf-parse fails
      extractedText = buffer.toString("utf-8").slice(0, 50000);
    }

    if (!extractedText || extractedText.trim().length < 100) {
      await prisma.guidelineImport.update({
        where: { id: importRecord.id },
        data: { status: "FAILED", error: "Could not extract text from PDF. Ensure the PDF contains selectable text." },
      });
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 422 }
      );
    }

    // Run Claude extraction
    const extracted = await extractBrandGuidelinesFromText(
      extractedText.slice(0, 40000), // Stay within context limits
      brand.name
    );

    await prisma.guidelineImport.update({
      where: { id: importRecord.id },
      data: { status: "COMPLETE", extractedData: extracted as Prisma.InputJsonValue },
    });

    return NextResponse.json({
      importId: importRecord.id,
      extracted,
      sectionsFound: Object.entries(extracted)
        .filter(([, v]) => v !== null)
        .map(([k]) => k),
    });
  } catch (error) {
    console.error("PDF import error:", error);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}
