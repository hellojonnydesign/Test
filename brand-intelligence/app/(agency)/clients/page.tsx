import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { CreateClientDialog } from "@/components/create-client-dialog";

export const dynamic = "force-dynamic";

async function getOrCreateAgency() {
  let agency = await prisma.agency.findFirst();
  if (!agency) {
    agency = await prisma.agency.create({
      data: { name: "My Agency", slug: `agency-${Date.now()}` },
    });
  }
  return agency;
}

export default async function ClientsPage() {
  const agency = await getOrCreateAgency();

  const clients = await prisma.client.findMany({
    where: { agencyId: agency.id },
    include: { _count: { select: { brands: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Manage client accounts and their brands</p>
        </div>
        <CreateClientDialog agencyId={agency.id} />
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">No clients yet</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Add your first client to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-sm font-semibold">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{client.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {client._count.brands} brand{client._count.brands !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/clients/${client.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
