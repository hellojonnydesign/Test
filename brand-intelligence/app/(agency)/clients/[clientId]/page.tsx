import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";
import { CreateBrandDialog } from "@/components/create-brand-dialog";

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

function moduleCount(brand: Record<string, unknown>) {
  return [
    brand.logoSystem, brand.colourSystem, brand.typography,
    brand.photography, brand.illustration, brand.motion,
    brand.iconography, brand.gridLayout, brand.pattern, brand.brandVoice,
  ].filter(Boolean).length;
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      brands: {
        include: {
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
      },
    },
  });

  if (!client) notFound();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[var(--muted-foreground)]" asChild>
              <Link href="/clients">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Clients
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {client.brands.length} brand{client.brands.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateBrandDialog clientId={client.id} />
      </div>

      {client.brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Layers className="h-10 w-10 text-[var(--muted-foreground)] mb-4" />
          <p className="text-sm font-medium">No brands yet</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Create the first brand for {client.name}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {client.brands.map((brand) => {
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
                      <Badge variant={statusVariant[brand.status]}>{statusLabel[brand.status]}</Badge>
                    </div>
                    {brand.description && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{brand.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-medium">{completed}/10</p>
                      <p className="text-xs text-[var(--muted-foreground)]">modules</p>
                    </div>
                    <div className="h-8 w-24 rounded-full bg-[var(--muted)] overflow-hidden flex items-center">
                      <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${(completed / 10) * 100}%` }} />
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
  );
}
