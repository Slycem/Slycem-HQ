"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  navigationItems,
  NavigationItem,
} from "@/lib/navigation";

interface MobileNavigationProps {
  isOpen: boolean;
  closeMenu: () => void;
}

export default function MobileNavigation({
  isOpen,
  closeMenu,
}: MobileNavigationProps) {
  const pathname = usePathname();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        onClick={closeMenu}
        className="absolute inset-0 bg-black/70"
        aria-label="Close navigation menu"
      />

      <aside className="relative z-10 h-full w-[88%] max-w-sm border-r border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
          <Link
            href="/"
            onClick={closeMenu}
            className="block"
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
              SLYCEM
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              HQ
            </h2>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-black text-white"
            aria-label="Close navigation menu"
          >
            Close
          </button>
        </div>

        <nav className="h-[calc(100%-88px)] overflow-y-auto px-4 py-5">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <MobileNavigationLink
                key={item.href}
                item={item}
                isActive={isItemActive(
                  pathname,
                  item.href
                )}
                closeMenu={closeMenu}
              />
            ))}
          </div>
        </nav>
      </aside>
    </div>
  );
}

interface MobileNavigationLinkProps {
  item: NavigationItem;
  isActive: boolean;
  closeMenu: () => void;
}

function MobileNavigationLink({
  item,
  isActive,
  closeMenu,
}: MobileNavigationLinkProps) {
  return (
    <Link
      href={item.href}
      onClick={closeMenu}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
        isActive
          ? "border-cyan-500/40 bg-cyan-500/10"
          : "border-transparent hover:border-slate-800 hover:bg-slate-900"
      }`}
    >
      <span className="mt-0.5 text-xl">
        {item.icon}
      </span>

      <span>
        <span
          className={`block font-black ${
            isActive
              ? "text-cyan-300"
              : "text-slate-200"
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