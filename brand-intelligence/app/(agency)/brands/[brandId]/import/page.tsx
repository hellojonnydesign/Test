"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ImportStatus = "idle" | "uploading" | "processing" | "complete" | "error";

interface ExtractedSection {
  key: string;
  label: string;
  found: boolean;
  preview?: string;
}

export default function ImportPage() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [extractedSections, setExtractedSections] = useState<ExtractedSection[]>([]);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("idle");
    setExtractedSections([]);
    setError("");
  }

  async function handleImport() {
    if (!fileName) return;
    setStatus("uploading");

    // Simulate processing — in production this calls /api/brands/[brandId]/import
    setTimeout(() => setStatus("processing"), 1200);
    setTimeout(() => {
      setStatus("complete");
      setExtractedSections([
        { key: "logoSystem", label: "Logo System", found: true, preview: "Primary logo, wordmark, icon variants identified. Clear space rules extracted." },
        { key: "colourSystem", label: "Colour System", found: true, preview: "4 palettes found: Primary (3 colours), Secondary (4 colours), Neutral (5 colours), Accent (2 colours)." },
        { key: "typography", label: "Typography", found: true, preview: "2 typefaces identified: GT Walsheim (Primary/Display), GT Walsheim Light (Body)." },
        { key: "photography", label: "Photography", found: true, preview: "Documentary style, warm colour treatment, lifestyle subjects, natural lighting guidelines extracted." },
        { key: "illustration", label: "Illustration", found: false },
        { key: "motion", label: "Motion", found: true, preview: "Easing principles and transition guidelines found." },
        { key: "brandVoice", label: "Brand Voice", found: true, preview: "4 personality traits, vocabulary list, and tone guidance extracted." },
        { key: "iconography", label: "Iconography", found: false },
        { key: "gridLayout", label: "Grid & Layout", found: true, preview: "12-column grid, 8px spacing base, margin guidelines found." },
        { key: "pattern", label: "Pattern & Texture", found: false },
      ]);
    }, 4000);
  }

  async function applyExtracted() {
    // In production: POST to API to write extracted data to brand modules
    alert("In production: this would populate all brand modules with the extracted data.");
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Import Brand Guidelines PDF</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Upload an existing brand guidelines PDF. Claude will extract all brand information and map it into the brand system modules — ready to review and edit.
        </p>
      </div>

      {/* Upload */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {status === "idle" || status === "uploading" || status === "processing" ? (
            <div>
              <label
                htmlFor="pdf-upload"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
                  fileName
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--muted)] hover:border-[var(--primary)]/50 hover:bg-[var(--accent)]"
                }`}
              >
                {fileName ? (
                  <>
                    <FileText className="h-8 w-8 text-[var(--primary)]" />
                    <p className="mt-3 font-medium text-sm">{fileName}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[var(--muted-foreground)]" />
                    <p className="mt-3 font-medium text-sm">Drop your PDF here</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">or click to browse</p>
                    <p className="mt-3 text-xs text-[var(--muted-foreground)]">PDF up to 50MB</p>
                  </>
                )}
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>

              {status === "uploading" || status === "processing" ? (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-[var(--muted)] p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {status === "uploading" ? "Uploading..." : "Claude is analysing your brand guidelines..."}
                    </p>
                    {status === "processing" && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        Extracting logo system, colours, typography, photography, voice, and more
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                fileName && (
                  <Button onClick={handleImport} className="mt-4 w-full">
                    Extract Brand Intelligence
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )
              )}
            </div>
          ) : null}

          {status === "error" && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Extraction failed</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { setStatus("idle"); setError(""); }}>
                  Try again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted results */}
      {status === "complete" && extractedSections.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <h2 className="text-sm font-semibold">Extraction Complete</h2>
            <Badge variant="success">
              {extractedSections.filter((s) => s.found).length}/{extractedSections.length} sections found
            </Badge>
          </div>

          <div className="space-y-3 mb-6">
            {extractedSections.map((section) => (
              <div
                key={section.key}
                className={`rounded-lg border p-4 ${
                  section.found
                    ? "border-[var(--border)] bg-[var(--card)]"
                    : "border-[var(--border)] bg-[var(--muted)] opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {section.found ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-[var(--border)] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{section.label}</p>
                    {section.preview && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                        {section.preview}
                      </p>
                    )}
                    {!section.found && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        Not found in document — add manually
                      </p>
                    )}
                  </div>
                  <Badge variant={section.found ? "success" : "secondary"} className="shrink-0">
                    {section.found ? "Extracted" : "Missing"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={applyExtracted}>
              Apply to Brand Modules
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-[var(--muted-foreground)]">
              You can review and edit each module after applying
            </p>
          </div>
        </>
      )}

      {/* Tip */}
      <div className="mt-8 rounded-lg bg-[var(--muted)] p-4">
        <p className="text-xs font-medium mb-1">When to use PDF import vs native input</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Use PDF import when you have existing brand guidelines documentation. Use native input when building a brand from scratch or when you want full control over the structure. You can combine both — import first, then refine natively.
        </p>
      </div>
    </div>
  );
}
