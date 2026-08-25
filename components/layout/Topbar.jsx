"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/utils";
import { RoleBadge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Topbar({ title }) {
  const { user, tenant, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClickAway = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        {/* Brand shows on mobile, where the sidebar is hidden. */}
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] lg:hidden">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{title}</h1>
          {tenant && <p className="truncate text-[11px] text-muted">{tenant.name}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-md py-1.5 pr-1.5 pl-1.5 transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-semibold text-white">
              {initials(user?.name)}
            </span>
            <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-30 mt-1.5 w-60 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-lg"
            >
              <div className="border-b border-[var(--border)] px-3.5 py-3">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <RoleBadge role={user?.role} />
                  <span className="truncate text-[11px] text-subtle">{tenant?.slug}</span>
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
