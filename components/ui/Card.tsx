import clsx from "@/lib/clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("bg-surface-card rounded-card p-4 mb-3.5", className)}>
      {children}
    </div>
  );
}
