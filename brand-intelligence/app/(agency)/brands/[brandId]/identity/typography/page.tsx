"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TYPEFACE_ROLES = ["PRIMARY", "SECONDARY", "DISPLAY", "BODY", "ACCENT", "MONOSPACE", "EDITORIAL"];
const WEIGHT_OPTIONS = ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black", "Italic", "Bold Italic"];

interface Typeface {
  id: string;
  name: string;
  role: string;
  weights: string[];
  source: string;
  fallbackStack: string;
  usageRules: string;
  licenseNote: string;
}

function newTypeface(): Typeface {
  return {
    id: crypto.randomUUID(),
    name: "",
    role: "PRIMARY",
    weights: ["Regular"],
    source: "",
    fallbackStack: "",
    usageRules: "",
    licenseNote: "",
  };
}

export default function TypographyPage() {
  const [typefaces, setTypefaces] = useState<Typeface[]>([newTypeface()]);
  const [hierarchyRules, setHierarchyRules] = useState("");
  const [usageGuidelines, setUsageGuidelines] = useState("");
  const [pairingRules, setPairingRules] = useState("");

  function addTypeface() {
    setTypefaces((t) => [...t, newTypeface()]);
  }

  function removeTypeface(id: string) {
    setTypefaces((t) => t.filter((tf) => tf.id !== id));
  }

  function updateTypeface(id: string, field: keyof Typeface, value: string | string[]) {
    setTypefaces((t) =>
      t.map((tf) => (tf.id === id ? { ...tf, [field]: value } : tf))
    );
  }

  function toggleWeight(id: string, weight: string) {
    setTypefaces((t) =>
      t.map((tf) => {
        if (tf.id !== id) return tf;
        const has = tf.weights.includes(weight);
        return {
          ...tf,
          weights: has
            ? tf.weights.filter((w) => w !== weight)
            : [...tf.weights, weight],
        };
      })
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Typography</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define typefaces, their roles, weights, and usage rules for AI-readable type guidance.
        </p>
      </div>

      <div className="space-y-6">
        {typefaces.map((tf) => (
          <Card key={tf.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">
                  {tf.name || "Unnamed Typeface"}
                  {tf.role && (
                    <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                      ({tf.role.toLowerCase()})
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[var(--muted-foreground)] hover:text-red-500"
                  onClick={() => removeTypeface(tf.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Typeface Name</Label>
                  <Input
                    className="mt-1.5 h-8 text-sm"
                    value={tf.name}
                    onChange={(e) => updateTypeface(tf.id, "name", e.target.value)}
                    placeholder="e.g. Neue Haas Grotesk"
                  />
                </div>
                <div>
                  <Label className="text-xs">Role</Label>
                  <select
                    className="mt-1.5 h-8 w-full rounded-md border border-[var(--border)] bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                    value={tf.role}
                    onChange={(e) => updateTypeface(tf.id, "role", e.target.value)}
                  >
                    {TYPEFACE_ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Source / Foundry</Label>
                  <Input
                    className="mt-1.5 h-8 text-sm"
                    value={tf.source}
                    onChange={(e) => updateTypeface(tf.id, "source", e.target.value)}
                    placeholder="Google Fonts, Adobe Fonts, Linotype..."
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Available Weights</Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {WEIGHT_OPTIONS.map((w) => (
                    <button
                      key={w}
                      onClick={() => toggleWeight(tf.id, w)}
                      className={`rounded-md border px-2.5 py-0.5 text-xs transition-colors ${
                        tf.weights.includes(w)
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">Fallback Stack</Label>
                <Input
                  className="mt-1.5 h-8 text-sm font-mono"
                  value={tf.fallbackStack}
                  onChange={(e) => updateTypeface(tf.id, "fallbackStack", e.target.value)}
                  placeholder={`"Neue Haas Grotesk", Helvetica, Arial, sans-serif`}
                />
              </div>

              <div>
                <Label className="text-xs">Usage Rules</Label>
                <Textarea
                  className="mt-1.5 text-sm"
                  rows={2}
                  value={tf.usageRules}
                  onChange={(e) => updateTypeface(tf.id, "usageRules", e.target.value)}
                  placeholder="Use for headlines and display text at sizes above 24pt. Never use below 12pt..."
                />
              </div>

              <div>
                <Label className="text-xs">License Note</Label>
                <Input
                  className="mt-1.5 h-8 text-sm"
                  value={tf.licenseNote}
                  onChange={(e) => updateTypeface(tf.id, "licenseNote", e.target.value)}
                  placeholder="e.g. Desktop + web license required. Do not use in app without mobile license."
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addTypeface} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Typeface
        </Button>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Typography Guidelines</CardTitle>
            <CardDescription>
              Hierarchy, pairing, and usage rules embedded in AI prompts and system configs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Type Hierarchy Rules</Label>
              <Textarea
                className="mt-1.5"
                rows={4}
                value={hierarchyRules}
                onChange={(e) => setHierarchyRules(e.target.value)}
                placeholder="Define the heading hierarchy — H1 uses Display typeface at 64px/Bold, H2 uses Primary at 40px/SemiBold, body copy uses Body typeface at 16px/Regular..."
              />
            </div>
            <div>
              <Label>Typeface Pairing Rules</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                value={pairingRules}
                onChange={(e) => setPairingRules(e.target.value)}
                placeholder="Display typeface pairs with Body typeface for body copy. Never pair two display typefaces together..."
              />
            </div>
            <div>
              <Label>General Usage Guidelines</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                value={usageGuidelines}
                onChange={(e) => setUsageGuidelines(e.target.value)}
                placeholder="Additional context about typographic style, tracking, leading, alignment preferences..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button>Save Typography</Button>
      </div>
    </div>
  );
}
