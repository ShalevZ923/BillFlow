export default function BillDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-6 w-16 rounded bg-muted" />
      </div>
      <div className="rounded-xl border border-border bg-white p-6 space-y-4">
        <div className="h-7 w-48 rounded bg-muted" />
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="h-9 w-24 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-5 w-24 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
