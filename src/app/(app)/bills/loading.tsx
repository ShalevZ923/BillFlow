export default function BillsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-9 w-64 rounded-md bg-muted" />
        <div className="h-9 w-[130px] rounded-md bg-muted" />
        <div className="h-9 w-[130px] rounded-md bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
              </div>
              <div className="h-5 w-16 rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-14 rounded-full bg-muted" />
              <div className="h-5 w-16 rounded bg-muted" />
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 w-12 rounded bg-muted" />
              <div className="h-5 w-12 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
