"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Topbar } from "@/components/layout/Topbar";
import { NAV_ITEMS } from "@/components/layout/nav-items";

/**
 * Client-side route guard.
 *
 * This is a UX convenience — it keeps unauthenticated visitors out of the shell.
 * It is NOT the security boundary: every API call carries a JWT the server
 * verifies independently, so bypassing this reveals empty screens, not data.
 */
export default function DashboardLayout({ children }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  const active = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={active?.label ?? "Morsh CRM"} />
        <main className="flex-1 px-4 pt-5 pb-24 sm:px-6 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
