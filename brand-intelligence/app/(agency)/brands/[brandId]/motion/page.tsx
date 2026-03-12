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

const MOTION_CHARACTER = [
  "Fluid & organic", "Snappy & energetic", "Refined & deliberate",
  "Playful & bouncy", "Minimal & restrained", "Bold & expressive",
];

const TRANSITION_TYPES = [
  "Fade", "Slide", "Scale", "Morph", "Reveal", "Wipe", "Blur", "Bounce",
];

interface EasingCurve {
  id: string;
  name: string;
  value: string;
  use: string;
}

interface DurationToken {
  id: string;
  name: string;
  value: string;
  use: string;
}

export default function MotionPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [principles, setPrinciples] = useState("");
  const [character, setCharacter] = useState("");
  const [logoAnimation, setLogoAnimation] = useState("");
  const [typographyAnim, setTypographyAnim] = useState("");
  const [selectedTransitions, setSelectedTransitions] = useState<string[]>([]);
  const [easingCurves, setEasingCurves] = useState<EasingCurve[]>([
    { id: "1", name: "Enter", value: "cubic-bezier(0.22, 1, 0.36, 1)", use: "Elements entering the screen" },
    { id: "2", name: "Exit", value: "cubic-bezier(0.55, 0, 1, 0.45)", use: "Elements leaving the screen" },
    { id: "3", name: "Standard", value: "cubic-bezier(0.4, 0, 0.2, 1)", use: "General transitions" },
  ]);
  const [durations, setDurations] = useState<DurationToken[]>([
    { id: "1", name: "Fast", value: "150ms", use: "Micro-interactions, hovers" },
    { id: "2", name: "Standard", value: "300ms", use: "Most transitions" },
    { id: "3", name: "Slow", value: "500ms", use: "Page transitions, complex animations" },
    { id: "4", name: "Deliberate", value: "800ms", use: "Hero animations, brand moments" },
  ]);
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [doItems, setDoItems] = useState<string[]>([""]);
  const [dontItems, setDontItems] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/brands/${brandId}/motion`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setPrinciples(data.principles ?? "");
        setCharacter(data.character ?? "");
        setLogoAnimation(data.logoAnimation ?? "");
        setTypographyAnim(data.typographyAnim ?? "");
        if (data.transitionTypes) setSelectedTransitions(data.transitionTypes as string[]);
        if (data.easingCurves) setEasingCurves(data.easingCurves as EasingCurve[]);
        if (data.durationTokens) setDurations(data.durationTokens as DurationToken[]);
        setReferenceUrls(data.referenceUrls ?? []);
        setDoItems(data.doList?.length ? data.doList : [""]);
        setDontItems(data.dontList?.length ? data.dontList : [""]);
      })
      .catch(() => {});
  }, [brandId]);

  async function handleSave() {
    setIsSaving(true);
    await fetch(`/api/brands/${brandId}/motion`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        principles, character, logoAnimation, typographyAnim,
        transitionTypes: selectedTransitions,
        easingCurves, durationTokens: durations,
        referenceUrls,
        doList: doItems.filter(Boolean),
        dontList: dontItems.filter(Boolean),
      }),
    });
    setIsSaving(false);
  }

  function toggleTransition(t: string) {
    setSelectedTransitions((prev) =>
      prev.includes(t) ? prev.filter((i) => i !== t) : [...prev, t]
    );
  }

  function updateEasing(id: string, field: keyof EasingCurve, value: string) {
    setEasingCurves((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function updateDuration(id: string, field: keyof DurationToken, value: string) {
    setDurations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  }

  function updateListItem(list: string[], setList: (v: string[]) => void, index: number, value: string) {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Motion & Animation</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define how the brand moves — motion principles, easing curves, and timing tokens for design system and AI output.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Motion Principles</CardTitle>
          <CardDescription>The core philosophy that governs how this brand moves.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Motion Character</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOTION_CHARACTER.map((c) => (
                <button
                  key={c}
                  onClick={() => setCharacter(c === character ? "" : c)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    character === c
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Principles</Label>
            <Textarea
              className="mt-1.5"
              rows={4}
              value={principles}
              onChange={(e) => setPrinciples(e.target.value)}
              placeholder="Describe the core motion principles — e.g. Motion should feel purposeful and never decorative. Every animation communicates meaning. Energy should build, not dissipate..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transition Types</CardTitle>
          <CardDescription>Approved transition types for the brand.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TRANSITION_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleTransition(t)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  selectedTransitions.includes(t)
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Easing Curves</CardTitle>
              <CardDescription className="mt-1">Named cubic-bezier values for use in design system and code.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setEasingCurves((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), name: "", value: "", use: "" },
                ])
              }
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {easingCurves.map((curve) => (
              <div key={curve.id} className="grid grid-cols-12 gap-3 rounded-lg border border-[var(--border)] p-3">
                <div className="col-span-3">
                  <Label className="text-xs">Name</Label>
                  <Input className="mt-1 h-7 text-xs" value={curve.name} onChange={(e) => updateEasing(curve.id, "name", e.target.value)} placeholder="Enter, Exit, Standard" />
                </div>
                <div className="col-span-5">
                  <Label className="text-xs">Cubic-bezier</Label>
                  <Input className="mt-1 h-7 text-xs font-mono" value={curve.value} onChange={(e) => updateEasing(curve.id, "value", e.target.value)} placeholder="cubic-bezier(0.4, 0, 0.2, 1)" />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Use</Label>
                  <Input className="mt-1 h-7 text-xs" value={curve.use} onChange={(e) => updateEasing(curve.id, "use", e.target.value)} placeholder="When to use" />
                </div>
                <div className="col-span-1 flex items-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500" onClick={() => setEasingCurves((prev) => prev.filter((e) => e.id !== curve.id))}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Duration Tokens</CardTitle>
              <CardDescription className="mt-1">Named timing values for the motion design system.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDurations((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), name: "", value: "", use: "" },
                ])
              }
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {durations.map((d) => (
              <div key={d.id} className="grid grid-cols-12 gap-3 rounded-lg border border-[var(--border)] p-3">
                <div className="col-span-3">
                  <Label className="text-xs">Token Name</Label>
                  <Input className="mt-1 h-7 text-xs" value={d.name} onChange={(e) => updateDuration(d.id, "name", e.target.value)} placeholder="Fast, Standard, Slow" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Value</Label>
                  <Input className="mt-1 h-7 text-xs font-mono" value={d.value} onChange={(e) => updateDuration(d.id, "value", e.target.value)} placeholder="300ms" />
                </div>
                <div className="col-span-6">
                  <Label className="text-xs">Use</Label>
                  <Input className="mt-1 h-7 text-xs" value={d.use} onChange={(e) => updateDuration(d.id, "use", e.target.value)} placeholder="When to use this timing" />
                </div>
                <div className="col-span-1 flex items-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500" onClick={() => setDurations((prev) => prev.filter((dur) => dur.id !== d.id))}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Brand Motion Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Logo Animation</Label>
            <Textarea className="mt-1.5" rows={3} value={logoAnimation} onChange={(e) => setLogoAnimation(e.target.value)} placeholder="Describe the logo animation — how it builds, reveals, or transitions..." />
          </div>
          <div>
            <Label>Typography Animation</Label>
            <Textarea className="mt-1.5" rows={3} value={typographyAnim} onChange={(e) => setTypographyAnim(e.target.value)} placeholder="How type enters and exits — character by character, line by line, fade, slide..." />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reference Motion Assets</CardTitle>
          <CardDescription>Upload MP4, GIF, or Lottie files that demonstrate approved motion.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {referenceUrls.map((url, i) => (
              <UploadZone
                key={i}
                value={url}
                onUpload={(newUrl) => {
                  const updated = [...referenceUrls];
                  updated[i] = newUrl;
                  setReferenceUrls(updated);
                }}
                onRemove={() => setReferenceUrls(referenceUrls.filter((_, idx) => idx !== i))}
                accept=".mp4,.gif,.json,.mov"
                folder="brand-motion"
                className="h-20"
                previewType="video"
              />
            ))}
            <UploadZone
              onUpload={(url) => setReferenceUrls([...referenceUrls, url])}
              accept=".mp4,.gif,.json,.mov"
              folder="brand-motion"
              className="h-20"
              previewType="video"
              label="Upload MP4, GIF or Lottie"
            />
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
                {doItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="h-8 text-sm flex-1" value={item} onChange={(e) => updateListItem(doItems, setDoItems, i, e.target.value)} placeholder="e.g. Use motion to guide user attention" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDoItems((prev) => prev.filter((_, idx) => idx !== i))}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setDoItems((prev) => [...prev, ""])} className="w-full"><Plus className="mr-1.5 h-3.5 w-3.5" />Add</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-red-600 font-semibold uppercase tracking-wider">Don&apos;t</Label>
              <div className="mt-2 space-y-2">
                {dontItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="h-8 text-sm flex-1" value={item} onChange={(e) => updateListItem(dontItems, setDontItems, i, e.target.value)} placeholder="e.g. Use bouncy or elastic easing" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDontItems((prev) => prev.filter((_, idx) => idx !== i))}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setDontItems((prev) => [...prev, ""])} className="w-full"><Plus className="mr-1.5 h-3.5 w-3.5" />Add</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving…" : "Save Motion Guidelines"}
      </Button>
    </div>
  );
}
