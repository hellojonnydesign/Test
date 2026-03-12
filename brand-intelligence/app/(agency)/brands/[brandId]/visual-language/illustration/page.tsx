"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import { UploadZone } from "@/components/ui/upload-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ILLUSTRATION_STYLES = [
  "Flat", "Geometric", "Hand-drawn", "Isometric", "Figurative",
  "Abstract", "Collage", "Line art", "Painterly", "Mixed media",
];

const TECHNIQUES = [
  "Vector (digital)", "Raster (digital)", "Ink / pen", "Watercolour",
  "Screen print", "Linocut", "Pencil / charcoal", "Mixed media",
];

const LINE_WEIGHTS = ["None (filled only)", "Thin (0.5–1px)", "Medium (1.5–2px)", "Heavy (3px+)", "Variable"];

const PERSPECTIVES = ["Flat / 2D", "Isometric", "3D perspective", "Mixed", "Axonometric"];

export default function IllustrationPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [style, setStyle] = useState("");
  const [technique, setTechnique] = useState("");
  const [lineWeight, setLineWeight] = useState("");
  const [perspective, setPerspective] = useState("");
  const [colourPalette, setColourPalette] = useState("");
  const [colourApplication, setColourApplication] = useState("");
  const [subjects, setSubjects] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [doItems, setDoItems] = useState<string[]>([""]);
  const [dontItems, setDontItems] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/brands/${brandId}/illustration`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setStyle(data.style ?? "");
        setTechnique(data.technique ?? "");
        setLineWeight(data.lineWeight ?? "");
        setPerspective(data.perspective ?? "");
        setColourPalette(data.colourPalette ?? "");
        setColourApplication((data.colourApplication as { value?: string } | null)?.value ?? "");
        setSubjects((data.subjects as { value?: string } | null)?.value ?? "");
        setReferenceUrls(data.referenceUrls ?? []);
        setDoItems(data.doList?.length ? data.doList : [""]);
        setDontItems(data.dontList?.length ? data.dontList : [""]);
      })
      .catch(() => {});
  }, [brandId]);

  async function handleSave() {
    setIsSaving(true);
    await fetch(`/api/brands/${brandId}/illustration`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        style, technique, lineWeight, perspective,
        colourPalette, colourApplication, subjects,
        referenceUrls,
        doList: doItems.filter(Boolean),
        dontList: dontItems.filter(Boolean),
      }),
    });
    setIsSaving(false);
  }

  function updateListItem(
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    value: string
  ) {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  }

  function addListItem(list: string[], setList: (v: string[]) => void) {
    setList([...list, ""]);
  }

  function removeListItem(
    list: string[],
    setList: (v: string[]) => void,
    index: number
  ) {
    setList(list.filter((_, i) => i !== index));
  }

  function pick<T>(current: T, value: T, setter: (v: T) => void) {
    setter(current === value ? ("" as T) : value);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Illustration</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define illustration style, technique, and colour guidance for AI generation and artist briefs.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Style & Technique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-xs">Illustration Style</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ILLUSTRATION_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => pick(style, s, setStyle)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    style === s
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <Input
              className="mt-2 h-8 text-sm"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Or describe in your own words..."
            />
          </div>

          <div>
            <Label className="text-xs">Technique</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TECHNIQUES.map((t) => (
                <button
                  key={t}
                  onClick={() => pick(technique, t, setTechnique)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    technique === t
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Line Weight</Label>
              <div className="mt-2 flex flex-col gap-1.5">
                {LINE_WEIGHTS.map((lw) => (
                  <button
                    key={lw}
                    onClick={() => pick(lineWeight, lw, setLineWeight)}
                    className={`rounded-md border px-3 py-1.5 text-xs text-left transition-colors ${
                      lineWeight === lw
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                    }`}
                  >
                    {lw}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Perspective</Label>
              <div className="mt-2 flex flex-col gap-1.5">
                {PERSPECTIVES.map((p) => (
                  <button
                    key={p}
                    onClick={() => pick(perspective, p, setPerspective)}
                    className={`rounded-md border px-3 py-1.5 text-xs text-left transition-colors ${
                      perspective === p
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Colour Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Colour Palette Reference</Label>
            <Input
              className="mt-1.5 h-8 text-sm"
              value={colourPalette}
              onChange={(e) => setColourPalette(e.target.value)}
              placeholder="Uses brand primary palette / has its own dedicated illustration palette"
            />
          </div>
          <div>
            <Label>Colour Application Rules</Label>
            <Textarea
              className="mt-1.5"
              rows={4}
              value={colourApplication}
              onChange={(e) => setColourApplication(e.target.value)}
              placeholder="e.g. Limited palette of 3–4 colours per illustration. Brand primary used as dominant fill. Outline colour is always dark navy, never black. Gradients are not used..."
            />
          </div>
          <div>
            <Label>Subjects & Subject Matter</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="e.g. Stylised human figures, food ingredients, abstract shapes representing concepts, product illustrations. Avoid: faces with detailed features, photorealistic rendering..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Do / Don&apos;t</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Do</Label>
              <div className="mt-2 space-y-2">
                {doItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      className="h-8 text-sm flex-1"
                      value={item}
                      onChange={(e) => updateListItem(doItems, setDoItems, i, e.target.value)}
                      placeholder="e.g. Keep shapes clean and geometric"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeListItem(doItems, setDoItems, i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addListItem(doItems, setDoItems)} className="w-full">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-red-600 font-semibold uppercase tracking-wider">Don&apos;t</Label>
              <div className="mt-2 space-y-2">
                {dontItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      className="h-8 text-sm flex-1"
                      value={item}
                      onChange={(e) => updateListItem(dontItems, setDontItems, i, e.target.value)}
                      placeholder="e.g. Use photorealistic rendering"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeListItem(dontItems, setDontItems, i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addListItem(dontItems, setDontItems)} className="w-full">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reference Assets</CardTitle>
          <CardDescription>Upload illustration examples that define the brand style.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <UploadZone
                key={i}
                value={referenceUrls[i]}
                onUpload={(url) => {
                  const updated = [...referenceUrls];
                  updated[i] = url;
                  setReferenceUrls(updated);
                }}
                onRemove={() => {
                  const updated = [...referenceUrls];
                  updated.splice(i, 1);
                  setReferenceUrls(updated);
                }}
                accept="image/*"
                folder="brand-illustration"
                className="aspect-square"
                previewType="image"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving…" : "Save Illustration Guidelines"}
      </Button>
    </div>
  );
}
