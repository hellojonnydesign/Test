import { Sidebar } from "@/components/layout/sidebar";
import { getSessionUser } from "@/lib/auth/session";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
