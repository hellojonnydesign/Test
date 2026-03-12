"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ICON_STYLES = ["Outline", "Filled", "Duotone", "Line", "Glyph", "Rounded", "Sharp"];
const CORNER_RADII = ["Sharp (0px)", "Slightly rounded (2px)", "Rounded (4px)", "Pill (full)"];

export default function IconographyPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [style, setStyle] = useState("");
  const [gridSize, setGridSize] = useState("24");
  const [strokeWeight, setStrokeWeight] = useState("");
  const [cornerRadius, setCornerRadius] = useState("");
  const [colourUsage, setColourUsage] = useState("");
  const [opticalSizing, setOpticalSizing] = useState("");
  const [doList, setDoList] = useState<string[]>([""]);
  const [dontList, setDontList] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/brands/${brandId}/iconography`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setStyle(data.style ?? "");
        setGridSize(data.gridSize?.toString() ?? "24");
        setStrokeWeight(data.strokeWeight ?? "");
        setCornerRadius(data.cornerRadius ?? "");
        setColourUsage(data.colourUsage ?? "");
        setOpticalSizing(data.opticalSizing ?? "");
        setDoList(data.doList?.length ? data.doList : [""]);
        setDontList(data.dontList?.length ? data.dontList : [""]);
      })
      .catch(() => {});
  }, [brandId]);

  async function handleSave() {
    setIsSaving(true);
    await fetch(`/api/brands/${brandId}/iconography`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        style, gridSize, strokeWeight, cornerRadius,
        colourUsage, opticalSizing,
        doList: doList.filter(Boolean),
        dontList: dontList.filter(Boolean),
      }),
    });
    setIsSaving(false);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Iconography</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define icon style, grid, and usage rules for consistent iconography across AI-generated content.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Icon Style</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-xs">Style</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ICON_STYLES.map((s) => (
                <button key={s} onClick={() => setStyle(s === style ? "" : s)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${style === s ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Grid Size (px)</Label>
              <Input className="mt-1.5 h-8 text-sm" value={gridSize} onChange={(e) => setGridSize(e.target.value)} placeholder="24" />
            </div>
            <div>
              <Label className="text-xs">Stroke Weight</Label>
              <Input className="mt-1.5 h-8 text-sm" value={strokeWeight} onChange={(e) => setStrokeWeight(e.target.value)} placeholder="1.5px" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Corner Radius</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CORNER_RADII.map((r) => (
                <button key={r} onClick={() => setCornerRadius(r === cornerRadius ? "" : r)}
                  className={`rounded-md border px-3 py-1 text-xs transition-colors ${cornerRadius === r ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Colour Usage</Label>
            <Textarea className="mt-1.5 text-sm" rows={3} value={colourUsage} onChange={(e) => setColourUsage(e.target.value)} placeholder="Icons use the brand primary colour on light backgrounds, white on dark backgrounds. Avoid using more than one colour per icon..." />
          </div>
          <div>
            <Label className="text-xs">Optical Sizing Notes</Label>
            <Textarea className="mt-1.5 text-sm" rows={2} value={opticalSizing} onChange={(e) => setOpticalSizing(e.target.value)} placeholder="Use 16px icons for UI contexts, 24px for navigation, 32px+ for feature displays..." />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Icons</CardTitle>
          <CardDescription>Upload SVG icon files to include in the brand config.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square cursor-pointer rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] flex flex-col items-center justify-center hover:bg-[var(--accent)] transition-colors">
                <Upload className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span className="mt-1 text-xs text-[var(--muted-foreground)]">SVG</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>Do / Don&apos;t</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Do</Label>
              <div className="mt-2 space-y-2">
                {doList.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="h-8 text-sm flex-1" value={item} onChange={(e) => { const u = [...doList]; u[i] = e.target.value; setDoList(u); }} placeholder="e.g. Keep icons optically balanced" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDoList(doList.filter((_, idx) => idx !== i))}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setDoList([...doList, ""])} className="w-full"><Plus className="mr-1.5 h-3.5 w-3.5" />Add</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-red-600 font-semibold uppercase tracking-wider">Don&apos;t</Label>
              <div className="mt-2 space-y-2">
                {dontList.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="h-8 text-sm flex-1" value={item} onChange={(e) => { const u = [...dontList]; u[i] = e.target.value; setDontList(u); }} placeholder="e.g. Mix icon styles within one UI" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDontList(dontList.filter((_, idx) => idx !== i))}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setDontList([...dontList, ""])} className="w-full"><Plus className="mr-1.5 h-3.5 w-3.5" />Add</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving…" : "Save Iconography"}
      </Button>
    </div>
  );
}
