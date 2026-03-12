import { notFound } from "next/navigation";
import { BrandNav } from "@/components/layout/brand-nav";
import { prisma } from "@/lib/db/prisma";

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { id: true, name: true },
  });
  if (!brand) notFound();

  return (
    <div className="flex h-screen overflow-hidden">
      <BrandNav brandId={brand.id} brandName={brand.name} />
      <main className="flex-1 overflow-y-auto bg-[var(--background)]">
        {children}
      </main>
    </div>
  );
}
