import { MetricCard } from "../components/MetricCard";

export const DashboardRoute = () => (
  <section>
    <div className="mb-6">
      <h2 className="text-3xl font-semibold tracking-tight">Overview</h2>
      <p className="mt-2 max-w-2xl text-slate-400">A small routed dashboard shell ready for app-specific data.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard label="Open tasks" value="12" />
      <MetricCard label="Deploys" value="4" />
      <MetricCard label="Alerts" value="0" />
    </div>
  </section>
);
