export function PageSkeleton() {
  return <div aria-label="데이터를 불러오는 중" aria-busy="true" className="animate-pulse space-y-4">
    <div className="h-8 w-48 rounded-lg bg-surface-raised" />
    <div className="h-4 w-72 max-w-full rounded bg-surface-raised" />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {[0,1,2].map((item)=><div key={item} className="rounded-card border border-border p-4"><div className="mb-4 h-28 rounded-xl bg-surface-raised"/><div className="mb-2 h-5 w-2/3 rounded bg-surface-raised"/><div className="h-4 w-1/2 rounded bg-surface-raised"/></div>)}
    </div>
  </div>;
}
