export function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-page rounded-card p-4">
      <p className="text-caption text-text-secondary mb-1.5">{label}</p>
      <p className="text-title">{value}</p>
    </div>
  );
}
