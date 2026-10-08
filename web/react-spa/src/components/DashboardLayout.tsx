import type { ReactNode } from "react";

type NavItem = {
  current: boolean;
  href: string;
  label: string;
  link: ReactNode;
};

type DashboardLayoutProps = {
  children: ReactNode;
  navItems: NavItem[];
};

export const DashboardLayout = ({ children, navItems }: DashboardLayoutProps) => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/10 bg-slate-900/70 p-4 lg:border-b-0 lg:border-r">
        <div className="mb-8">
          <p className="text-sm font-medium text-cyan-300">React SPA</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <nav className="flex gap-2 lg:flex-col">
          {navItems.map((item) => (
            <div
              className={
                item.current
                  ? "rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950"
                  : "rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              }
              key={item.href}
            >
              {item.link}
            </div>
          ))}
        </nav>
      </aside>
      <main className="p-4 sm:p-8">{children}</main>
    </div>
  </div>
);
