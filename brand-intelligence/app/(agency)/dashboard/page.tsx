import Link from "next/link";
import { Plus, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder data — replace with real DB queries once auth/DB is connected
const mockBrands = [
  {
    id: "brand-1",
    name: "Horizon Foods",
    client: "Horizon Group",
    status: "IN_PROGRESS",
    completedModules: 6,
    totalModules: 10,
    updatedAt: "2 hours ago",
  },
  {
    id: "brand-2",
    name: "Vault Finance",
    client: "Vault Capital",
    status: "COMPLETE",
    completedModules: 10,
    totalModules: 10,
    updatedAt: "1 day ago",
  },
  {
    id: "brand-3",
    name: "Studio Arc",
    client: "Arc Creative",
    status: "DRAFT",
    completedModules: 2,
    totalModules: 10,
    updatedAt: "3 days ago",
  },
];

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

export default function DashboardPage() {
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
          { label: "Total Brands", value: "12" },
          { label: "Configs Generated", value: "8" },
          { label: "Active Clients", value: "5" },
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
        <div className="grid gap-4">
          {mockBrands.map((brand) => (
            <Card key={brand.id} className="group hover:border-[var(--foreground)]/20 transition-colors">
              <CardContent className="flex items-center gap-4 p-5">
                {/* Logo placeholder */}
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
                    {brand.client} · Updated {brand.updatedAt}
                  </p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {brand.completedModules}/{brand.totalModules}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">modules</p>
                  </div>
                  <div className="h-8 w-24 rounded-full bg-[var(--muted)] overflow-hidden flex items-center">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all"
                      style={{
                        width: `${(brand.completedModules / brand.totalModules) * 100}%`,
                      }}
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
          ))}
        </div>
      </div>
    </div>
  );
}
