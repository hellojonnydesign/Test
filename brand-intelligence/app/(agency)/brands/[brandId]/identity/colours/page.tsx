"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Colour {
  id: string;
  name: string;
  hex: string;
  pantone: string;
  cmyk: string;
  usageNote: string;
  isPrimary: boolean;
}

interface Palette {
  id: string;
  name: string;
  role: string;
  colours: Colour[];
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function newColour(): Colour {
  return {
    id: crypto.randomUUID(),
    name: "",
    hex: "#000000",
    pantone: "",
    cmyk: "",
    usageNote: "",
    isPrimary: false,
  };
}

function newPalette(): Palette {
  return {
    id: crypto.randomUUID(),
    name: "",
    role: "",
    colours: [newColour()],
  };
}

export default function ColoursPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [palettes, setPalettes] = useState<Palette[]>([newPalette()]);
  const [usageRules, setUsageRules] = useState("");
  const [accessibilityNotes, setAccessibilityNotes] = useState("");
  const [darkModeGuidance, setDarkModeGuidance] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/brands/${brandId}/colour-system`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setUsageRules(data.usageRules ?? "");
        setAccessibilityNotes(data.accessibilityNotes ?? "");
        setDarkModeGuidance(data.darkModeGuidance ?? "");
        if (data.palettes?.length) {
          setPalettes(
            data.palettes.map((pal: { id: string; name: string; role?: string; colours: Array<{ id: string; name: string; hex: string; pantone?: string; cmyk?: { value?: string } | string | null; usageNote?: string; isPrimary?: boolean }> }) => ({
              id: pal.id,
              name: pal.name,
              role: pal.role ?? "",
              colours: pal.colours.map((c) => ({
                id: c.id,
                name: c.name,
                hex: c.hex,
                pantone: c.pantone ?? "",
                cmyk: typeof c.cmyk === "object" && c.cmyk !== null ? (c.cmyk as { value?: string }).value ?? "" : (c.cmyk as string) ?? "",
                usageNote: c.usageNote ?? "",
                isPrimary: c.isPrimary ?? false,
              })),
            }))
          );
        }
      })
      .catch(() => {});
  }, [brandId]);

  async function handleSave() {
    setIsSaving(true);
    await fetch(`/api/brands/${brandId}/colour-system`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ palettes, usageRules, accessibilityNotes, darkModeGuidance }),
    });
    setIsSaving(false);
  }

  function addPalette() {
    setPalettes((p) => [...p, newPalette()]);
  }

  function removePalette(id: string) {
    setPalettes((p) => p.filter((pal) => pal.id !== id));
  }

  function updatePalette(id: string, field: "name" | "role", value: string) {
    setPalettes((p) =>
      p.map((pal) => (pal.id === id ? { ...pal, [field]: value } : pal))
    );
  }

  function addColour(paletteId: string) {
    setPalettes((p) =>
      p.map((pal) =>
        pal.id === paletteId
          ? { ...pal, colours: [...pal.colours, newColour()] }
          : pal
      )
    );
  }

  function removeColour(paletteId: string, colourId: string) {
    setPalettes((p) =>
      p.map((pal) =>
        pal.id === paletteId
          ? { ...pal, colours: pal.colours.filter((c) => c.id !== colourId) }
          : pal
      )
    );
  }

  function updateColour(
    paletteId: string,
    colourId: string,
    field: keyof Colour,
    value: string | boolean
  ) {
    setPalettes((p) =>
      p.map((pal) =>
        pal.id === paletteId
          ? {
              ...pal,
              colours: pal.colours.map((c) =>
                c.id === colourId ? { ...c, [field]: value } : c
              ),
            }
          : pal
      )
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Colour System</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define all brand colour palettes with full colour specifications for AI output.
        </p>
      </div>

      <div className="space-y-6">
        {palettes.map((palette, pi) => (
          <Card key={palette.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="grid grid-cols-2 gap-3 flex-1 mr-4">
                  <div>
                    <Label className="text-xs">Palette Name</Label>
                    <Input
                      className="mt-1 h-8 text-sm"
                      value={palette.name}
                      onChange={(e) => updatePalette(palette.id, "name", e.target.value)}
                      placeholder="e.g. Primary, Secondary, Neutral"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Input
                      className="mt-1 h-8 text-sm"
                      value={palette.role}
                      onChange={(e) => updatePalette(palette.id, "role", e.target.value)}
                      placeholder="e.g. background, text, accent"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[var(--muted-foreground)] hover:text-red-500 shrink-0"
                  onClick={() => removePalette(palette.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {palette.colours.map((colour) => {
                  const rgb = hexToRgb(colour.hex);
                  return (
                    <div
                      key={colour.id}
                      className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3"
                    >
                      <GripVertical className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 cursor-grab" />

                      {/* Colour swatch + picker */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className="h-10 w-10 rounded-md border border-[var(--border)] shadow-inner"
                          style={{ backgroundColor: colour.hex }}
                        />
                        <input
                          type="color"
                          value={colour.hex}
                          onChange={(e) =>
                            updateColour(palette.id, colour.id, "hex", e.target.value)
                          }
                          className="sr-only"
                          id={`color-${colour.id}`}
                        />
                        <label htmlFor={`color-${colour.id}`} className="cursor-pointer text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          Pick
                        </label>
                      </div>

                      <div className="grid grid-cols-5 gap-2 flex-1">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input
                            className="mt-0.5 h-7 text-xs"
                            value={colour.name}
                            onChange={(e) =>
                              updateColour(palette.id, colour.id, "name", e.target.value)
                            }
                            placeholder="e.g. Midnight"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">HEX</Label>
                          <Input
                            className="mt-0.5 h-7 text-xs font-mono"
                            value={colour.hex}
                            onChange={(e) =>
                              updateColour(palette.id, colour.id, "hex", e.target.value)
                            }
                            placeholder="#000000"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">RGB</Label>
                          <Input
                            className="mt-0.5 h-7 text-xs font-mono"
                            readOnly
                            value={rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : ""}
                            placeholder="auto"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Pantone</Label>
                          <Input
                            className="mt-0.5 h-7 text-xs"
                            value={colour.pantone}
                            onChange={(e) =>
                              updateColour(palette.id, colour.id, "pantone", e.target.value)
                            }
                            placeholder="e.g. 2767 C"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">CMYK</Label>
                          <Input
                            className="mt-0.5 h-7 text-xs"
                            value={colour.cmyk}
                            onChange={(e) =>
                              updateColour(palette.id, colour.id, "cmyk", e.target.value)
                            }
                            placeholder="C0 M0 Y0 K100"
                          />
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500 shrink-0"
                        onClick={() => removeColour(palette.id, colour.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addColour(palette.id)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add Colour
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addPalette} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Palette
        </Button>
      </div>

      {/* Guidelines */}
      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Colour Usage Guidelines</CardTitle>
            <CardDescription>
              These rules will be included in AI system prompts and image generation guidance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Usage Rules</Label>
              <Textarea
                className="mt-1.5"
                rows={4}
                value={usageRules}
                onChange={(e) => setUsageRules(e.target.value)}
                placeholder="Describe how colours should be applied across different contexts — backgrounds, typography, UI elements, print, digital..."
              />
            </div>
            <div>
              <Label>Accessibility Notes</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                value={accessibilityNotes}
                onChange={(e) => setAccessibilityNotes(e.target.value)}
                placeholder="WCAG contrast requirements, minimum contrast ratios, accessible colour combinations..."
              />
            </div>
            <div>
              <Label>Dark Mode Guidance</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                value={darkModeGuidance}
                onChange={(e) => setDarkModeGuidance(e.target.value)}
                placeholder="How brand colours adapt for dark backgrounds and dark mode interfaces..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save Colour System"}
        </Button>
      </div>
    </div>
  );
}
