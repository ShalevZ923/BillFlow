export default function PaymentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-36 rounded-md bg-muted" />
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <div className="grid grid-cols-7 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-4 w-16 rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-7 gap-4 px-4 py-3">
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <div key={j} className="h-5 w-20 rounded bg-muted" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
