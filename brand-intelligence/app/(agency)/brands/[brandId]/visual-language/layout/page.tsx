"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LayoutPage() {
  const [columns, setColumns] = useState("12");
  const [gutter, setGutter] = useState("24");
  const [margin, setMargin] = useState("32");
  const [baseUnit, setBaseUnit] = useState("8");
  const [layoutPrinciples, setLayoutPrinciples] = useState("");
  const [composition, setComposition] = useState("");
  const [safeZones, setSafeZones] = useState("");

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Layout & Grid</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Define grid system, spacing scale, and layout principles. Exported as design tokens.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Grid System</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Columns</Label>
              <Input className="mt-1.5 h-8 text-sm" value={columns} onChange={(e) => setColumns(e.target.value)} placeholder="12" />
            </div>
            <div>
              <Label className="text-xs">Gutter (px)</Label>
              <Input className="mt-1.5 h-8 text-sm" value={gutter} onChange={(e) => setGutter(e.target.value)} placeholder="24" />
            </div>
            <div>
              <Label className="text-xs">Margin (px)</Label>
              <Input className="mt-1.5 h-8 text-sm" value={margin} onChange={(e) => setMargin(e.target.value)} placeholder="32" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Base Spacing Unit (px)</Label>
            <Input className="mt-1.5 h-8 text-sm max-w-32" value={baseUnit} onChange={(e) => setBaseUnit(e.target.value)} placeholder="8" />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">All spacing values should be multiples of this base unit.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Layout Principles</CardTitle>
          <CardDescription>Compositional guidance included in AI visual outputs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Layout Principles</Label>
            <Textarea className="mt-1.5" rows={4} value={layoutPrinciples} onChange={(e) => setLayoutPrinciples(e.target.value)} placeholder="Describe the fundamental layout philosophy — e.g. Content breathes within generous white space. Grid is a guide, not a cage. Hierarchy is established through scale and weight, not decoration..." />
          </div>
          <div>
            <Label>Composition Rules</Label>
            <Textarea className="mt-1.5" rows={4} value={composition} onChange={(e) => setComposition(e.target.value)} placeholder="e.g. Primary content always anchors to the left grid edge. Large-scale typography used to create tension with imagery. Never centre-align body copy. Asymmetry is preferred over symmetry..." />
          </div>
          <div>
            <Label>Safe Zones</Label>
            <Textarea className="mt-1.5" rows={3} value={safeZones} onChange={(e) => setSafeZones(e.target.value)} placeholder="Minimum padding around edges for print and digital. Logo safe zone. Text exclusion zones near imagery..." />
          </div>
        </CardContent>
      </Card>

      <Button>Save Layout & Grid</Button>
    </div>
  );
}
