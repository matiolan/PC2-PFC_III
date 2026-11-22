export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink-200/70" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-ink-200/50" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-ink-200/70" />
        ))}
      </div>
    </div>
  );
}
