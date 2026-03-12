"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ImportStatus = "idle" | "uploading" | "complete" | "error";

const ALL_SECTIONS = [
  { key: "logoSystem", label: "Logo System" },
  { key: "colourSystem", label: "Colour System" },
  { key: "typography", label: "Typography" },
  { key: "photography", label: "Photography" },
  { key: "illustration", label: "Illustration" },
  { key: "motion", label: "Motion" },
  { key: "brandVoice", label: "Brand Voice" },
  { key: "iconography", label: "Iconography" },
  { key: "gridLayout", label: "Grid & Layout" },
  { key: "pattern", label: "Pattern & Texture" },
];

interface ExtractedSection {
  key: string;
  label: string;
  found: boolean;
  preview?: string;
}

function sectionPreview(key: string, data: Record<string, unknown>): string {
  const val = data[key] as Record<string, unknown> | null;
  if (!val) return "";
  const entries = Object.entries(val).filter(([, v]) => v !== null && v !== undefined);
  if (!entries.length) return "";
  const first = entries.slice(0, 2).map(([k]) => k.replace(/([A-Z])/g, " $1").toLowerCase()).join(", ");
  return `Extracted: ${first}${entries.length > 2 ? ` + ${entries.length - 2} more fields` : ""}`;
}

export default function ImportPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [extractedSections, setExtractedSections] = useState<ExtractedSection[]>([]);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setStatus("idle");
    setExtractedSections([]);
    setExtractedData(null);
    setError("");
    setApplied(false);
  }

  async function handleImport() {
    if (!file) return;
    setStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    try {
      const res = await fetch(`/api/brands/${brandId}/import`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || `Error ${res.status} — check that ANTHROPIC_API_KEY is set in Vercel`);
        setStatus("error");
        return;
      }

      if (!data?.extracted) {
        setError("Unexpected response from server. Please try again.");
        setStatus("error");
        return;
      }

      const extracted = data.extracted as Record<string, unknown>;
      const sectionsFound: string[] = data.sectionsFound ?? [];

      setExtractedData(extracted);
      setExtractedSections(
        ALL_SECTIONS.map((s) => ({
          ...s,
          found: sectionsFound.includes(s.key),
          preview: sectionsFound.includes(s.key) ? sectionPreview(s.key, extracted) : undefined,
        }))
      );
      setStatus("complete");
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Request timed out — PDF may be too large. Try a shorter document."
          : "Request failed — check your network and try again."
      );
      setStatus("error");
    } finally {
      clearTimeout(timeout);
    }
  }

  async function applyExtracted() {
    if (!extractedData) return;
    setApplying(true);
    try {
      await fetch(`/api/brands/${brandId}/import/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted: extractedData }),
      });
      setApplied(true);
    } catch {
      // ignore
    } finally {
      setApplying(false);
    }
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
          {status !== "complete" ? (
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

              {status === "uploading" ? (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-[var(--muted)] p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Claude is analysing your brand guidelines...</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Extracting logo system, colours, typography, photography, voice, and more
                    </p>
                  </div>
                </div>
              ) : (
                fileName && status !== "error" && (
                  <Button onClick={handleImport} className="mt-4 w-full">
                    Extract Brand Intelligence
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )
              )}

              {status === "error" && (
                <div className="mt-4 flex items-start gap-3 rounded-lg bg-red-50 p-4">
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
            </div>
          ) : null}
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

          {applied ? (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4 mb-6">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Applied to brand modules</p>
                <p className="text-xs text-emerald-600 mt-0.5">Review and refine each module to complete your brand system.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button onClick={applyExtracted} disabled={applying}>
                {applying ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Applying...</>
                ) : (
                  <>Apply to Brand Modules<ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
              <p className="text-xs text-[var(--muted-foreground)]">
                You can review and edit each module after applying
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-8 rounded-lg bg-[var(--muted)] p-4">
        <p className="text-xs font-medium mb-1">When to use PDF import vs native input</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Use PDF import when you have existing brand guidelines documentation. Use native input when building a brand from scratch or when you want full control over the structure. You can combine both — import first, then refine natively.
        </p>
      </div>
    </div>
  );
}
