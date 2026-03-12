import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockClients = [
  { id: "client-1", name: "Horizon Group", brands: 2, slug: "horizon-group" },
  { id: "client-2", name: "Vault Capital", brands: 1, slug: "vault-capital" },
  { id: "client-3", name: "Arc Creative", brands: 3, slug: "arc-creative" },
];

export default function ClientsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Manage client accounts and their brands</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      <div className="grid gap-4">
        {mockClients.map((client) => (
          <Card key={client.id}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-sm font-semibold">
                {client.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{client.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {client.brands} brand{client.brands !== 1 ? "s" : ""}
                </p>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
