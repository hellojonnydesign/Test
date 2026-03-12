import { BrandNav } from "@/components/layout/brand-nav";

// In production this would fetch brand from DB
async function getBrand(brandId: string) {
  return { id: brandId, name: "Horizon Foods" };
}

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const brand = await getBrand(brandId);

  return (
    <div className="flex h-screen overflow-hidden">
      <BrandNav brandId={brand.id} brandName={brand.name} />
      <main className="flex-1 overflow-y-auto bg-[var(--background)]">
        {children}
      </main>
    </div>
  );
}
