"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Palette,
  Type,
  Camera,
  Pen,
  Play,
  Grid3x3,
  Square,
  MessageSquare,
  FileUp,
  Zap,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const brandSections = [
  {
    group: "Identity System",
    items: [
      { href: "identity", label: "Logo System", icon: Layers },
      { href: "identity/colours", label: "Colours", icon: Palette },
      { href: "identity/typography", label: "Typography", icon: Type },
      { href: "identity/iconography", label: "Iconography", icon: Grid3x3 },
    ],
  },
  {
    group: "Visual Language",
    items: [
      { href: "visual-language/photography", label: "Photography", icon: Camera },
      { href: "visual-language/illustration", label: "Illustration", icon: Pen },
      { href: "visual-language/pattern", label: "Pattern & Texture", icon: Square },
      { href: "visual-language/layout", label: "Layout & Grid", icon: Grid3x3 },
    ],
  },
  {
    group: "Motion",
    items: [
      { href: "motion", label: "Motion & Animation", icon: Play },
    ],
  },
  {
    group: "Brand Voice",
    items: [
      { href: "voice", label: "Voice & Tone", icon: MessageSquare },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { href: "import", label: "Import Guidelines PDF", icon: FileUp },
      { href: "outputs", label: "AI Outputs", icon: Zap },
    ],
  },
];

interface BrandNavProps {
  brandId: string;
  brandName: string;
}

export function BrandNav({ brandId, brandName }: BrandNavProps) {
  const pathname = usePathname();
  const base = `/brands/${brandId}`;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]">
      <div className="flex h-14 items-center border-b border-[var(--border)] px-4 gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-[var(--muted-foreground)]">Brand</p>
          <p className="text-sm font-semibold truncate">{brandName}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {brandSections.map((section) => (
          <div key={section.group} className="mb-4">
            <p className="mb-1 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const fullHref = `${base}/${href}`;
                const isActive =
                  pathname === fullHref || pathname.startsWith(fullHref + "/");
                return (
                  <li key={href}>
                    <Link
                      href={fullHref}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-medium"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
