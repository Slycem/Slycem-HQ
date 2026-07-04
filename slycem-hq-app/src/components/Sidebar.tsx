type Module = {
  icon: string;
  title: string;
  desc: string;
};

type SidebarProps = {
  modules: Module[];
  activeModule: string;
  setActiveModule: (module: string) => void;
};

export default function Sidebar({
  modules,
  activeModule,
  setActiveModule,
}: SidebarProps) {
  return (
    <aside className="w-72 min-h-screen bg-slate-900 border-r border-slate-800 p-6">
      <h1 className="text-3xl font-black text-cyan-400">SLYCEM HQ</h1>
      <p className="text-sm text-slate-400 mt-1">
        Business Operating System
      </p>

      <nav className="mt-10 space-y-2">
        {modules.map((module) => (
          <button
            key={module.title}
            onClick={() => setActiveModule(module.title)}
            className={`w-full text-left rounded-xl px-4 py-3 transition ${
              activeModule === module.title
                ? "bg-cyan-400 text-slate-950 font-bold"
                : "hover:bg-slate-800"
            }`}
          >
            <span className="mr-3">{module.icon}</span>
            {module.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}