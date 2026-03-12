"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PersonalityTrait {
  id: string;
  trait: string;
  description: string;
  inPractice: string;
}

interface ExampleCopy {
  id: string;
  context: string;
  good: string;
  bad: string;
}

function newTrait(): PersonalityTrait {
  return { id: crypto.randomUUID(), trait: "", description: "", inPractice: "" };
}

function newExample(): ExampleCopy {
  return { id: crypto.randomUUID(), context: "", good: "", bad: "" };
}

export default function BrandVoicePage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [traits, setTraits] = useState<PersonalityTrait[]>([newTrait()]);
  const [toneVariants, setToneVariants] = useState({
    formal: "",
    informal: "",
    celebratory: "",
    serious: "",
  });
  const [messagingPromise, setMessagingPromise] = useState("");
  const [messagingPillars, setMessagingPillars] = useState<string[]>(["", "", ""]);
  const [useWords, setUseWords] = useState<string[]>([""]);
  const [avoidWords, setAvoidWords] = useState<string[]>([""]);
  const [grammarNotes, setGrammarNotes] = useState("");
  const [doList, setDoList] = useState<string[]>([""]);
  const [dontList, setDontList] = useState<string[]>([""]);
  const [examples, setExamples] = useState<ExampleCopy[]>([newExample()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/brands/${brandId}/voice`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        if (data.personality) setTraits(data.personality as PersonalityTrait[]);
        if (data.toneVariants) setToneVariants(data.toneVariants as typeof toneVariants);
        const mh = data.messagingHierarchy as { promise?: string; pillars?: string[] } | null;
        if (mh) {
          setMessagingPromise(mh.promise ?? "");
          setMessagingPillars(mh.pillars?.length ? mh.pillars : ["", "", ""]);
        }
        const vocab = data.vocabulary as { use?: string[]; avoid?: string[]; grammarNotes?: string } | null;
        if (vocab) {
          setUseWords(vocab.use?.length ? vocab.use : [""]);
          setAvoidWords(vocab.avoid?.length ? vocab.avoid : [""]);
          setGrammarNotes(vocab.grammarNotes ?? "");
        }
        setDoList(data.doList?.length ? data.doList : [""]);
        setDontList(data.dontList?.length ? data.dontList : [""]);
        if (data.exampleCopy) setExamples(data.exampleCopy as ExampleCopy[]);
      })
      .catch(() => {});
  }, [brandId]);

  async function handleSave() {
    setIsSaving(true);
    await fetch(`/api/brands/${brandId}/voice`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personality: traits,
        toneVariants,
        messagingHierarchy: { promise: messagingPromise, pillars: messagingPillars.filter(Boolean) },
        vocabulary: { use: useWords.filter(Boolean), avoid: avoidWords.filter(Boolean), grammarNotes },
        doList: doList.filter(Boolean),
        dontList: dontList.filter(Boolean),
        exampleCopy: examples,
      }),
    });
    setIsSaving(false);
  }

  function updateTrait(id: string, field: keyof PersonalityTrait, value: string) {
    setTraits((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  function updateExample(id: string, field: keyof ExampleCopy, value: string) {
    setExamples((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function updateListItem(list: string[], setList: (v: string[]) => void, index: number, value: string) {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  }

  function addToList(setList: (v: string[]) => void, current: string[]) {
    setList([...current, ""]);
  }

  function removeFromList(list: string[], setList: (v: string[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index));
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Brand Voice & Tone</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define brand personality, tone, messaging, and language rules — embedded directly into AI system prompts.
        </p>
      </div>

      {/* Personality */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Brand Personality Traits</CardTitle>
              <CardDescription className="mt-1">
                Each trait feeds into the LLM system prompt to ensure consistent brand voice.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setTraits((prev) => [...prev, newTrait()])}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Trait
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {traits.map((trait, i) => (
              <div key={trait.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex items-start justify-between mb-3">
                  <Input
                    className="h-8 text-sm font-medium max-w-48"
                    value={trait.trait}
                    onChange={(e) => updateTrait(trait.id, "trait", e.target.value)}
                    placeholder={`Trait ${i + 1} — e.g. Bold`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--muted-foreground)] hover:text-red-500"
                    onClick={() => setTraits((prev) => prev.filter((t) => t.id !== trait.id))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      className="mt-1 text-xs"
                      rows={2}
                      value={trait.description}
                      onChange={(e) => updateTrait(trait.id, "description", e.target.value)}
                      placeholder="What this trait means for the brand..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">In Practice</Label>
                    <Textarea
                      className="mt-1 text-xs"
                      rows={2}
                      value={trait.inPractice}
                      onChange={(e) => updateTrait(trait.id, "inPractice", e.target.value)}
                      placeholder="How this shows up in copy, headlines, CTAs..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tone Variants */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tone by Context</CardTitle>
          <CardDescription>
            How tone shifts across different situations while maintaining consistent voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(toneVariants) as (keyof typeof toneVariants)[]).map((key) => (
            <div key={key}>
              <Label className="capitalize text-xs">{key} contexts</Label>
              <Textarea
                className="mt-1.5 text-sm"
                rows={2}
                value={toneVariants[key]}
                onChange={(e) => setToneVariants((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={`How the brand sounds in ${key} situations — e.g. ${
                  key === "formal"
                    ? "precise, professional, but never stuffy"
                    : key === "informal"
                    ? "warm, direct, conversational"
                    : key === "celebratory"
                    ? "enthusiastic and genuinely joyful, never hollow"
                    : "empathetic and clear, never cold or corporate"
                }...`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Messaging Hierarchy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Messaging Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Brand Promise / Purpose Statement</Label>
            <Textarea
              className="mt-1.5"
              rows={2}
              value={messagingPromise}
              onChange={(e) => setMessagingPromise(e.target.value)}
              placeholder="The single core promise or purpose statement that underpins all brand communication..."
            />
          </div>
          <div>
            <Label>Brand Pillars</Label>
            <div className="mt-2 space-y-2">
              {messagingPillars.map((pillar, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex h-8 w-6 shrink-0 items-center justify-center text-xs text-[var(--muted-foreground)] font-mono">
                    {i + 1}
                  </div>
                  <Input
                    className="h-8 text-sm flex-1"
                    value={pillar}
                    onChange={(e) => updateListItem(messagingPillars, setMessagingPillars, i, e.target.value)}
                    placeholder={`Pillar ${i + 1} — e.g. Uncompromising quality`}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFromList(messagingPillars, setMessagingPillars, i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addToList(setMessagingPillars, messagingPillars)} className="w-full">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Pillar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vocabulary</CardTitle>
          <CardDescription>Specific words and phrases to use or avoid — embedded in AI prompts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Use These Words</Label>
              <div className="mt-2 space-y-2">
                {useWords.map((word, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="h-7 text-xs flex-1" value={word} onChange={(e) => updateListItem(useWords, setUseWords, i, e.target.value)} placeholder="e.g. bold, genuine, craft" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFromList(useWords, setUseWords, i)}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addToList(setUseWords, useWords)} className="w-full"><Plus className="mr-1 h-3 w-3" />Add</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-red-600 font-semibold uppercase tracking-wider">Avoid These Words</Label>
              <div className="mt-2 space-y-2">
                {avoidWords.map((word, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="h-7 text-xs flex-1" value={word} onChange={(e) => updateListItem(avoidWords, setAvoidWords, i, e.target.value)} placeholder="e.g. innovative, disruptive, synergy" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFromList(avoidWords, setAvoidWords, i)}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addToList(setAvoidWords, avoidWords)} className="w-full"><Plus className="mr-1 h-3 w-3" />Add</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grammar & Language Rules */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Grammar & Language Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={grammarNotes}
            onChange={(e) => setGrammarNotes(e.target.value)}
            placeholder="e.g. We use sentence case for all headlines. Oxford comma always. Numbers under ten are spelled out. We never use exclamation marks in formal contexts. Always write 'and' not '&'..."
          />
        </CardContent>
      </Card>

      {/* Do / Don't */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Voice Do / Don&apos;t</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Do</Label>
              <div className="mt-2 space-y-2">
                {doList.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="h-8 text-sm flex-1" value={item} onChange={(e) => updateListItem(doList, setDoList, i, e.target.value)} placeholder="e.g. Speak directly to the reader" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFromList(doList, setDoList, i)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addToList(setDoList, doList)} className="w-full"><Plus className="mr-1.5 h-3.5 w-3.5" />Add</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-red-600 font-semibold uppercase tracking-wider">Don&apos;t</Label>
              <div className="mt-2 space-y-2">
                {dontList.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="h-8 text-sm flex-1" value={item} onChange={(e) => updateListItem(dontList, setDontList, i, e.target.value)} placeholder="e.g. Use jargon or buzzwords" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFromList(dontList, setDontList, i)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addToList(setDontList, dontList)} className="w-full"><Plus className="mr-1.5 h-3.5 w-3.5" />Add</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copy Examples */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Copy Examples</CardTitle>
              <CardDescription className="mt-1">Good vs. bad examples used to train AI tone of voice.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setExamples((prev) => [...prev, newExample()])}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Example
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examples.map((ex) => (
              <div key={ex.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <Input className="h-7 text-xs max-w-64" value={ex.context} onChange={(e) => updateExample(ex.id, "context", e.target.value)} placeholder="Context — e.g. Homepage headline, Social post, Error message" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500" onClick={() => setExamples((prev) => prev.filter((e) => e.id !== ex.id))}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-emerald-700">Good Example</Label>
                    <Textarea className="mt-1 text-xs border-emerald-200" rows={3} value={ex.good} onChange={(e) => updateExample(ex.id, "good", e.target.value)} placeholder="Write good copy example here..." />
                  </div>
                  <div>
                    <Label className="text-xs text-red-600">Bad Example</Label>
                    <Textarea className="mt-1 text-xs border-red-200" rows={3} value={ex.bad} onChange={(e) => updateExample(ex.id, "bad", e.target.value)} placeholder="Write bad copy example here..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving…" : "Save Brand Voice"}
      </Button>
    </div>
  );
}
