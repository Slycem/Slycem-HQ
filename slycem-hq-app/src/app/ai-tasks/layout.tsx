import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "AI Tasks | SLYCEM HQ" };

export default function AiTasksLayout({ children }: { children: ReactNode }) {
  return children;
}
