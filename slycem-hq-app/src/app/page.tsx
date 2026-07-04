"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import PrintHQ from "../components/PrintHQ";

const modules = [
  { icon: "📊", title: "Dashboard", desc: "Daily command center" },
  { icon: "🖨️", title: "3D Print HQ", desc: "Orders, prints, materials" },
  { icon: "🎥", title: "Content HQ", desc: "TikTok, YouTube, streaming" },
  { icon: "💰", title: "Affiliate HQ", desc: "Amazon and TikTok Shop" },
  { icon: "🥬", title: "Produce HQ", desc: "Inventory and sales" },
  { icon: "🚗", title: "Dealership HQ", desc: "CRM and performance" },
  { icon: "📈", title: "Finance HQ", desc: "Cash flow and profit" },
  { icon: "🤖", title: "AI Automation", desc: "Agents and workflows" },
  { icon: "✅", title: "Tasks", desc: "Today’s action list" },
];

export default function Home() {
  const [activeModule, setActiveModule] = useState("Dashboard");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <Sidebar
          modules={modules}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />

        <section className="flex-1 p-10">
          <p className="text-cyan-400 font-semibold">Command Center</p>

          <h2 className="text-5xl font-black mt-2">
            {activeModule === "Dashboard"
              ? "Welcome back, Jared."
              : activeModule}
          </h2>

          {activeModule === "3D Print HQ" ? (
            <PrintHQ />
          ) : (
            <div className="mt-10 rounded-2xl bg-slate-900 border border-slate-800 p-8">
              <h3 className="text-3xl font-bold">{activeModule}</h3>
              <p className="text-slate-400 mt-3">
                This module is ready to be built next.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}