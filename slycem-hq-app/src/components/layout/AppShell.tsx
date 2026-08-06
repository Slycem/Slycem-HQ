"use client";

import { ReactNode, useState } from "react";

import AppSidebar from "@/components/layout/AppSidebar";
import MobileNavigation from "@/components/layout/MobileNavigation";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <AppSidebar />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur lg:hidden">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                SLYCEM
              </p>

              <p className="font-black text-white">
                HQ
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsMobileMenuOpen(true)
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 font-black text-white"
              aria-label="Open navigation menu"
            >
              Menu
            </button>
          </header>

          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        closeMenu={() =>
          setIsMobileMenuOpen(false)
        }
      />
    </div>
  );
}