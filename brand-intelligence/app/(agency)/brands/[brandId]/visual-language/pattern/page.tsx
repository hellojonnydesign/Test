"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PATTERN_STYLES = [
  "Geometric", "Organic", "Abstract", "Illustrative", "Typographic",
  "Textural", "Photographic", "Data-driven",
];

export default function PatternPage() {
  const [patternStyle, setPatternStyle] = useState("");
  const [graphicDevices, setGraphicDevices] = useState("");
  const [textureNotes, setTextureNotes] = useState("");
  const [usageRules, setUsageRules] = useState("");

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Pattern & Texture</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define graphic devices, patterns, and textures that support the brand visual language.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Pattern Style</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-xs">Style</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PATTERN_STYLES.map((s) => (
                <button key={s} onClick={() => setPatternStyle(s === patternStyle ? "" : s)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${patternStyle === s ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Graphic Devices</Label>
            <Textarea className="mt-1.5" rows={3} value={graphicDevices} onChange={(e) => setGraphicDevices(e.target.value)} placeholder="Describe any graphic devices — dividers, shapes, frames, backgrounds, supporting visual elements that are part of the brand system..." />
          </div>
          <div>
            <Label>Texture Notes</Label>
            <Textarea className="mt-1.5" rows={3} value={textureNotes} onChange={(e) => setTextureNotes(e.target.value)} placeholder="Any textural elements — paper grain, noise, material-inspired textures. How they are applied and in what contexts..." />
          </div>
          <div>
            <Label>Usage Rules</Label>
            <Textarea className="mt-1.5" rows={3} value={usageRules} onChange={(e) => setUsageRules(e.target.value)} placeholder="When and how patterns and textures are used — backgrounds, print, digital, restricted contexts..." />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pattern Assets</CardTitle>
          <CardDescription>Upload pattern files, graphic device assets, and texture references.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square cursor-pointer rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] flex flex-col items-center justify-center hover:bg-[var(--accent)] transition-colors">
                <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
                <span className="mt-1.5 text-xs text-[var(--muted-foreground)]">Upload</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button>Save Pattern & Texture</Button>
    </div>
  );
}
