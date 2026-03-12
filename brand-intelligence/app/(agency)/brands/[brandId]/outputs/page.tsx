"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Zap, Copy, Check, Loader2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CopiedState {
  [key: string]: boolean;
}

function getStr(obj: unknown, ...keys: string[]): string {
  let cur: unknown = obj;
  for (const k of keys) {
    if (!cur || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === "string" ? cur : typeof cur === "object" ? JSON.stringify(cur, null, 2) : String(cur ?? "");
}

export default function OutputsPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [configVersion, setConfigVersion] = useState(0);
  const [copied, setCopied] = useState<CopiedState>({});

  useEffect(() => {
    fetch(`/api/brands/${brandId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.brandConfig) {
          setConfig(data.brandConfig as Record<string, unknown>);
          setConfigVersion(data.configVersion ?? 0);
        }
      })
      .catch(() => {});
  }, [brandId]);

  async function generateConfig() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/brands/${brandId}/generate`, { method: "POST" });
      const data = await res.json();
      if (data.config) {
        setConfig(data.config as Record<string, unknown>);
        setConfigVersion((v) => v + 1);
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
  }

  function downloadText(filename: string, text: string) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const imageGenPlatforms = [
    {
      id: "midjourney",
      name: "Midjourney",
      badge: "Image Gen",
      description: "Style reference prompt with parameters for Midjourney v6",
      content: getStr(config, "imageGenPrompts", "midjourney"),
    },
    {
      id: "dalle",
      name: "DALL-E 3",
      badge: "Image Gen",
      description: "Detailed system prompt for OpenAI DALL-E 3",
      content: getStr(config, "imageGenPrompts", "dalle"),
    },
    {
      id: "firefly",
      name: "Adobe Firefly",
      badge: "Image Gen",
      description: "Style descriptor for Adobe Firefly generative AI",
      content: getStr(config, "imageGenPrompts", "firefly"),
    },
  ];

  const llmPrompt = getStr(config, "llmSystemPrompts", "full");
  const concisePrompt = getStr(config, "llmSystemPrompts", "concise");

  const designTokens = config?.designTokens as Record<string, unknown> | undefined;
  const cssTokens = getStr(designTokens, "colours", "css") || getStr(designTokens, "css");
  const jsonTokensRaw = (designTokens?.colours as Record<string, unknown>)?.json
    || (designTokens?.json)
    || designTokens;
  const jsonTokens = typeof jsonTokensRaw === "string" ? jsonTokensRaw : JSON.stringify(jsonTokensRaw, null, 2);

  const universalConfig = JSON.stringify(
    (config?.universalConfig as Record<string, unknown>) ?? config ?? {},
    null,
    2
  );

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Outputs</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Generate machine-readable brand configs and platform-specific prompts from your brand system.
          </p>
          {configVersion > 0 && (
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Config v{configVersion}
            </p>
          )}
        </div>
        <Button onClick={generateConfig} disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              {config ? "Regenerate" : "Generate Brand Config"}
            </>
          )}
        </Button>
      </div>

      {!config && !generating && (
        <Card className="mb-6 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]">
              <Zap className="h-6 w-6 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">Ready to generate</h3>
            <p className="mt-1.5 max-w-sm text-sm text-[var(--muted-foreground)]">
              Complete the brand system modules then click Generate to create AI-ready configs for all platforms.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["Midjourney", "DALL-E 3", "Adobe Firefly", "Claude", "ChatGPT", "Canva AI", "Design Tokens"].map(
                (p) => (
                  <Badge key={p} variant="secondary">{p}</Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {generating && (
        <Card className="mb-6">
          <CardContent className="py-10">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
              <div className="text-center">
                <p className="text-sm font-medium">Brand Intelligence Engine running</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Claude is synthesising your brand system into AI-ready outputs...
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {[
                  "Analysing visual identity...",
                  "Building colour descriptors...",
                  "Generating image prompts...",
                  "Crafting LLM system prompts...",
                  "Exporting design tokens...",
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    <span className="text-[var(--muted-foreground)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {config && !generating && (
        <Tabs defaultValue="image-gen">
          <TabsList className="mb-6">
            <TabsTrigger value="image-gen">Image Generation</TabsTrigger>
            <TabsTrigger value="llm">LLM System Prompts</TabsTrigger>
            <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
            <TabsTrigger value="universal">Universal Config</TabsTrigger>
          </TabsList>

          <TabsContent value="image-gen" className="space-y-4">
            {imageGenPlatforms.map((platform) => (
              <Card key={platform.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{platform.name}</CardTitle>
                      <Badge variant="secondary">{platform.badge}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(platform.id, platform.content)}
                      disabled={!platform.content}
                    >
                      {copied[platform.id] ? (
                        <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />Copied</>
                      ) : (
                        <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>
                      )}
                    </Button>
                  </div>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="rounded-lg bg-[var(--muted)] p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-48 text-[var(--foreground)]">
                    {platform.content || "Not generated"}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="llm" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Claude / ChatGPT System Prompt</CardTitle>
                    <Badge variant="secondary">LLM Prompt</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard("claude", llmPrompt)} disabled={!llmPrompt}>
                      {copied["claude"] ? <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />Copied</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadText("brand-system-prompt.txt", llmPrompt)} disabled={!llmPrompt}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />Export
                    </Button>
                  </div>
                </div>
                <CardDescription>Full system prompt covering brand voice, visual guidelines, and usage rules</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-[var(--muted)] p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96 text-[var(--foreground)]">
                  {llmPrompt || "Not generated"}
                </pre>
              </CardContent>
            </Card>
            {concisePrompt && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Concise System Prompt</CardTitle>
                      <Badge variant="secondary">LLM Prompt</Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard("concise", concisePrompt)}>
                      {copied["concise"] ? <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />Copied</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>}
                    </Button>
                  </div>
                  <CardDescription>Shortened version for context-limited applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="rounded-lg bg-[var(--muted)] p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-64 text-[var(--foreground)]">
                    {concisePrompt}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tokens" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">CSS Custom Properties</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard("css", cssTokens)} disabled={!cssTokens}>
                    {copied["css"] ? <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />Copied</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>}
                  </Button>
                </div>
                <CardDescription>Brand design tokens as CSS variables — drop into any web project</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-[var(--muted)] p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-64">
                  {cssTokens || "Not generated"}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">JSON Tokens</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard("json", jsonTokens)} disabled={!jsonTokens}>
                      {copied["json"] ? <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />Copied</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadText("tokens.json", jsonTokens)} disabled={!jsonTokens}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />tokens.json
                    </Button>
                  </div>
                </div>
                <CardDescription>W3C Design Token format — compatible with Style Dictionary, Figma Tokens, and other tools</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-[var(--muted)] p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-64">
                  {jsonTokens || "Not generated"}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="universal">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Universal Brand Config</CardTitle>
                    <CardDescription className="mt-1">Complete machine-readable brand intelligence package — use via API or export as JSON</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard("universal", universalConfig)}>
                      {copied["universal"] ? <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />Copied</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadText("brand-config.json", universalConfig)}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />brand-config.json
                    </Button>
                    <Button variant="secondary" size="sm" onClick={generateConfig}>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Regenerate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-[var(--muted)] p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96">
                  {universalConfig}
                </pre>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">API Access</CardTitle>
                <CardDescription>Programmatically access this brand config from any platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">GET</p>
                  <code className="text-xs font-mono">
                    /api/brands/{brandId}/config
                  </code>
                </div>
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Returns the full brand config JSON. Authenticate with your API key in the Authorization header.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
