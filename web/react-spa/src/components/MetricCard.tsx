type MetricCardProps = {
  label: string;
  value: string;
};

export const MetricCard = ({ label, value }: MetricCardProps) => (
  <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
  </div>
);
