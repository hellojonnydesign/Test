import Link from "next/link";
import { Plus, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary"> = {
  COMPLETE: "success",
  IN_PROGRESS: "warning",
  DRAFT: "secondary",
  ARCHIVED: "secondary",
};

const statusLabel: Record<string, string> = {
  COMPLETE: "Complete",
  IN_PROGRESS: "In Progress",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function moduleCount(brand: Record<string, unknown>) {
  return [
    brand.logoSystem, brand.colourSystem, brand.typography,
    brand.photography, brand.illustration, brand.motion,
    brand.iconography, brand.gridLayout, brand.pattern, brand.brandVoice,
  ].filter(Boolean).length;
}

export default async function DashboardPage() {
  const [brands, clientCount] = await Promise.all([
    prisma.brand.findMany({
      include: {
        client: true,
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
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.client.count(),
  ]);

  const configsGenerated = brands.filter((b) => b.configVersion > 0).length;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brand Intelligence</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Convert brand systems into machine-readable AI configs
          </p>
        </div>
        <Button asChild>
          <Link href="/clients">
            <Plus className="mr-2 h-4 w-4" />
            New Brand
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: "Total Brands", value: brands.length.toString() },
          { label: "Configs Generated", value: configsGenerated.toString() },
          { label: "Active Clients", value: clientCount.toString() },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Brand list */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-[var(--muted-foreground)]">
          Recent Brands
        </h2>
        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed border-[var(--border)]">
            <Layers className="h-10 w-10 text-[var(--muted-foreground)] mb-4" />
            <p className="text-sm font-medium">No brands yet</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Go to Clients to add a client and create your first brand
            </p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/clients">Get started</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {brands.map((brand) => {
              const completed = moduleCount(brand as Record<string, unknown>);
              return (
                <Card key={brand.id} className="group hover:border-[var(--foreground)]/20 transition-colors">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
                      <Layers className="h-5 w-5 text-[var(--muted-foreground)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{brand.name}</h3>
                        <Badge variant={statusVariant[brand.status]}>
                          {statusLabel[brand.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {brand.client.name} · Updated {relativeTime(brand.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium">{completed}/10</p>
                        <p className="text-xs text-[var(--muted-foreground)]">modules</p>
                      </div>
                      <div className="h-8 w-24 rounded-full bg-[var(--muted)] overflow-hidden flex items-center">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full transition-all"
                          style={{ width: `${(completed / 10) * 100}%` }}
                        />
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/brands/${brand.id}/identity`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
