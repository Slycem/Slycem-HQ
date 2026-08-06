"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  navigationItems,
  NavigationItem,
} from "@/lib/navigation";

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-800 bg-slate-950 lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-800 px-6 py-6">
          <Link href="/" className="block">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
              SLYCEM
            </p>

            <h1 className="mt-1 text-2xl font-black text-white">
              HQ
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Business Operating System
            </p>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                isActive={isItemActive(
                  pathname,
                  item.href
                )}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Workspace
            </p>

            <p className="mt-2 font-black text-white">
              SLYCEM HQ
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Version 2 Foundation
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface SidebarLinkProps {
  item: NavigationItem;
  isActive: boolean;
}

function SidebarLink({
  item,
  isActive,
}: SidebarLinkProps) {
  return (
    <Link
      href={item.href}
      className={`group flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
        isActive
          ? "border-cyan-500/40 bg-cyan-500/10"
          : "border-transparent hover:border-slate-800 hover:bg-slate-900"
      }`}
    >
      <span className="mt-0.5 text-xl">
        {item.icon}
      </span>

      <span className="min-w-0">
        <span
          className={`block font-black ${
            isActive
              ? "text-cyan-300"
              : "text-slate-200 group-hover:text-white"
          }`}
        >
          {item.title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

function isItemActive(
  pathname: string,
  href: string
) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}