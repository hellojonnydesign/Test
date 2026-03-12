"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[var(--border)] bg-[var(--card)]">
      <div className="flex h-14 items-center border-b border-[var(--border)] px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--primary)]">
            <Layers className="h-3.5 w-3.5 text-[var(--primary-foreground)]" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Brand Intelligence
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === href
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-medium"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2.5 rounded-md px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold">
            JK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">JKR Global</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              Agency Admin
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
        </div>
      </div>
    </aside>
  );
}
