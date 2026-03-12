"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PHOTOGRAPHY_STYLES = [
  "Documentary", "Editorial", "Studio", "Lifestyle", "Abstract",
  "Reportage", "Fine Art", "Commercial", "Street", "Fashion",
];

const LIGHTING_TYPES = [
  "Natural light", "Soft studio", "Dramatic / high contrast", "Backlit",
  "Golden hour", "Overcast / diffused", "Flash / strobe", "Mixed light",
];

const SUBJECT_TYPES = [
  "People / portraits", "Product", "Environments / spaces", "Abstract / detail",
  "Food", "Architecture", "Nature", "Lifestyle scenes", "Documentary moments",
];

export default function PhotographyPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [style, setStyle] = useState("");
  const [mood, setMood] = useState("");
  const [colourTreatment, setColourTreatment] = useState("");
  const [postProcessing, setPostProcessing] = useState("");
  const [lighting, setLighting] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [composition, setComposition] = useState("");
  const [doItems, setDoItems] = useState<string[]>([""]);
  const [dontItems, setDontItems] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/brands/${brandId}/photography`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setStyle(data.style ?? "");
        setMood(data.mood ?? "");
        setColourTreatment((data.colourTreatment as { value?: string } | null)?.value ?? "");
        setPostProcessing(data.postProcessing ?? "");
        setLighting((data.lighting as { value?: string[] } | null)?.value ?? []);
        setSubjects((data.subjects as { value?: string[] } | null)?.value ?? []);
        setComposition((data.composition as { value?: string } | null)?.value ?? "");
        setDoItems(data.doList?.length ? data.doList : [""]);
        setDontItems(data.dontList?.length ? data.dontList : [""]);
      })
      .catch(() => {});
  }, [brandId]);

  async function handleSave() {
    setIsSaving(true);
    await fetch(`/api/brands/${brandId}/photography`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        style, mood, colourTreatment, postProcessing,
        lighting, subjects, composition,
        doList: doItems.filter(Boolean),
        dontList: dontItems.filter(Boolean),
      }),
    });
    setIsSaving(false);
  }

  function toggleItem<T>(list: T[], setList: (v: T[]) => void, item: T) {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
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

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Photography</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define photography style, mood, and technical guidance. These will be used to generate AI image prompts and photographer briefs.
        </p>
      </div>

      {/* Style & Mood */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Style & Mood</CardTitle>
          <CardDescription>The overall photographic aesthetic of the brand.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Photography Style</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PHOTOGRAPHY_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
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
              placeholder="Or describe the style in your own words..."
            />
          </div>

          <div>
            <Label>Mood & Feel</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Describe the emotional quality of the photography — e.g. warm and optimistic, raw and authentic, minimal and aspirational, bold and high-energy..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Lighting */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lighting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LIGHTING_TYPES.map((l) => (
              <button
                key={l}
                onClick={() => toggleItem(lighting, setLighting, l)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  lighting.includes(l)
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>What appears in brand photography.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_TYPES.map((s) => (
              <button
                key={s}
                onClick={() => toggleItem(subjects, setSubjects, s)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  subjects.includes(s)
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colour Treatment & Post-processing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Colour Treatment & Post-processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Colour Treatment</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={colourTreatment}
              onChange={(e) => setColourTreatment(e.target.value)}
              placeholder="e.g. Warm toned with lifted shadows. Slightly desaturated with rich mid-tones. True-to-life colour with no heavy grading. High saturation and bold contrast..."
            />
          </div>
          <div>
            <Label>Post-processing Style</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={postProcessing}
              onChange={(e) => setPostProcessing(e.target.value)}
              placeholder="e.g. Minimal retouching — keep skin texture and natural imperfections. Clean white backgrounds for product shots. Consistent grade across all imagery..."
            />
          </div>
          <div>
            <Label>Composition Principles</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              placeholder="e.g. Strong negative space. Rule of thirds. Subject framed off-centre. Generous breathing room around subjects..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Do / Don't */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Do / Don&apos;t</CardTitle>
          <CardDescription>
            Specific rules included directly in AI image generation prompts and creative briefs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                Do
              </Label>
              <div className="mt-2 space-y-2">
                {doItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      className="h-8 text-sm flex-1"
                      value={item}
                      onChange={(e) => updateListItem(doItems, setDoItems, i, e.target.value)}
                      placeholder="e.g. Use real people in real situations"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeListItem(doItems, setDoItems, i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem(doItems, setDoItems)}
                  className="w-full"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-red-600 font-semibold uppercase tracking-wider">
                Don&apos;t
              </Label>
              <div className="mt-2 space-y-2">
                {dontItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      className="h-8 text-sm flex-1"
                      value={item}
                      onChange={(e) => updateListItem(dontItems, setDontItems, i, e.target.value)}
                      placeholder="e.g. Use overly staged or fake-looking imagery"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeListItem(dontItems, setDontItems, i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem(dontItems, setDontItems)}
                  className="w-full"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moodboard */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reference Imagery</CardTitle>
          <CardDescription>Upload photography examples that define the brand aesthetic.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square cursor-pointer rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] flex flex-col items-center justify-center hover:bg-[var(--accent)] transition-colors"
              >
                <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
                <span className="mt-1.5 text-xs text-[var(--muted-foreground)]">Upload</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving…" : "Save Photography Guidelines"}
      </Button>
    </div>
  );
}
