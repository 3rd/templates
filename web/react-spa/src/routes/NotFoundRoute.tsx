import { Link } from "wouter";

export const NotFoundRoute = () => (
  <section>
    <h2 className="text-3xl font-semibold tracking-tight">Not found</h2>
    <p className="mt-2 text-slate-400">That route does not exist.</p>
    <Link className="mt-6 inline-flex rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950" href="/dashboard">
      Back to dashboard
    </Link>
  </section>
);
