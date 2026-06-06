export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-6 w-20 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="h-5 w-44 rounded bg-muted mb-4" />
          <div className="flex h-56 items-end justify-around gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-8 rounded-t bg-muted" style={{ height: `${30 + i * 10}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="h-5 w-40 rounded bg-muted mb-4" />
          <div className="flex h-56 items-center justify-center">
            <div className="h-40 w-40 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
