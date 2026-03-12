"use client";

import { useState } from "react";
import { Upload, Plus, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const LOGO_TYPES = ["PRIMARY", "SECONDARY", "WORDMARK", "ICON", "MONOGRAM", "LOCKUP", "STACKED", "HORIZONTAL"];
const LOGO_VARIANTS = ["FULL_COLOUR", "MONO_BLACK", "MONO_WHITE", "REVERSED", "SINGLE_COLOUR", "OUTLINE"];

interface LogoAsset {
  id: string;
  name: string;
  type: string;
  variant: string;
  fileUrl: string;
  format: string;
  usageNote: string;
}

export default function LogoSystemPage() {
  const [assets, setAssets] = useState<LogoAsset[]>([]);
  const [clearSpace, setClearSpace] = useState("");
  const [minSizePx, setMinSizePx] = useState("");
  const [minSizeMm, setMinSizeMm] = useState("");
  const [usageRules, setUsageRules] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [backgroundUsage, setBackgroundUsage] = useState("");

  function addAsset() {
    setAssets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        type: "PRIMARY",
        variant: "FULL_COLOUR",
        fileUrl: "",
        format: "SVG",
        usageNote: "",
      },
    ]);
  }

  function removeAsset(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAsset(id: string, field: keyof LogoAsset, value: string) {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  }

  function handleSave() {
    console.log("Saving logo system...", { assets, clearSpace, minSizePx, usageRules, restrictions, backgroundUsage });
    // TODO: POST to /api/brands/[brandId]/logo-system
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Logo System</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Upload all logo variants and define usage rules for machine-readable output.
        </p>
      </div>

      {/* Logo Assets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Logo Assets</CardTitle>
          <CardDescription>
            Upload each logo variant — primary, secondary, wordmark, icon, lockups. Include all colour versions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="grid grid-cols-12 gap-3 rounded-lg border border-[var(--border)] p-4"
              >
                {/* Upload area */}
                <div className="col-span-2">
                  <div className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--accent)] transition-colors">
                    <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
                    <span className="mt-1 text-xs text-[var(--muted-foreground)]">Upload</span>
                  </div>
                </div>

                <div className="col-span-9 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={asset.name}
                      onChange={(e) => updateAsset(asset.id, "name", e.target.value)}
                      placeholder="e.g. Primary Logo"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Format</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={asset.format}
                      onChange={(e) => updateAsset(asset.id, "format", e.target.value)}
                      placeholder="SVG, PNG, EPS"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Type</Label>
                    <select
                      className="mt-1 h-8 w-full rounded-md border border-[var(--border)] bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                      value={asset.type}
                      onChange={(e) => updateAsset(asset.id, "type", e.target.value)}
                    >
                      {LOGO_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Colour Variant</Label>
                    <select
                      className="mt-1 h-8 w-full rounded-md border border-[var(--border)] bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                      value={asset.variant}
                      onChange={(e) => updateAsset(asset.id, "variant", e.target.value)}
                    >
                      {LOGO_VARIANTS.map((v) => (
                        <option key={v} value={v}>{v.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Usage Note</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={asset.usageNote}
                      onChange={(e) => updateAsset(asset.id, "usageNote", e.target.value)}
                      placeholder="When to use this variant..."
                    />
                  </div>
                </div>

                <div className="col-span-1 flex items-start justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAsset(asset.id)}
                    className="h-8 w-8 text-[var(--muted-foreground)] hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addAsset} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Logo Asset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Rules */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Usage Rules</CardTitle>
          <CardDescription>
            Define clear space, minimum sizes, and usage restrictions. These will be embedded in AI configs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Clear Space Rule</Label>
            <Input
              className="mt-1.5"
              value={clearSpace}
              onChange={(e) => setClearSpace(e.target.value)}
              placeholder="e.g. Minimum clear space equal to the x-height of the logotype"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Size (px)</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={minSizePx}
                onChange={(e) => setMinSizePx(e.target.value)}
                placeholder="e.g. 32"
              />
            </div>
            <div>
              <Label>Minimum Size (mm)</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={minSizeMm}
                onChange={(e) => setMinSizeMm(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div>
            <Label>Usage Rules</Label>
            <Textarea
              className="mt-1.5"
              rows={4}
              value={usageRules}
              onChange={(e) => setUsageRules(e.target.value)}
              placeholder="Describe when and how the logo should be used across different contexts..."
            />
          </div>

          <div>
            <Label>Restrictions</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="Do not rotate, skew, stretch, recolour, add effects to, or alter the logo in any way..."
            />
          </div>

          <div>
            <Label>Background Usage</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={backgroundUsage}
              onChange={(e) => setBackgroundUsage(e.target.value)}
              placeholder="Use full-colour logo on white or light backgrounds. Use reversed (white) logo on dark or brand colour backgrounds..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>Save Logo System</Button>
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <Info className="h-3.5 w-3.5" />
          This data feeds directly into your AI outputs
        </div>
      </div>
    </div>
  );
}
