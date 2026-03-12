import { notFound } from "next/navigation";
import { Download, Copy, Layers, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

async function getBrandForPortal(brandId: string) {
  return prisma.brand.findUnique({
    where: { id: brandId },
    select: {
      id: true,
      name: true,
      brandConfig: true,
      configVersion: true,
      updatedAt: true,
      client: {
        select: {
          name: true,
          agency: { select: { name: true } },
        },
      },
      logoSystem: { select: { id: true } },
      colourSystem: { select: { id: true } },
      typography: { select: { id: true } },
      photography: { select: { id: true } },
      illustration: { select: { id: true } },
      motion: { select: { id: true } },
      iconography: { select: { id: true } },
      gridLayout: { select: { id: true } },
      pattern: { select: { id: true } },
      brandVoice: { select: { id: true } },
    },
  });
}

const MODULE_LABELS: Record<string, string> = {
  logoSystem: "Logo System",
  colourSystem: "Colours",
  typography: "Typography",
  photography: "Photography",
  illustration: "Illustration",
  motion: "Motion",
  iconography: "Iconography",
  gridLayout: "Grid & Layout",
  pattern: "Pattern & Texture",
  brandVoice: "Brand Voice",
};

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const brand = await getBrandForPortal(brandId);

  if (!brand) notFound();

  const agencyName = brand.client.agency.name;

  const modules = Object.entries(MODULE_LABELS).map(([key, label]) => ({
    key,
    label,
    complete: Boolean((brand as Record<string, unknown>)[key]),
  }));

  const completedCount = modules.filter((m) => m.complete).length;
  const hasConfig = Boolean(brand.brandConfig);

  const config = brand.brandConfig as Record<string, unknown> | null;

  function getOutputContent(id: string): string {
    if (!config) return "";
    const imgPrompts = config.imageGenPrompts as Record<string, string> | undefined;
    const llmPrompts = config.llmSystemPrompts as Record<string, string> | undefined;
    const tokens = config.designTokens as Record<string, unknown> | undefined;
    switch (id) {
      case "midjourney": return imgPrompts?.midjourney ?? "";
      case "dalle": return imgPrompts?.dalle ?? "";
      case "firefly": return imgPrompts?.firefly ?? "";
      case "claude": return llmPrompts?.full ?? "";
      case "css": return (tokens?.colours as Record<string, string>)?.css ?? (tokens?.css as string) ?? "";
      case "json": return JSON.stringify((tokens?.colours as Record<string, unknown>)?.json ?? tokens ?? {}, null, 2);
      case "universal": return JSON.stringify(config.universalConfig ?? config, null, 2);
      default: return "";
    }
  }

  const outputs = hasConfig
    ? [
        { id: "midjourney", name: "Midjourney Prompt", badge: "Image Gen" },
        { id: "dalle", name: "DALL-E 3 Prompt", badge: "Image Gen" },
        { id: "firefly", name: "Adobe Firefly Style", badge: "Image Gen" },
        { id: "claude", name: "Claude / ChatGPT System Prompt", badge: "LLM" },
        { id: "css", name: "CSS Design Tokens", badge: "Dev" },
        { id: "json", name: "JSON Design Tokens", badge: "Dev" },
        { id: "universal", name: "Universal Brand Config", badge: "API" },
      ]
    : [];

  const lastGenerated = brand.configVersion > 0
    ? brand.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--primary)]">
              <Layers className="h-3.5 w-3.5 text-[var(--primary-foreground)]" />
            </div>
            <span className="text-sm font-semibold">Brand Intelligence</span>
            <span className="text-[var(--muted-foreground)]">·</span>
            <span className="text-sm text-[var(--muted-foreground)]">{agencyName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {/* Brand header */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{brand.name}</h1>
              <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
                {hasConfig
                  ? `Brand Intelligence Config · v${brand.configVersion} · Generated ${lastGenerated}`
                  : "Brand config not yet generated"}
              </p>
            </div>
            {hasConfig && (
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Full Package
              </Button>
            )}
          </div>
        </div>

        {!hasConfig ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]">
                <Layers className="h-6 w-6 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">Config not yet generated</h3>
              <p className="mt-1.5 text-sm text-[var(--muted-foreground)] max-w-sm">
                {agencyName} is still building your brand system. Check back soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              {/* Available Outputs */}
              <div>
                <h2 className="text-sm font-semibold mb-4">Available AI Outputs</h2>
                <div className="space-y-3">
                  {outputs.map((output) => (
                    <div
                      key={output.id}
                      className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{output.name}</p>
                          <Badge variant="secondary">{output.badge}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          data-copy={getOutputContent(output.id)}
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copy
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">API Access</CardTitle>
                  <CardDescription>
                    Access your brand config programmatically from any platform or tool
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-[var(--muted)] p-3 font-mono text-xs flex items-center justify-between gap-3">
                    <span className="truncate text-[var(--muted-foreground)]">
                      GET /api/brands/{brandId}/config
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                    Contact {agencyName} to receive your API key and integration documentation.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    View API Docs
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Brand System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[var(--muted-foreground)]">Complete</span>
                    <span className="text-xs font-medium">
                      {completedCount}/{modules.length}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--muted)] overflow-hidden mb-4">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full"
                      style={{ width: `${(completedCount / modules.length) * 100}%` }}
                    />
                  </div>
                  <ul className="space-y-2">
                    {modules.map((module) => (
                      <li key={module.key} className="flex items-center gap-2 text-xs">
                        <div
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            module.complete ? "bg-emerald-500" : "bg-[var(--muted-foreground)]/30"
                          }`}
                        />
                        <span
                          className={
                            module.complete
                              ? "text-[var(--foreground)]"
                              : "text-[var(--muted-foreground)]"
                          }
                        >
                          {module.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Need help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[var(--muted-foreground)] mb-3">
                    Questions about integrating your brand config or using these outputs?
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Contact {agencyName}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
